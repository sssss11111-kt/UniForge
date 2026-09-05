import { DatabaseSync } from 'node:sqlite';
import type { Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';
export interface SearchResult {
  sourceId: string;
  locator: string;
  excerpt: string;
  hash: string;
  scope?: string;
}
export type IndexedSource = {
  sourceId: string;
  locator: string;
  content: string;
  hash: string;
  scope: string;
};
export class Fts5KnowledgeIndex {
  constructor(private readonly db: DatabaseSync) {
    this.migrate();
  }
  private migrate() {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS source_index (source_id TEXT PRIMARY KEY, locator TEXT NOT NULL, content TEXT NOT NULL, hash TEXT NOT NULL, scope TEXT NOT NULL); CREATE VIRTUAL TABLE IF NOT EXISTS source_fts USING fts5(source_id UNINDEXED, locator UNINDEXED, content, hash UNINDEXED, scope UNINDEXED);`,
    );
  }
  index(source: IndexedSource): void {
    this.db
      .prepare('INSERT OR REPLACE INTO source_index VALUES (?,?,?,?,?)')
      .run(source.sourceId, source.locator, source.content, source.hash, source.scope);
    this.db.prepare('DELETE FROM source_fts WHERE source_id = ?').run(source.sourceId);
    this.db
      .prepare('INSERT INTO source_fts VALUES (?,?,?,?,?)')
      .run(source.sourceId, source.locator, source.content, source.hash, source.scope);
  }
  remove(sourceId: string): void {
    this.db.prepare('DELETE FROM source_index WHERE source_id = ?').run(sourceId);
    this.db.prepare('DELETE FROM source_fts WHERE source_id = ?').run(sourceId);
  }
  rebuild(sources: readonly IndexedSource[]): void {
    this.db.exec('DELETE FROM source_index; DELETE FROM source_fts;');
    for (const source of sources) this.index(source);
  }
  search(query: string, scope?: string): Result<SearchResult[]> {
    if (!query.trim()) return failure('INVALID_INPUT', 'Search query cannot be empty');
    try {
      const rows = (
        scope
          ? this.db
              .prepare(
                'SELECT source_id, locator, content AS excerpt, hash, scope FROM source_fts WHERE source_fts MATCH ? AND scope = ?',
              )
              .all(query, scope)
          : this.db
              .prepare(
                'SELECT source_id, locator, content AS excerpt, hash, scope FROM source_fts WHERE source_fts MATCH ?',
              )
              .all(query)
      ) as Record<string, unknown>[];
      return {
        ok: true,
        value: rows.map((r) => ({
          sourceId: String(r.source_id),
          locator: String(r.locator),
          excerpt: String(r.excerpt),
          hash: String(r.hash),
          scope: String(r.scope),
        })),
      };
    } catch (error) {
      return failure('INVALID_INPUT', `Invalid FTS5 query: ${String(error)}`);
    }
  }
}
