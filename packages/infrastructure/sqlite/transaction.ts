import type { DatabaseHandle } from './database.js';

export async function withTransaction<T>(
  handle: DatabaseHandle,
  work: (db: DatabaseHandle) => Promise<T> | T,
): Promise<T> {
  handle.db.exec('BEGIN IMMEDIATE');
  try {
    const value = await work(handle);
    handle.db.exec('COMMIT');
    return value;
  } catch (error) {
    try {
      handle.db.exec('ROLLBACK');
    } catch {
      /* preserve the original error */
    }
    throw error;
  }
}
