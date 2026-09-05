import { ipcMain, type IpcMainInvokeEvent } from 'electron';
import { DEFAULT_APP_SHELL, type AppShellDto } from '@uniforge/contracts/app-shell/navigation.js';
import { IPC_CHANNELS, type HealthDto } from '@uniforge/contracts/ipc/dto.js';
import type { UpdateModelSettingsInput } from '@uniforge/contracts/settings/index.js';
import { SettingsCenter } from '@uniforge/core/application/settings-center.js';
export const registerIpcHandlers = (version: string, settings = new SettingsCenter()): void => {
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
  ipcMain.handle(
    IPC_CHANNELS.settingsSnapshot,
    async (event: IpcMainInvokeEvent, payload: unknown) => {
      if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
      if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
      return settings.getSnapshot();
    },
  );
  ipcMain.handle(
    IPC_CHANNELS.settingsUpdateModel,
    async (event: IpcMainInvokeEvent, payload: unknown) => {
      if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
      if (
        !payload ||
        typeof payload !== 'object' ||
        typeof (payload as { id?: unknown }).id !== 'string'
      )
        throw new Error('INVALID_PAYLOAD');
      return settings.updateModel(payload as UpdateModelSettingsInput);
    },
  );
};
