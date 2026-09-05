import { describe, expect, it } from 'vitest';
import { openDatabase } from '../../packages/infrastructure/sqlite/database.js';
import { migrate } from '../../packages/infrastructure/sqlite/migration-runner.js';
import { SqliteDomainEventStore } from '../../packages/infrastructure/sqlite/event-store/domain-event-store.js';

describe('foundation command event persistence', () => {
  it('keeps duplicate aggregate versions from being appended', async () => {
    const db = await openDatabase(':memory:', 'readwrite');
    await migrate(db);
    const store = new SqliteDomainEventStore(db);
    const event = {
      type: 'workspace.created' as const,
      eventId:
        'evt_command' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
      occurredAt:
        '2026-01-01T00:00:00.000Z' as unknown as import('@uniforge/contracts/domain/primitives.js').IsoUtc,
      aggregateId:
        'ws_command' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
      aggregateVersion: 1,
      name: 'Command',
    };
    db.db
      .prepare(
        'INSERT INTO workspaces (id,name,root_handle,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
      )
      .run('ws_command', 'Command', 'root', 'ACTIVE', 1, event.occurredAt, event.occurredAt);
    await store.append(
      [event],
      'ws_command' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
    );
    await expect(
      store.append(
        [event],
        'ws_command' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
      ),
    ).rejects.toThrow();
    db.close();
  });
});
