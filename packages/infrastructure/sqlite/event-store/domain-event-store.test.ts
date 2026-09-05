import { describe, expect, it } from 'vitest';
import { openDatabase } from '../database.js';
import { migrate } from '../migration-runner.js';
import { SqliteDomainEventStore } from './domain-event-store.js';

const id = (value: string) =>
  value as unknown as import('@uniforge/contracts/domain/primitives.js').EntityId;
const instant =
  '2026-01-01T00:00:00.000Z' as unknown as import('@uniforge/contracts/domain/primitives.js').IsoUtc;
describe('domain event store', () => {
  it('appends events with monotonic sequence and reads by workspace', async () => {
    const db = await openDatabase(':memory:', 'readwrite');
    await migrate(db);
    const store = new SqliteDomainEventStore(db);
    db.db
      .prepare(
        'INSERT INTO workspaces (id,name,root_handle,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
      )
      .run('ws_one', 'One', 'root', 'ACTIVE', 1, instant, instant);
    await store.append(
      [
        {
          type: 'workspace.created',
          eventId: id('evt_one'),
          occurredAt: instant,
          aggregateId: id('ws_one'),
          aggregateVersion: 1,
          name: 'One',
        },
      ],
      id('ws_one'),
    );
    const events = await store.read(id('ws_one'), 0, 10);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ eventType: 'workspace.created', aggregateVersion: 1 });
    await expect(
      store.append(
        [
          {
            type: 'workspace.created',
            eventId: id('evt_one'),
            occurredAt: instant,
            aggregateId: id('ws_one'),
            aggregateVersion: 1,
            name: 'One',
          },
        ],
        id('ws_one'),
      ),
    ).rejects.toThrow();
    db.close();
  });
});
