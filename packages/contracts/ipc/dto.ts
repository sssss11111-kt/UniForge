export const IPC_CHANNELS = Object.freeze({
  health: 'uniforge:health',
  appShell: 'uniforge:app-shell',
} as const);
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
export interface HealthDto {
  readonly ok: true;
  readonly version: string;
}

export type AppShellResponseDto = AppShellDto;
import type { AppShellDto } from '../app-shell/navigation.js';
