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
export interface RebuildSearchInput {
  documents: readonly SearchDocument[];
  indexVersion: string;
  permissions: readonly string[];
}
