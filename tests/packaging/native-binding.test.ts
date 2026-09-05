import { describe, expect, it } from 'vitest';
import { checkNativeSqliteBinding } from '@uniforge/infrastructure';

describe('Windows package native SQLite prerequisite', () => {
  it('performs real CRUD and FTS5 checks with the selected runtime binding', () => {
    const result = checkNativeSqliteBinding();
    expect(result.driver).toBe('node:sqlite');
    expect(result.crud).toBe(true);
    expect(result.fts5).toBe(true);
    expect(result.sqliteVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
