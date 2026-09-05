import { failure, type AgentCheckpoint, type AgentRun, type CreateRunInput, type Id, type RequestContext, type Result } from '@uniforge/contracts';
import { RunService } from '../run-service.js';
import { unavailableFoundationGraph, type FoundationGraph } from './foundation-graph.js';

export interface RuntimeCheckpoint { schemaVersion: 1; adapterVersion: string; runId: string; cursor: string; state: RuntimeState; stateHash: string; }
export interface RuntimeCheckpointStore { save(checkpoint: RuntimeCheckpoint): Promise<void>; load(runId: string): Promise<RuntimeCheckpoint | undefined>; }
export class InMemoryRuntimeCheckpointStore implements RuntimeCheckpointStore {
  private readonly records = new Map<string, RuntimeCheckpoint>();
  async save(c: RuntimeCheckpoint) { this.records.set(c.runId, structuredClone(c)); }
  async load(runId: string) { const c = this.records.get(runId); return c && structuredClone(c); }
  values() { return [...this.records.values()]; }
}
export interface RuntimeState { phase: 'start' | 'planned' | 'read' | 'approval' | 'written' | 'completed'; readResult?: string; }
export interface LangGraphAdapterOptions { checkpointStore: RuntimeCheckpointStore; graph?: FoundationGraph; runService?: RunService; }
const hash = async (state: RuntimeState) => { const bytes = new TextEncoder().encode(JSON.stringify(state)); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join(''); };

export class LangGraphAdapter {
  readonly runtime = 'langgraph';
  private readonly runs: RunService;
  constructor(private readonly options: LangGraphAdapterOptions) { this.runs = options.runService ?? new RunService(); }
  createRun(c: RequestContext, input: CreateRunInput): Promise<Result<AgentRun>> { return this.runs.createRun(c, { ...input, runtime: 'langgraph' }); }
  start(c: RequestContext, id: Id<'agent-run'>) { return this.runs.start(c, id); }
  inspect(c: RequestContext, id: Id<'agent-run'>) { return this.runs.inspect(c, id); }
  stream(c: RequestContext, id: Id<'agent-run'>, after = 0) { return this.runs.stream(c, id, after); }
  pause(c: RequestContext, id: Id<'agent-run'>, reason: string) { return this.runs.pause(c, id, reason); }
  resume(c: RequestContext, id: Id<'agent-run'>) { return this.runs.resume(c, id); }
  cancel(c: RequestContext, id: Id<'agent-run'>, reason?: string) { return this.runs.cancel(c, id, reason); }
  interrupt(c: RequestContext, id: Id<'agent-run'>, reason?: string) { return this.runs.interrupt(c, id, reason); }
  requestApproval(c: RequestContext, id: Id<'agent-run'>, reason: string) { return this.runs.requestApproval(c, id, reason); }
  checkpoint(c: RequestContext, id: Id<'agent-run'>, cp: AgentCheckpoint) { return this.runs.checkpoint(c, id, cp); }
  async execute(c: RequestContext, id: Id<'agent-run'>, options: { signal?: AbortSignal; approve?: boolean } = {}): Promise<Result<AgentRun>> {
    if (options.signal?.aborted) return failure('CANCELLED', 'LangGraph execution cancelled', c.correlationId);
    const current = await this.runs.inspect(c, id); if (!current.ok) return current;
    if (current.value.status === 'CREATED') { const started = await this.runs.start(c, id); if (!started.ok) return started; }
    const existing = await this.options.checkpointStore.load(id);
    if (existing && existing.adapterVersion !== '0.1.0') return failure('UNAVAILABLE', 'Checkpoint adapter version is incompatible', c.correlationId);
    let state: RuntimeState = existing?.state ?? { phase: 'start' };
    if (state.phase === 'approval' && !options.approve) { return this.runs.requestApproval(c, id, 'LangGraph write requires approval'); }
    if (state.phase === 'approval' && options.approve) {
      const resolved = await this.runs.resolveApproval(c, id);
      if (!resolved.ok) return resolved;
      const resumed = await this.runs.resume(c, id);
      if (!resumed.ok) return resumed;
    }
    try {
      state = await (this.options.graph ?? unavailableFoundationGraph()).invoke(state, options.signal ? { interruptBeforeWrite: !options.approve, signal: options.signal } : { interruptBeforeWrite: !options.approve });
      const cp: RuntimeCheckpoint = { schemaVersion: 1, adapterVersion: '0.1.0', runId: id, cursor: state.phase, state, stateHash: await hash(state) };
      await this.options.checkpointStore.save(cp);
      return state.phase === 'completed' ? this.runs.complete(c, id) : this.runs.requestApproval(c, id, 'LangGraph write requires approval');
    } catch (error) {
      return this.runs.fail(c, id, error instanceof Error ? error.message : 'LangGraph execution failed');
    }
  }
}
