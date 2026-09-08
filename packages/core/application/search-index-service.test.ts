import { describe, expect, it } from 'vitest';
import { SearchIndexService } from './search-index-service.js';
describe('SearchIndexService', () => {
  it('rebuilds a derived index and returns source references', () => {
    const s = new SearchIndexService();
    s.rebuild({
      indexVersion: 'v1',
      documents: [{ id: 'd', sourceEntityId: 'c1', text: 'distributed truth', version: 1 }],
      permissions: ['knowledge:index:write'],
    });
    expect(s.search('truth', ['knowledge:read'])[0]).toMatchObject({
      sourceEntityId: 'c1',
      indexVersion: 'v1',
    });
    s.clearDerivedIndex(['knowledge:index:write']);
    expect(s.search('truth', ['knowledge:read'])).toEqual([]);
  });
  it('fails closed and rejects duplicate source entities', () => {
    const s = new SearchIndexService();
    expect(() =>
      s.rebuild({
        indexVersion: 'v1',
        documents: [
          { id: 'a', sourceEntityId: 'c', text: 'a', version: 1 },
          { id: 'b', sourceEntityId: 'c', text: 'b', version: 1 },
        ],
        permissions: ['knowledge:index:write'],
      }),
    ).toThrow('Duplicate');
    expect(() => s.search('x', [])).toThrow('knowledge:read');
  });

  it('exposes unavailable state before a rebuild and after a failed rebuild', () => {
    const s = new SearchIndexService();
    expect(s.getState(['knowledge:read'])).toMatchObject({
      status: 'UNAVAILABLE',
      reason: 'INDEX_NOT_BUILT',
    });
    expect(() =>
      s.rebuild({
        indexVersion: '',
        documents: [],
        permissions: ['knowledge:index:write'],
      }),
    ).toThrow('indexVersion');
    expect(s.getState(['knowledge:read'])).toMatchObject({
      status: 'UNAVAILABLE',
      reason: 'REBUILD_FAILED',
    });
    expect(s.searchWithStatus('anything', ['knowledge:read'])).toMatchObject({
      status: 'UNAVAILABLE',
      hits: [],
    });
  });

  it('marks the derived index stale when canonical source versions change', () => {
    const s = new SearchIndexService();
    const document = { id: 'd', sourceEntityId: 'c1', text: 'distributed truth', version: 1 };
    s.rebuild({ indexVersion: 'v1', documents: [document], permissions: ['knowledge:index:write'] });
    expect(s.checkFreshness([document], ['knowledge:read'])).toBe('READY');
    expect(
      s.checkFreshness([{ ...document, version: 2, text: 'updated truth' }], ['knowledge:read']),
    ).toBe('STALE');
    expect(s.searchWithStatus('truth', ['knowledge:read'])).toMatchObject({
      status: 'STALE',
      hits: [],
      reason: 'CANONICAL_SOURCE_CHANGED',
    });
    s.rebuild({
      indexVersion: 'v2',
      documents: [{ ...document, version: 2, text: 'updated truth' }],
      permissions: ['knowledge:index:write'],
    });
    expect(s.searchWithStatus('updated', ['knowledge:read']).status).toBe('READY');
  });

  it('does not mutate canonical input while rebuilding derived state', () => {
    const s = new SearchIndexService();
    const document = { id: 'd', sourceEntityId: 'c1', text: 'canonical body', version: 1 };
    const input = { indexVersion: 'v1', documents: [document], permissions: ['knowledge:index:write'] };
    s.rebuild(input);
    document.text = 'canonical body changed outside the index';
    expect(s.search('canonical body', ['knowledge:read'])).toHaveLength(1);
  });
});
