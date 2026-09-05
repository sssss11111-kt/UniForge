import type { AgentDefinition } from './definition.js';
import type { Id, Instant, Json, RequestContext, Result } from '../domain/primitives.js';

export type AgentRunStatus =
  | 'CREATED' | 'RUNNING' | 'WAITING_APPROVAL' | 'PAUSED'
  | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TerminalRunStatus = 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type AgentEventType =
  | 'RunCreated' | 'RunStarted' | 'PlanCreated' | 'StepStarted' | 'StepCompleted'
  | 'ToolCallStarted' | 'ToolCallCompleted' | 'ApprovalRequested' | 'ApprovalResolved'
  | 'RunPaused' | 'RunResumed' | 'RunInterrupted' | 'RunCheckpointed'
  | 'RunCompleted' | 'RunFailed' | 'RunCancelled';

export interface AgentRun {
  id: Id<'agent-run'>;
  workspaceId: Id<'workspace'>;
  taskId: Id<'task'>;
  definitionId: Id<'agent-definition'>;
  definitionVersion: number;
  runtime: string;
  status: AgentRunStatus;
  version: number;
  lastSeq: number;
  createdAt: Instant;
  updatedAt: Instant;
}
export interface AgentEvent<T extends Json = Json> {
  globalSeq: number;
  eventId: Id<'agent-event'>;
  runId: Id<'agent-run'>;
  runSeq: number;
  workspaceId: Id<'workspace'>;
  type: AgentEventType;
  occurredAt: Instant;
  correlationId: string;
  payload: T;
}
export interface AgentCheckpoint { id: string; runtime: string; adapterVersion: string; cursor: Json; }
export interface AgentStreamItem { event: AgentEvent; disconnected?: boolean; }
export interface AgentRuntime {
  createRun(context: RequestContext, input: CreateRunInput): Promise<Result<AgentRun>>;
  start(context: RequestContext, runId: Id<'agent-run'>): Promise<Result<AgentRun>>;
  stream(context: RequestContext, runId: Id<'agent-run'>, afterSeq?: number): AsyncIterable<AgentStreamItem>;
  pause(context: RequestContext, runId: Id<'agent-run'>, reason: string): Promise<Result<AgentRun>>;
  resume(context: RequestContext, runId: Id<'agent-run'>): Promise<Result<AgentRun>>;
  cancel(context: RequestContext, runId: Id<'agent-run'>, reason?: string): Promise<Result<AgentRun>>;
  interrupt(context: RequestContext, runId: Id<'agent-run'>, reason?: string): Promise<Result<AgentRun>>;
  checkpoint(context: RequestContext, runId: Id<'agent-run'>, checkpoint: AgentCheckpoint): Promise<Result<AgentRun>>;
  fork(context: RequestContext, runId: Id<'agent-run'>): Promise<Result<AgentRun>>;
  inspect(context: RequestContext, runId: Id<'agent-run'>): Promise<Result<AgentRun>>;
}
export interface CreateRunInput {
  taskId: Id<'task'>;
  definition: AgentDefinition;
  runtime: string;
}
