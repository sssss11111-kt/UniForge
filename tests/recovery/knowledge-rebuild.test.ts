import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { Fts5KnowledgeIndex } from '../../packages/platform-knowledge/search/fts5.js';
describe('knowledge index recovery', () => { it('rebuilds deleted derived state', () => { const db = new DatabaseSync(':memory:'); const i = new Fts5KnowledgeIndex(db); const s = { sourceId: 's', locator: 'a.md', content: 'recoverable', hash: 'h', scope: 'WORKSPACE' }; const get=(q:string)=>{const r=i.search(q); expect(r.ok).toBe(true); return r.ok?r.value:[]}; i.index(s); db.exec('DELETE FROM source_index; DELETE FROM source_fts'); expect(get('recoverable')).toEqual([]); i.rebuild([s]); expect(get('recoverable')[0]?.locator).toBe('a.md'); db.close(); }); });
