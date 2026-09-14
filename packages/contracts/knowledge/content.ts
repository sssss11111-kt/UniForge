import type { ContentProvenance } from './provenance.js';
import type { SourceEvent, SourceLifecycle } from './source.js';

export interface ContentEntity {
  id: string;
  sourceEventId: string;
  body: string;
  mimeType: string;
  workspacePath?: string;
  provenance: readonly string[];
  createdAt: string;
  checksum?: string;
  license?: string;
  lifecycle?: SourceLifecycle;
  provenanceRecords?: readonly ContentProvenance[];
}
export interface ImportContentInput {
  contentId: string;
  sourceEvent: SourceEvent;
  body: string;
  mimeType: string;
  workspacePath?: string;
  permissions: readonly string[];
}
