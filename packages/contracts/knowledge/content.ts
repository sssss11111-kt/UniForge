export interface SourceEvent {
  id: string;
  sourceType: 'FILE' | 'CLIPBOARD' | 'CONNECTOR' | 'USER';
  capturedAt: string;
  locator: string;
}
export interface ContentEntity {
  id: string;
  sourceEventId: string;
  body: string;
  mimeType: string;
  workspacePath?: string;
  provenance: readonly string[];
  createdAt: string;
}
export interface ImportContentInput {
  contentId: string;
  sourceEvent: SourceEvent;
  body: string;
  mimeType: string;
  workspacePath?: string;
  permissions: readonly string[];
}
