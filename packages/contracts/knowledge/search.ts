/** A rebuild input copied from canonical ContentEntity data. Never domain truth. */
export interface SearchDocument {
  id: string;
  sourceEntityId: string;
  text: string;
  version: number;
}
export interface SearchHit {
  sourceEntityId: string;
  score: number;
  snippet: string;
  indexVersion: string;
}
export interface SearchIndexSnapshot {
  indexVersion: string;
  builtAt: string;
  documents: readonly SearchDocument[];
}
export type SearchIndexStatus = 'READY' | 'STALE' | 'UNAVAILABLE';
export interface SearchIndexState {
  status: SearchIndexStatus;
  indexVersion: string | null;
  builtAt: string | null;
  reason?: string;
}
export interface SearchQueryResult {
  status: SearchIndexStatus;
  hits: readonly SearchHit[];
  reason?: string;
}
export interface RebuildSearchInput {
  documents: readonly SearchDocument[];
  indexVersion: string;
  permissions: readonly string[];
}
