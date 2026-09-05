import { describe, expect, it } from 'vitest';
import { openDatabase } from './database.js';
import { migrate } from './migration-runner.js';

describe('foundation migrations', () => {
  it('migrates an empty database and is idempotent', async () => {
    const handle = await openDatabase(':memory:', 'readwrite');
    await expect(migrate(handle)).resolves.toMatchObject({ ok: true, value: { version: 1 } });
    await expect(migrate(handle)).resolves.toMatchObject({ ok: true, value: { version: 1 } });
    expect(
      handle.db
        .prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?')
        .get('table', 'tasks'),
    ).toBeTruthy();
    handle.close();
  });

  it('rejects a changed checksum without writing a new migration', async () => {
    const handle = await openDatabase(':memory:', 'readwrite');
    await expect(
      migrate(handle, [{ version: 1, sql: 'CREATE TABLE changed (id TEXT);' }]),
    ).resolves.toMatchObject({ ok: true });
    const result = await migrate(handle);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ error: { code: 'MIGRATION_FAILED' } });
    handle.close();
  });

  it('upgrades a legacy version marker to the latest schema', async () => {
    const handle = await openDatabase(':memory:', 'readwrite');
    handle.db.exec(
      "CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL); INSERT INTO schema_migrations VALUES (0, 'legacy', '2026-01-01T00:00:00.000Z');",
    );
    const result = await migrate(handle);
    expect(result).toMatchObject({ ok: true, value: { version: 1 } });
    expect(
      handle.db
        .prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?')
        .get('table', 'workspaces'),
    ).toBeTruthy();
    handle.close();
  });

  it('rolls back an invalid migration without leaving its probe table', async () => {
    const handle = await openDatabase(':memory:', 'readwrite');
    const result = await migrate(handle, [
      { version: 1, sql: 'CREATE TABLE migration_probe (id TEXT); THIS IS INVALID;' },
    ]);
    expect(result).toMatchObject({ ok: false, error: { code: 'MIGRATION_FAILED' } });
    expect(
      handle.db.prepare("SELECT name FROM sqlite_master WHERE name = 'migration_probe'").get(),
    ).toBeUndefined();
    expect(
      handle.db.prepare('SELECT count(*) AS count FROM schema_migrations').get(),
    ).toMatchObject({ count: 0 });
    handle.close();
  });
});
