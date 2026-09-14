export type WorkspaceSettingsDto = {
  readonly id: string;
  readonly name: string;
  readonly status: 'ACTIVE' | 'READ_ONLY';
  readonly rootHandle: string;
};

export type ModelSettingsDto = {
  readonly id: string;
  readonly provider: string;
  readonly model: string;
  readonly capabilities: readonly string[];
  readonly credentialConfigured: boolean;
  readonly enabled: boolean;
};

export type PermissionSettingsDto = {
  readonly externalNetwork: 'ON' | 'OFF';
  readonly modelEgress: 'ALLOWED' | 'DENIED';
  readonly workspaceWrite: 'ALLOWED' | 'DENIED';
  readonly approvalRequiredForExternalSend: true;
};

export type SettingsSnapshotDto = {
  readonly workspace: WorkspaceSettingsDto;
  readonly models: readonly ModelSettingsDto[];
  readonly permissions: PermissionSettingsDto;
};

export type UpdateModelSettingsInput = {
  readonly id: string;
  readonly credentialRef?: string;
  readonly enabled?: boolean;
};
