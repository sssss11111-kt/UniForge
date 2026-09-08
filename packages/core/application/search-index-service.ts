import type {
  RebuildSearchInput,
  SearchDocument,
  SearchHit,
  SearchIndexSnapshot,
  SearchIndexState,
  SearchIndexStatus,
  SearchQueryResult,
} from '@uniforge/contracts';

/** Application boundary for a rebuildable, derived search projection. */
export class SearchIndexService {
  private snapshot: SearchIndexSnapshot | null = null;
  private state: SearchIndexState = {
    status: 'UNAVAILABLE',
    indexVersion: null,
    builtAt: null,
    reason: 'INDEX_NOT_BUILT',
  };

  rebuild(input: RebuildSearchInput): SearchIndexSnapshot {
    this.require(input.permissions, 'knowledge:index:write');
    try {
      this.validate(input);
      const snapshot: SearchIndexSnapshot = {
        indexVersion: input.indexVersion,
        builtAt: new Date().toISOString(),
        documents: input.documents.map((document) => ({ ...document })),
      };
      this.snapshot = snapshot;
      this.state = {
        status: 'READY',
        indexVersion: snapshot.indexVersion,
        builtAt: snapshot.builtAt,
      };
      return this.copy(snapshot);
    } catch (error) {
      this.snapshot = null;
      this.state = {
        status: 'UNAVAILABLE',
        indexVersion: null,
        builtAt: null,
        reason: 'REBUILD_FAILED',
      };
      throw error;
    }
  }

  getState(permissions: readonly string[]): SearchIndexState {
    this.require(permissions, 'knowledge:read');
    return { ...this.state };
  }

  checkFreshness(
    canonicalDocuments: readonly SearchDocument[],
    permissions: readonly string[],
  ): SearchIndexStatus {
    this.require(permissions, 'knowledge:read');
    if (!this.snapshot) return 'UNAVAILABLE';
    const indexed = new Map(
      this.snapshot.documents.map((document) => [document.sourceEntityId, document.version]),
    );
    const canonical = new Map(
      canonicalDocuments.map((document) => [document.sourceEntityId, document.version]),
    );
    const fresh =
      indexed.size === canonical.size &&
      [...canonical].every(([sourceEntityId, version]) => indexed.get(sourceEntityId) === version);
    if (!fresh) {
      this.state = { ...this.state, status: 'STALE', reason: 'CANONICAL_SOURCE_CHANGED' };
      return 'STALE';
    }
    if (this.state.status === 'STALE') {
      this.state = {
        status: 'READY',
        indexVersion: this.state.indexVersion,
        builtAt: this.state.builtAt,
      };
    }
    return 'READY';
  }

  searchWithStatus(query: string, permissions: readonly string[]): SearchQueryResult {
    this.require(permissions, 'knowledge:read');
    if (this.state.status !== 'READY' || !this.snapshot) {
      return {
        status: this.state.status,
        hits: [],
        ...(this.state.reason ? { reason: this.state.reason } : {}),
      };
    }
    if (!query.trim()) return { status: 'READY', hits: [] };
    const q = query.toLowerCase();
    const hits = this.snapshot.documents
      .filter((document) => document.text.toLowerCase().includes(q))
      .map((document): SearchHit => ({
        sourceEntityId: document.sourceEntityId,
        score: 1,
        indexVersion: this.snapshot!.indexVersion,
        snippet: document.text.slice(0, 160),
      }));
    return { status: 'READY', hits };
  }

  search(query: string, permissions: readonly string[]): SearchHit[] {
    return [...this.searchWithStatus(query, permissions).hits];
  }

  clearDerivedIndex(permissions: readonly string[]): void {
    this.require(permissions, 'knowledge:index:write');
    this.snapshot = null;
    this.state = {
      status: 'UNAVAILABLE',
      indexVersion: null,
      builtAt: null,
      reason: 'INDEX_NOT_BUILT',
    };
  }

  getSnapshot(permissions: readonly string[]): SearchIndexSnapshot | null {
    this.require(permissions, 'knowledge:read');
    return this.snapshot ? this.copy(this.snapshot) : null;
  }

  private validate(input: RebuildSearchInput): void {
    if (!input.indexVersion.trim()) throw new Error('indexVersion is required');
    const ids = new Set<string>();
    const sourceIds = new Set<string>();
    for (const document of input.documents) {
      if (!document.id.trim() || !document.sourceEntityId.trim())
        throw new Error('Search document identifiers are required');
      if (ids.has(document.id)) throw new Error('Duplicate search document');
      if (sourceIds.has(document.sourceEntityId)) throw new Error('Duplicate source entity');
      if (!Number.isInteger(document.version) || document.version < 0)
        throw new Error('Search document version must be a non-negative integer');
      ids.add(document.id);
      sourceIds.add(document.sourceEntityId);
    }
  }

  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }

  private copy(snapshot: SearchIndexSnapshot): SearchIndexSnapshot {
    return { ...snapshot, documents: snapshot.documents.map((document) => ({ ...document })) };
  }
}
