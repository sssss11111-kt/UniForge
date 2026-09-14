import type {
  ModelSettingsDto,
  SettingsSnapshotDto,
  UpdateModelSettingsInput,
} from '@uniforge/contracts/settings/index.js';

const initialModel: ModelSettingsDto = {
  id: 'local-default',
  provider: 'local',
  model: 'unconfigured',
  capabilities: ['text', 'streaming'],
  credentialConfigured: false,
  enabled: true,
};

/** Application service for the settings center. Secrets remain in OS credential storage. */
export class SettingsCenter {
  private model: ModelSettingsDto = initialModel;

  async getSnapshot(): Promise<SettingsSnapshotDto> {
    return {
      workspace: {
        id: 'workspace-default',
        name: '默认工作区',
        status: 'ACTIVE',
        rootHandle: 'workspace:default',
      },
      models: [this.model],
      permissions: {
        externalNetwork: 'OFF',
        modelEgress: 'DENIED',
        workspaceWrite: 'ALLOWED',
        approvalRequiredForExternalSend: true,
      },
    };
  }

  async updateModel(input: UpdateModelSettingsInput): Promise<SettingsSnapshotDto> {
    if (!input.id || input.id !== this.model.id) throw new Error('INVALID_INPUT');
    if (
      input.credentialRef !== undefined &&
      !/^os:[A-Za-z0-9_./-]{3,200}$/.test(input.credentialRef)
    )
      throw new Error('INVALID_INPUT');
    this.model = {
      ...this.model,
      ...(input.enabled === undefined ? {} : { enabled: input.enabled }),
      ...(input.credentialRef === undefined ? {} : { credentialConfigured: true }),
    };
    return this.getSnapshot();
  }
}
