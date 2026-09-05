import { describe, expect, it } from 'vitest';
import { openDatabase } from '../../packages/infrastructure/sqlite/database.js';
import { migrate } from '../../packages/infrastructure/sqlite/migration-runner.js';
import { SqliteDomainEventStore } from '../../packages/infrastructure/sqlite/event-store/domain-event-store.js';
import { SqliteProjectionStore } from '../../packages/infrastructure/sqlite/event-store/projection-store.js';

describe('projection recovery', () => {
  it('rebuilds a projection from immutable events', async () => {
    const db = await openDatabase(':memory:', 'readwrite');
    await migrate(db);
    const events = new SqliteDomainEventStore(db);
    db.db
      .prepare(
        'INSERT INTO workspaces (id,name,root_handle,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
      )
      .run(
        'ws_rebuild',
        'Rebuild',
        'root',
        'ACTIVE',
        1,
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      );
    await events.append(
      [
        {
          type: 'workspace.created',
          eventId:
            'evt_rebuild' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
          occurredAt:
            '2026-01-01T00:00:00.000Z' as unknown as import('@uniforge/contracts/domain/primitives.js').IsoUtc,
          aggregateId:
            'ws_rebuild' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
          aggregateVersion: 1,
          name: 'Rebuild',
        },
      ],
      'ws_rebuild' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
    );
    const seen: unknown[] = [];
    const store = new SqliteProjectionStore(db);
    const projection = {
      name: 'test',
      apply: (event: unknown) => {
        seen.push(event);
      },
    };
    await store.project(
      'ws_rebuild' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
      projection,
    );
    expect(seen).toHaveLength(1);
    await store.rebuild(
      'ws_rebuild' as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId,
      projection,
    );
    expect(seen).toHaveLength(2);
    db.close();
  });
});
