import type { DomainEvent } from '@uniforge/contracts/domain/events.js';
import type { EntityId } from '@uniforge/contracts/domain/primitives.js';
import type { DatabaseHandle } from '../database.js';

export interface StoredDomainEvent {
  seq: number;
  eventId: EntityId;
  eventType: string;
  aggregateType: string;
  aggregateId: EntityId;
  aggregateVersion: number;
  workspaceId: EntityId;
  occurredAt: string;
  actorId: EntityId;
  correlationId: string;
  causationId?: string;
  schemaVersion: number;
  payload: Record<string, unknown>;
}
type Row = Record<string, unknown>;
const text = (r: Row, k: string) => String(r[k] ?? '');

export class SqliteDomainEventStore {
  constructor(private readonly handle: DatabaseHandle) {}
  async append(
    events: readonly DomainEvent[],
    workspaceId?: EntityId,
    actorId: EntityId = 'system' as EntityId,
    correlationId = 'system',
  ): Promise<void> {
    const statement = this.handle.db.prepare(
      'INSERT INTO domain_events (event_id,workspace_id,aggregate_type,aggregate_id,aggregate_version,event_type,occurred_at,actor_id,correlation_id,causation_id,schema_version,payload) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    );
    for (const event of events) {
      const resolvedWorkspace =
        workspaceId ?? ('workspaceId' in event ? event.workspaceId : undefined);
      if (!resolvedWorkspace) throw new Error('workspaceId is required for this event');
      const aggregateType = event.type.startsWith('workspace.') ? 'workspace' : 'task';
      const payload = { ...event } as unknown as Record<string, unknown>;
      statement.run(
        event.eventId,
        resolvedWorkspace,
        aggregateType,
        event.aggregateId,
        event.aggregateVersion,
        event.type,
        event.occurredAt,
        actorId,
        correlationId,
        null,
        1,
        JSON.stringify(payload),
      );
    }
  }
  async read(workspaceId: EntityId, afterSeq: number, limit: number): Promise<StoredDomainEvent[]> {
    const rows = this.handle.db
      .prepare(
        'SELECT * FROM domain_events WHERE workspace_id = ? AND seq > ? ORDER BY seq LIMIT ?',
      )
      .all(workspaceId, afterSeq, limit) as Row[];
    return rows.map((row) => ({
      seq: Number(row.seq),
      eventId: text(row, 'event_id') as EntityId,
      eventType: text(row, 'event_type'),
      aggregateType: text(row, 'aggregate_type'),
      aggregateId: text(row, 'aggregate_id') as EntityId,
      aggregateVersion: Number(row.aggregate_version),
      workspaceId: text(row, 'workspace_id') as EntityId,
      occurredAt: text(row, 'occurred_at'),
      actorId: text(row, 'actor_id') as EntityId,
      correlationId: text(row, 'correlation_id'),
      ...(row.causation_id ? { causationId: text(row, 'causation_id') } : {}),
      schemaVersion: Number(row.schema_version),
      payload: JSON.parse(text(row, 'payload')) as Record<string, unknown>,
    }));
  }
}
