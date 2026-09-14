import type { NewsProvenanceRecord } from './provenance.js';
import type { NewsLifecycle, NewsSourceQuality } from './source.js';

export type NewsEventStatus = 'UNVERIFIED' | 'VERIFIED' | 'CONFLICTING' | 'CORRECTED';

/** Canonical domain truth. Feeds, rankings, summaries and indexes are derived views. */
export interface NewsEvent {
  readonly id: string;
  readonly dedupeIdentity: string;
  readonly sourceEventIds: readonly string[];
  readonly canonicalTitle: string;
  readonly canonicalBody: string;
  readonly publishedAt?: string;
  readonly updatedAt?: string;
  readonly status: NewsEventStatus;
  readonly lifecycle: NewsLifecycle;
  readonly sourceQuality: NewsSourceQuality;
  readonly provenance: readonly string[];
  readonly provenanceRecords: readonly NewsProvenanceRecord[];
}
