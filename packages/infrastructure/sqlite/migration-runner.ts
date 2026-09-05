import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';
import type { DatabaseHandle } from './database.js';
import { withTransaction } from './transaction.js';

export interface Migration {
  version: number;
  sql: string;
}
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
async function defaults(): Promise<Migration[]> {
  return [{ version: 1, sql: await readFile(join(migrationsDir, '0001-foundation.sql'), 'utf8') }];
}
const checksum = (sql: string) => createHash('sha256').update(sql).digest('hex');

export async function migrate(
  handle: DatabaseHandle,
  supplied?: Migration[],
): Promise<Result<{ version: number }>> {
  const migrations = supplied ?? (await defaults());
  try {
    handle.db.exec(
      'PRAGMA foreign_keys = ON; CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL);',
    );
    const applied = handle.db
      .prepare('SELECT version, checksum FROM schema_migrations ORDER BY version')
      .all() as Array<{ version: number; checksum: string }>;
    for (const row of applied) {
      const migration = migrations.find((item) => item.version === row.version);
      if (migration && row.checksum !== checksum(migration.sql))
        return failure('MIGRATION_FAILED', `Migration ${row.version} checksum mismatch`);
      if (!migration && row.version > Math.max(...migrations.map((item) => item.version)))
        return failure(
          'MIGRATION_FAILED',
          `Database migration ${row.version} is newer than this build`,
        );
    }
    const current = applied.at(-1)?.version ?? 0;
    const pending = migrations
      .filter((item) => item.version > current)
      .sort((a, b) => a.version - b.version);
    await withTransaction(handle, async ({ db }) => {
      for (const migration of pending) {
        db.exec(migration.sql);
        db.prepare(
          'INSERT INTO schema_migrations (version, checksum, applied_at) VALUES (?, ?, ?)',
        ).run(migration.version, checksum(migration.sql), new Date().toISOString());
      }
      const integrity = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
      if (integrity.integrity_check !== 'ok') throw new Error('SQLite integrity check failed');
    });
    return { ok: true, value: { version: pending.at(-1)?.version ?? current } };
  } catch (error) {
    return failure('MIGRATION_FAILED', error instanceof Error ? error.message : 'Migration failed');
  }
}
