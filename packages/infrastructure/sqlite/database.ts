import { DatabaseSync } from 'node:sqlite';

export type DatabaseMode = 'readwrite' | 'readonly';
export interface DatabaseHandle {
  readonly db: DatabaseSync;
  readonly location: string;
  close(): void;
}

export async function openDatabase(location: string, mode: DatabaseMode): Promise<DatabaseHandle> {
  const db = new DatabaseSync(location, { readOnly: mode === 'readonly', timeout: 5000 });
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  return { db, location, close: () => db.close() };
}
