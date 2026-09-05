import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@uniforge/contracts/ipc/dto.js';
contextBridge.exposeInMainWorld(
  'uniforge',
  Object.freeze({ version: '0.0.0', health: () => ipcRenderer.invoke(IPC_CHANNELS.health) }),
);
