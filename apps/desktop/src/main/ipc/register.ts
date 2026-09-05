import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { DEFAULT_APP_SHELL, type AppShellDto } from '@uniforge/contracts/app-shell/navigation.js';
import { IPC_CHANNELS, type HealthDto } from '@uniforge/contracts/ipc/dto.js';
export const registerIpcHandlers = (version: string): void => {
  ipcMain.handle(IPC_CHANNELS.health, (event: IpcMainInvokeEvent, payload: unknown): HealthDto => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return { ok: true, version };
  });
  ipcMain.handle(
    IPC_CHANNELS.appShell,
    (event: IpcMainInvokeEvent, payload: unknown): AppShellDto => {
      if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
      if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
      return DEFAULT_APP_SHELL;
    },
  );
};
