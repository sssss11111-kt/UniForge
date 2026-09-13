import type { NewsSourceQuality } from './source.js';

/** Source evidence retained by the canonical event for every merged observation. */
export interface NewsProvenanceRecord {
  readonly sourceEventId: string;
  readonly sourceUrl: string;
  readonly capturedAt: string;
  readonly publishedAt?: string;
  readonly updatedAt?: string;
  readonly contentHash: string;
  readonly sourceQuality: NewsSourceQuality;
}
