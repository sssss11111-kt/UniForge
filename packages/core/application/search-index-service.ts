import type { RebuildSearchInput, SearchHit, SearchIndexSnapshot } from '@uniforge/contracts';
export class SearchIndexService {
  private snapshot: SearchIndexSnapshot | null = null;
  rebuild(input: RebuildSearchInput): SearchIndexSnapshot {
    if (!input.permissions.includes('knowledge:index:write'))
      throw new Error('Missing permission: knowledge:index:write');
    const seen = new Set<string>();
    for (const d of input.documents) {
      if (seen.has(d.sourceEntityId)) throw new Error('Duplicate source entity');
      seen.add(d.sourceEntityId);
    }
    this.snapshot = {
      indexVersion: input.indexVersion,
      builtAt: new Date().toISOString(),
      documents: input.documents.map((d) => ({ ...d })),
    };
    return this.copy(this.snapshot);
  }
  search(query: string, permissions: readonly string[]): SearchHit[] {
    if (!permissions.includes('knowledge:read'))
      throw new Error('Missing permission: knowledge:read');
    if (!this.snapshot || !query.trim()) return [];
    const q = query.toLowerCase();
    return this.snapshot.documents
      .filter((d) => d.text.toLowerCase().includes(q))
      .map((d) => ({
        sourceEntityId: d.sourceEntityId,
        score: 1,
        indexVersion: this.snapshot!.indexVersion,
        snippet: d.text.slice(0, 160),
      }));
  }
  clearDerivedIndex(permissions: readonly string[]): void {
    if (!permissions.includes('knowledge:index:write'))
      throw new Error('Missing permission: knowledge:index:write');
    this.snapshot = null;
  }
  getSnapshot(permissions: readonly string[]): SearchIndexSnapshot | null {
    if (!permissions.includes('knowledge:read'))
      throw new Error('Missing permission: knowledge:read');
    return this.snapshot ? this.copy(this.snapshot) : null;
  }
  private copy(s: SearchIndexSnapshot): SearchIndexSnapshot {
    return { ...s, documents: s.documents.map((d) => ({ ...d })) };
  }
}
