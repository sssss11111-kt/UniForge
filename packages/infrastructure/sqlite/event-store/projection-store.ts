import type { DatabaseHandle } from '../database.js';
import { SqliteDomainEventStore } from './domain-event-store.js';
import type { EntityId } from '@uniforge/contracts/domain/primitives.js';
import type { Projection } from '@uniforge/core/events/ports.js';
export class SqliteProjectionStore {
  constructor(
    private readonly handle: DatabaseHandle,
    private readonly events = new SqliteDomainEventStore(handle),
  ) {}
  async project(workspaceId: EntityId, projection: Projection): Promise<number> {
    const offset = this.handle.db
      .prepare(
        'SELECT last_seq FROM projection_offsets WHERE workspace_id = ? AND projection_name = ?',
      )
      .get(workspaceId, projection.name) as { last_seq: number } | undefined;
    const rows = await this.events.read(workspaceId, offset?.last_seq ?? 0, 10000);
    for (const event of rows) await projection.apply(event);
    const last = rows.length
      ? Number((rows.at(-1) as { seq: number }).seq)
      : (offset?.last_seq ?? 0);
    this.handle.db
      .prepare(
        'INSERT INTO projection_offsets (workspace_id,projection_name,last_seq) VALUES (?,?,?) ON CONFLICT(workspace_id,projection_name) DO UPDATE SET last_seq=excluded.last_seq',
      )
      .run(workspaceId, projection.name, last);
    return last;
  }
  async rebuild(workspaceId: EntityId, projection: Projection): Promise<void> {
    this.handle.db
      .prepare('DELETE FROM projection_offsets WHERE workspace_id = ? AND projection_name = ?')
      .run(workspaceId, projection.name);
    await this.project(workspaceId, projection);
  }
}
