import type { AgentDefinition } from './definition.js';
import type { AgentEvent, AgentRun } from './runtime.js';
import type { Id } from '../domain/primitives.js';

export interface AgentCenterRunDto extends AgentRun {
  readonly eventCount: number;
}
export interface AgentCenterSnapshotDto {
  readonly runs: readonly AgentCenterRunDto[];
  readonly events: Readonly<Record<string, readonly AgentEvent[]>>;
  readonly approvals: readonly AgentCenterRunDto[];
}
export interface CreateAgentRunInput {
  readonly taskId: Id<'task'>;
  readonly definition: AgentDefinition;
  readonly runtime: string;
}
