import { DatabaseSync } from 'node:sqlite';

export interface NativeSqliteCheck {
  readonly driver: 'node:sqlite';
  readonly sqliteVersion: string;
  readonly fts5: boolean;
  readonly crud: boolean;
}

export function checkNativeSqliteBinding(): NativeSqliteCheck {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE records (id INTEGER PRIMARY KEY, body TEXT NOT NULL)');
    db.prepare('INSERT INTO records (body) VALUES (?)').run('native binding');
    const row = db.prepare('SELECT body FROM records WHERE id = 1').get() as
      { body?: unknown } | undefined;
    let ftsCount = 0;
    try {
      db.exec('CREATE VIRTUAL TABLE records_fts USING fts5(body)');
      db.exec("INSERT INTO records_fts (body) VALUES ('native binding')");
      ftsCount = Number(
        (
          db
            .prepare("SELECT count(*) AS count FROM records_fts WHERE records_fts MATCH 'native'")
            .get() as { count?: unknown }
        ).count ?? 0,
      );
    } catch {
      ftsCount = 0;
    }
    return {
      driver: 'node:sqlite',
      sqliteVersion: String(
        (db.prepare('SELECT sqlite_version() AS version').get() as { version: unknown }).version,
      ),
      fts5: ftsCount === 1,
      crud: row?.body === 'native binding',
    };
  } finally {
    db.close();
  }
}
