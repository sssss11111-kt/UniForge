export interface NewsSourceEvent {
  id: string;
  sourceType: 'RSS' | 'WEB' | 'CONNECTOR' | 'USER';
  sourceUrl: string;
  capturedAt: string;
  title: string;
  body: string;
  contentHash: string;
}
export interface NewsEvent {
  id: string;
  sourceEventIds: readonly string[];
  canonicalTitle: string;
  canonicalBody: string;
  publishedAt?: string;
  status: 'UNVERIFIED' | 'VERIFIED' | 'CONFLICTING' | 'CORRECTED';
  provenance: readonly string[];
}
export interface ImportNewsInput {
  event: NewsSourceEvent;
  permissions: readonly string[];
}
