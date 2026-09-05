import { describe, expect, it } from 'vitest';
import { openDatabase } from './database.js';
import { migrate } from './migration-runner.js';
import { withTransaction } from './transaction.js';

describe('sqlite transactions', () => {
  it('rolls back all writes when the callback fails', async () => {
    const db = await openDatabase(':memory:', 'readwrite');
    await migrate(db);
    await expect(
      withTransaction(db, async (tx) => {
        tx.db
          .prepare(
            'INSERT INTO workspaces (id,name,root_handle,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
          )
          .run(
            'ws_tx',
            'Tx',
            'root',
            'ACTIVE',
            1,
            '2026-01-01T00:00:00.000Z',
            '2026-01-01T00:00:00.000Z',
          );
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(
      (
        db.db.prepare('SELECT count(*) AS count FROM workspaces').get() as
          { count: number } | undefined
      )?.count,
    ).toBe(0);
    db.close();
  });
});
