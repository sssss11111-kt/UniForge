export interface BackupCreateInput {
  readonly schemaVersion: number;
  readonly domainData: unknown;
  readonly configuration?: unknown;
  readonly indexMetadata?: unknown;
  readonly workflows?: unknown;
}
export interface BackupManifestDto {
  readonly format: 'uniforge-backup';
  readonly formatVersion: 1;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly entries: readonly {
    relativePath: string;
    sha256: string;
    sizeBytes: number;
    contentBase64: string;
  }[];
  readonly payload: {
    domainData: unknown;
    configuration?: unknown;
    indexMetadata?: unknown;
    workflows?: unknown;
  };
  readonly checksum: string;
}
export interface RecycleEntryDto {
  readonly id: string;
  readonly workspaceId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly deletedAt: string;
  readonly purgeAfter: string;
  readonly restoreMetadata: Record<string, unknown>;
  readonly version: number;
}
export interface RecycleSnapshotDto {
  readonly entries: readonly RecycleEntryDto[];
}
export interface ExitRequestDto {
  readonly hasUnsavedChanges: boolean;
  readonly closeToTray?: boolean;
  readonly confirmUnsaved?: boolean;
}
export type ExitDecisionDto = { readonly action: 'CLOSE_TO_TRAY' | 'CONFIRM_UNSAVED' | 'EXIT' };
export interface BackupSnapshotDto {
  readonly status: 'CREATED' | 'INVALID';
  readonly manifest?: BackupManifestDto;
  readonly error?: string;
}
