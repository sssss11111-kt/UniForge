import type { ImportNewsInput, NewsEvent, NewsSourceEvent } from '@uniforge/contracts';
export class NewsSourceService {
  private readonly sources = new Map<string, NewsSourceEvent>();
  private readonly news = new Map<string, NewsEvent>();
  import(input: ImportNewsInput): NewsEvent {
    if (!input.permissions.includes('news:write'))
      throw new Error('Missing permission: news:write');
    if (!input.event.sourceUrl.startsWith('http')) throw new Error('Invalid source URL');
    if (this.sources.has(input.event.id)) throw new Error('Source event already exists');
    this.sources.set(input.event.id, { ...input.event });
    const id = `news-${input.event.contentHash}`;
    const existing = this.news.get(id);
    if (existing) {
      const merged = {
        ...existing,
        sourceEventIds: [...new Set([...existing.sourceEventIds, input.event.id])],
        provenance: [...new Set([...existing.provenance, input.event.id])],
      };
      this.news.set(id, merged);
      return {
        ...merged,
        sourceEventIds: [...merged.sourceEventIds],
        provenance: [...merged.provenance],
      };
    }
    const n: NewsEvent = {
      id,
      sourceEventIds: [input.event.id],
      canonicalTitle: input.event.title,
      canonicalBody: input.event.body,
      publishedAt: input.event.capturedAt,
      status: 'UNVERIFIED',
      provenance: [input.event.id],
    };
    this.news.set(id, n);
    return { ...n, sourceEventIds: [...n.sourceEventIds], provenance: [...n.provenance] };
  }
  get(id: string, permissions: readonly string[]): NewsEvent | null {
    if (!permissions.includes('news:read')) throw new Error('Missing permission: news:read');
    const n = this.news.get(id);
    return n
      ? { ...n, sourceEventIds: [...n.sourceEventIds], provenance: [...n.provenance] }
      : null;
  }
}
