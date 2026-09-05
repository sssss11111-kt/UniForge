import { describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../../packages/infrastructure/sqlite/database.js';
import { migrate } from '../../packages/infrastructure/sqlite/migration-runner.js';

describe('sqlite restart recovery', () => {
  it('retains committed records after close and reopen', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'uniforge-sqlite-'));
    const location = join(dir, 'domain.sqlite');
    const first = await openDatabase(location, 'readwrite');
    await migrate(first);
    first.db
      .prepare(
        'INSERT INTO workspaces (id,name,root_handle,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)',
      )
      .run(
        'ws_restart',
        'Restart',
        'root',
        'ACTIVE',
        1,
        '2026-01-01T00:00:00.000Z',
        '2026-01-01T00:00:00.000Z',
      );
    first.close();
    const second = await openDatabase(location, 'readwrite');
    await migrate(second);
    expect(
      second.db.prepare('SELECT name FROM workspaces WHERE id = ?').get('ws_restart'),
    ).toMatchObject({ name: 'Restart' });
    second.close();
    await rm(dir, { recursive: true, force: true });
  });
});
