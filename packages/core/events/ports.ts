import type { DomainEvent } from '@uniforge/contracts/domain/events.js';
import type { EntityId } from '@uniforge/contracts/domain/primitives.js';
export interface DomainEventStore {
  append(events: readonly DomainEvent[], workspaceId?: EntityId): Promise<void>;
  read(workspaceId: EntityId, afterSeq: number, limit: number): Promise<readonly unknown[]>;
}
export interface Projection {
  readonly name: string;
  apply(event: unknown): Promise<void> | void;
}
