import type {
  ImportNewsInput,
  NewsEvent,
  NewsProvenanceRecord,
  NewsSourceEvent,
  RecordNewsFetchFailureInput,
} from '@uniforge/contracts';

/** Canonical news intake boundary. Source observations and NewsEvents are domain truth. */
export class NewsSourceService {
  private readonly sources = new Map<string, NewsSourceEvent>();
  private readonly news = new Map<string, NewsEvent>();

  import(input: ImportNewsInput): NewsEvent {
    this.require(input.permissions, 'news:write');
    this.validateSource(input.event);
    if (input.event.fetchStatus === 'FAILED')
      throw new Error('Cannot import a failed source fetch as a NewsEvent');
    this.saveSource(input.event);
    const dedupeIdentity = this.dedupeIdentity(input.event);
    const id = `news-${dedupeIdentity}`;
    const existing = this.news.get(id);
    if (existing) {
      const merged: NewsEvent = {
        ...existing,
        sourceEventIds: [...new Set([...existing.sourceEventIds, input.event.id])],
        provenance: [...new Set([...existing.provenance, input.event.id])],
        provenanceRecords: this.mergeRecords(
          existing.provenanceRecords,
          this.provenance(input.event),
        ),
        ...((existing.publishedAt ?? input.event.publishedAt)
          ? { publishedAt: existing.publishedAt ?? input.event.publishedAt }
          : {}),
        ...((input.event.updatedAt ?? existing.updatedAt)
          ? { updatedAt: input.event.updatedAt ?? existing.updatedAt }
          : {}),
      };
      this.news.set(id, merged);
      return this.cloneEvent(merged);
    }
    const event: NewsEvent = {
      id,
      dedupeIdentity,
      sourceEventIds: [input.event.id],
      canonicalTitle: input.event.title,
      canonicalBody: input.event.body,
      ...(input.event.publishedAt ? { publishedAt: input.event.publishedAt } : {}),
      ...(input.event.updatedAt ? { updatedAt: input.event.updatedAt } : {}),
      status: 'UNVERIFIED',
      lifecycle: input.event.lifecycle ?? 'ACTIVE',
      sourceQuality: input.event.sourceQuality ?? 'UNVERIFIED',
      provenance: [input.event.id],
      provenanceRecords: [this.provenance(input.event)],
    };
    this.news.set(id, event);
    return this.cloneEvent(event);
  }

  recordFetchFailure(input: RecordNewsFetchFailureInput): NewsSourceEvent {
    this.require(input.permissions, 'news:write');
    this.validateSource(input.event);
    if (input.event.fetchStatus !== 'FAILED' || !input.event.fetchFailure)
      throw new Error('Fetch failure details are required');
    this.saveSource(input.event);
    return this.cloneSource(input.event);
  }

  get(id: string, permissions: readonly string[]): NewsEvent | null {
    this.require(permissions, 'news:read');
    const event = this.news.get(id);
    return event ? this.cloneEvent(event) : null;
  }

  getSource(id: string, permissions: readonly string[]): NewsSourceEvent | null {
    this.require(permissions, 'news:read');
    const source = this.sources.get(id);
    return source ? this.cloneSource(source) : null;
  }

  private saveSource(source: NewsSourceEvent): void {
    if (this.sources.has(source.id)) throw new Error('Source event already exists');
    this.sources.set(source.id, this.cloneSource(source));
  }

  private validateSource(source: NewsSourceEvent): void {
    if (!source.id.trim()) throw new Error('Source event id is required');
    if (!/^https?:\/\//i.test(source.sourceUrl)) throw new Error('Invalid source URL');
    if (!source.capturedAt.trim() || !isIsoTimestamp(source.capturedAt))
      throw new Error('Invalid source capture time');
    for (const time of [source.publishedAt, source.updatedAt, source.fetchFailure?.failedAt]) {
      if (time !== undefined && !isIsoTimestamp(time)) throw new Error('Invalid news timestamp');
    }
    if (!source.contentHash.trim()) throw new Error('Content hash is required');
    if (source.lifecycle === 'DELETED') throw new Error('Invalid source lifecycle');
    if (source.fetchStatus === 'FAILED' && !source.fetchFailure)
      throw new Error('Fetch failure details are required');
    if (source.fetchStatus !== 'FAILED' && source.fetchFailure)
      throw new Error('Fetch failure requires FAILED status');
  }

  private provenance(source: NewsSourceEvent): NewsProvenanceRecord {
    return {
      sourceEventId: source.id,
      sourceUrl: source.sourceUrl,
      capturedAt: source.capturedAt,
      ...(source.publishedAt ? { publishedAt: source.publishedAt } : {}),
      ...(source.updatedAt ? { updatedAt: source.updatedAt } : {}),
      contentHash: source.contentHash,
      sourceQuality: source.sourceQuality ?? 'UNVERIFIED',
    };
  }

  private dedupeIdentity(source: NewsSourceEvent): string {
    return `content-hash:${source.contentHash.trim().toLowerCase()}`;
  }

  private mergeRecords(
    existing: readonly NewsProvenanceRecord[],
    record: NewsProvenanceRecord,
  ): NewsProvenanceRecord[] {
    return existing.some((item) => item.sourceEventId === record.sourceEventId)
      ? [...existing]
      : [...existing, record];
  }

  private cloneSource(source: NewsSourceEvent): NewsSourceEvent {
    return source.fetchFailure
      ? { ...source, fetchFailure: { ...source.fetchFailure } }
      : { ...source };
  }

  private cloneEvent(event: NewsEvent): NewsEvent {
    return {
      ...event,
      sourceEventIds: [...event.sourceEventIds],
      provenance: [...event.provenance],
      provenanceRecords: event.provenanceRecords.map((record) => ({ ...record })),
    };
  }

  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }
}

function isIsoTimestamp(value: string): boolean {
  const parsed = new Date(value);
  return (
    /^(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)$/.test(value) &&
    !Number.isNaN(parsed.valueOf())
  );
}
