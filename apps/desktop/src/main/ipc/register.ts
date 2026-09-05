import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { IPC_CHANNELS, type HealthDto } from '@uniforge/contracts/ipc/dto.js';
export const registerIpcHandlers = (version: string): void => {
  ipcMain.handle(IPC_CHANNELS.health, (event: IpcMainInvokeEvent, payload: unknown): HealthDto => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return { ok: true, version };
  });
};
