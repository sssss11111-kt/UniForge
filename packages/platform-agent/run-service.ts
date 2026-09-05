import {
  failure,
  type AgentCheckpoint,
  type AgentEvent,
  type AgentRun,
  type AgentRuntime,
  type CreateRunInput,
  type Id,
  type Instant,
  type RequestContext,
  type Result,
} from '@uniforge/contracts';
import { InMemoryAgentEventStore, type AgentEventStore } from './agent-event-store.js';
import { canTransition, reduceAgentEvents } from './recovery.js';

const now = (): Instant => new Date().toISOString() as Instant;
const id = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;

export class RunService implements AgentRuntime {
  private readonly definitions = new Map<string, CreateRunInput>();
  constructor(private readonly store: AgentEventStore = new InMemoryAgentEventStore()) {}

  private get(context: RequestContext, runId: Id<'agent-run'>): Result<AgentRun> {
    const run = this.store.snapshot(runId);
    if (!run) return failure('NOT_FOUND', 'Agent run not found', context.correlationId);
    if (run.workspaceId !== context.workspaceId)
      return failure('DENIED', 'Run is outside workspace', context.correlationId);
    return { ok: true, value: run };
  }
  private emit(
    context: RequestContext,
    run: AgentRun,
    type: AgentEvent['type'],
    payload: Record<string, unknown> = {},
  ): Result<AgentRun> {
    const occurredAt = now();
    const event: AgentEvent = {
      globalSeq: run.lastSeq + 1,
      eventId: id('event') as Id<'agent-event'>,
      runId: run.id,
      runSeq: run.lastSeq + 1,
      workspaceId: run.workspaceId,
      type,
      occurredAt,
      correlationId: context.correlationId,
      payload: payload as AgentEvent['payload'],
    };
    try {
      this.store.append(event);
      const next = reduceAgentEvents([event], run);
      if (!next)
        return failure('CONFLICT', 'Run snapshot could not be rebuilt', context.correlationId);
      this.store.saveSnapshot(next);
      return { ok: true, value: next };
    } catch (error) {
      return failure(
        'CONFLICT',
        error instanceof Error ? error.message : 'Agent event rejected',
        context.correlationId,
      );
    }
  }
  async createRun(context: RequestContext, input: CreateRunInput): Promise<Result<AgentRun>> {
    if (
      context.workspaceId !== context.workspaceId ||
      input.definition.version < 1 ||
      !input.runtime
    )
      return failure('INVALID_INPUT', 'Invalid run input', context.correlationId);
    const run = {
      id: id('run') as Id<'agent-run'>,
      workspaceId: context.workspaceId,
      taskId: input.taskId,
      definitionId: input.definition.id,
      definitionVersion: input.definition.version,
      runtime: input.runtime,
      status: 'CREATED' as const,
      version: 1,
      lastSeq: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    this.store.saveSnapshot(run);
    this.definitions.set(run.id, input);
    const result = this.emit(context, { ...run, lastSeq: 0 }, 'RunCreated', {
      taskId: input.taskId,
      definitionId: input.definition.id,
      definitionVersion: input.definition.version,
      runtime: input.runtime,
    });
    return result;
  }
  private transition(
    context: RequestContext,
    runId: Id<'agent-run'>,
    to: 'RUNNING' | 'PAUSED' | 'CANCELLED',
    type: AgentEvent['type'],
    payload: Record<string, unknown> = {},
  ): Result<AgentRun> {
    const found = this.get(context, runId);
    if (!found.ok) return found;
    if (found.value.status === 'CANCELLED' && to === 'CANCELLED') return found;
    if (!canTransition(found.value.status, to))
      return failure(
        'INVALID_TRANSITION',
        `Cannot transition ${found.value.status} to ${to}`,
        context.correlationId,
      );
    return this.emit(context, found.value, type, payload);
  }
  async start(c: RequestContext, r: Id<'agent-run'>): Promise<Result<AgentRun>> {
    return this.transition(c, r, 'RUNNING', 'RunStarted');
  }
  async pause(c: RequestContext, r: Id<'agent-run'>, reason: string): Promise<Result<AgentRun>> {
    return this.transition(
      c,
      r,
      reason.toLowerCase().includes('approval') ? 'PAUSED' : 'PAUSED',
      'RunPaused',
      { reason, approval: reason.toLowerCase().includes('approval') },
    );
  }
  async resume(c: RequestContext, r: Id<'agent-run'>): Promise<Result<AgentRun>> {
    const found = this.get(c, r);
    if (!found.ok) return found;
    if (found.value.status === 'WAITING_APPROVAL')
      return failure('APPROVAL_REQUIRED', 'Approval is required before resume', c.correlationId);
    if (found.value.status !== 'PAUSED')
      return failure('INVALID_TRANSITION', 'Only a paused run can resume', c.correlationId);
    return this.transition(c, r, 'RUNNING', 'RunResumed');
  }
  async cancel(
    c: RequestContext,
    r: Id<'agent-run'>,
    reason = 'cancelled',
  ): Promise<Result<AgentRun>> {
    return this.transition(c, r, 'CANCELLED', 'RunCancelled', { reason });
  }
  async interrupt(
    c: RequestContext,
    r: Id<'agent-run'>,
    reason = 'interrupted',
  ): Promise<Result<AgentRun>> {
    return this.transition(c, r, 'PAUSED', 'RunInterrupted', { reason });
  }
  async checkpoint(
    c: RequestContext,
    r: Id<'agent-run'>,
    checkpoint: AgentCheckpoint,
  ): Promise<Result<AgentRun>> {
    const found = this.get(c, r);
    if (!found.ok) return found;
    return this.emit(c, found.value, 'RunCheckpointed', { checkpoint });
  }
  async fork(c: RequestContext, r: Id<'agent-run'>): Promise<Result<AgentRun>> {
    const found = this.get(c, r);
    if (!found.ok) return found;
    const input = this.definitions.get(r);
    if (!input)
      return failure('UNAVAILABLE', 'Run definition is unavailable for fork', c.correlationId);
    return this.createRun(c, { ...input, definition: { ...input.definition } });
  }
  async inspect(c: RequestContext, r: Id<'agent-run'>): Promise<Result<AgentRun>> {
    return this.get(c, r);
  }
  async *stream(
    c: RequestContext,
    r: Id<'agent-run'>,
    afterSeq = 0,
  ): AsyncIterable<{ event: AgentEvent; disconnected?: boolean }> {
    const found = this.get(c, r);
    if (!found.ok) return;
    for (const event of this.store.events(r, afterSeq)) {
      if (event.workspaceId !== c.workspaceId) return;
      yield { event };
    }
  }
  async requestApproval(
    c: RequestContext,
    r: Id<'agent-run'>,
    reason: string,
  ): Promise<Result<AgentRun>> {
    return this.transition(c, r, 'PAUSED', 'RunPaused', { reason, approval: true });
  }
  async resolveApproval(c: RequestContext, r: Id<'agent-run'>): Promise<Result<AgentRun>> {
    const found = this.get(c, r);
    if (!found.ok) return found;
    if (found.value.status !== 'WAITING_APPROVAL')
      return failure('INVALID_TRANSITION', 'Run is not waiting for approval', c.correlationId);
    return this.emit(c, found.value, 'ApprovalResolved', {});
  }
  async complete(c: RequestContext, r: Id<'agent-run'>): Promise<Result<AgentRun>> {
    const found = this.get(c, r);
    if (!found.ok) return found;
    if (!canTransition(found.value.status, 'COMPLETED'))
      return failure('INVALID_TRANSITION', 'Run is not running', c.correlationId);
    return this.emit(c, found.value, 'RunCompleted', {});
  }
  async fail(c: RequestContext, r: Id<'agent-run'>, reason: string): Promise<Result<AgentRun>> {
    const found = this.get(c, r);
    if (!found.ok) return found;
    if (!canTransition(found.value.status, 'FAILED'))
      return failure('INVALID_TRANSITION', 'Run is not running', c.correlationId);
    return this.emit(c, found.value, 'RunFailed', { reason });
  }
}
