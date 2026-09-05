import type { AppShellResponseDto, HealthDto } from './dto.js';
import type { SettingsSnapshotDto, UpdateModelSettingsInput } from '../settings/index.js';
export interface UniforgeApi {
  readonly health: () => Promise<HealthDto>;
  readonly appShell: () => Promise<AppShellResponseDto>;
  readonly settings: {
    readonly getSnapshot: () => Promise<SettingsSnapshotDto>;
    readonly updateModel: (input: UpdateModelSettingsInput) => Promise<SettingsSnapshotDto>;
  };
}
