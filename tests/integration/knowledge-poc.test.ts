import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { Fts5KnowledgeIndex } from '../../packages/platform-knowledge/search/fts5.js';
describe('knowledge FTS5 PoC', () => {
  it('indexes citations and rebuilds from Markdown sources', () => {
    const db = new DatabaseSync(':memory:');
    const index = new Fts5KnowledgeIndex(db);
    const source = {
      sourceId: 'source-a',
      locator: 'vault/a.md',
      content: '# Alpha\nEvidence text',
      hash: 'h1',
      scope: 'WORKSPACE',
    };
    const get = (r: ReturnType<typeof index.search>) => {
      expect(r.ok).toBe(true);
      return r.ok ? r.value : [];
    };
    index.index(source);
    expect(get(index.search('Evidence'))).toHaveLength(1);
    index.remove(source.sourceId);
    expect(get(index.search('Evidence'))).toEqual([]);
    index.rebuild([source]);
    expect(get(index.search('Evidence'))).toHaveLength(1);
    db.close();
  });
});
