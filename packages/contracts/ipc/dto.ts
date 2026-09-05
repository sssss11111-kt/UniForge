export const IPC_CHANNELS = Object.freeze({ health: 'uniforge:health' } as const);
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
export interface HealthDto {
  readonly ok: true;
  readonly version: string;
}
