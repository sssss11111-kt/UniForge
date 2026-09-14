export type SourceType = 'FILE' | 'CLIPBOARD' | 'CONNECTOR' | 'USER';
export type SourceLifecycle = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

/** Canonical metadata for an observed source. The source event is immutable. */
export interface SourceEvent {
  id: string;
  sourceType: SourceType;
  capturedAt: string;
  locator: string;
  /** SPDX identifier or an explicitly recorded license statement. */
  license?: string;
  /** SHA-256 checksum of the captured bytes/content. */
  checksum?: string;
  lifecycle?: SourceLifecycle;
  managedCopyPath?: string;
}

export interface ImportSourceInput {
  sourceEvent: SourceEvent;
  /** Path of the original source, read by the trusted application service. */
  sourcePath: string;
  /** Authorized managed workspace directory for the immutable copy. */
  managedWorkspaceRoot: string;
  mimeType?: string;
  permissions: readonly string[];
}
