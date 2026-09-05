import type { EntityId, IsoUtc } from './primitives.js';
export interface DomainEventBase {
  eventId: EntityId;
  occurredAt: IsoUtc;
  aggregateId: EntityId;
  aggregateVersion: number;
}
export interface TaskCreatedEvent extends DomainEventBase {
  type: 'task.created';
  workspaceId: EntityId;
  title: string;
}
export interface TaskCompletedEvent extends DomainEventBase {
  type: 'task.completed';
}
export interface WorkspaceCreatedEvent extends DomainEventBase {
  type: 'workspace.created';
  name: string;
}
export type DomainEvent = TaskCreatedEvent | TaskCompletedEvent | WorkspaceCreatedEvent;
