import {
  failure,
  type AgentEvent,
  type AgentCenterSnapshotDto,
  type AgentRun,
  type Id,
  type RequestContext,
  type Result,
} from '@uniforge/contracts';
import { RunService } from './run-service.js';

export type { CreateAgentRunInput } from '@uniforge/contracts';
import type { CreateAgentRunInput } from '@uniforge/contracts';

const denied = (context: RequestContext, capability: string): Result<never> =>
  failure('DENIED', `Permission required: ${capability}`, context.correlationId);

export class AgentCenterService {
  constructor(private readonly runtime: RunService = new RunService()) {}

  async createRun(context: RequestContext, input: CreateAgentRunInput): Promise<Result<AgentRun>> {
    if (!context.permissions?.includes('agent:run:create'))
      return denied(context, 'agent:run:create');
    return this.runtime.createRun(context, input);
  }

  async start(context: RequestContext, runId: Id<'agent-run'>): Promise<Result<AgentRun>> {
    if (!context.permissions?.includes('agent:run:control'))
      return denied(context, 'agent:run:control');
    return this.runtime.start(context, runId);
  }

  async requestApproval(
    context: RequestContext,
    runId: Id<'agent-run'>,
    reason: string,
  ): Promise<Result<AgentRun>> {
    if (!context.permissions?.includes('agent:approval:request'))
      return denied(context, 'agent:approval:request');
    return this.runtime.requestApproval(context, runId, reason);
  }

  async resolveApproval(
    context: RequestContext,
    runId: Id<'agent-run'>,
  ): Promise<Result<AgentRun>> {
    if (!context.permissions?.includes('agent:approval:resolve'))
      return denied(context, 'agent:approval:resolve');
    return this.runtime.resolveApproval(context, runId);
  }

  async rejectApproval(
    context: RequestContext,
    runId: Id<'agent-run'>,
    reason: string,
  ): Promise<Result<AgentRun>> {
    if (!context.permissions?.includes('agent:approval:resolve'))
      return denied(context, 'agent:approval:resolve');
    return this.runtime.fail(context, runId, reason);
  }

  async cancel(
    context: RequestContext,
    runId: Id<'agent-run'>,
    reason?: string,
  ): Promise<Result<AgentRun>> {
    if (!context.permissions?.includes('agent:run:control'))
      return denied(context, 'agent:run:control');
    return this.runtime.cancel(context, runId, reason);
  }

  async getSnapshot(context: RequestContext): Promise<AgentCenterSnapshotDto> {
    const runs = this.runtime.listRuns(context.workspaceId).map((run) => {
      const events = this.runtime.events(run.id);
      return { ...run, eventCount: events.length };
    });
    const events: Record<string, readonly AgentEvent[]> = {};
    for (const run of runs) events[run.id] = this.runtime.events(run.id);
    return {
      runs,
      events,
      approvals: runs.filter((run) => run.status === 'WAITING_APPROVAL'),
    };
  }
}
