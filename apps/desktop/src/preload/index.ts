import { contextBridge, ipcRenderer } from 'electron';

// The sandboxed CommonJS preload cannot synchronously load the ESM contracts
// package. This literal is kept in sync with IPC_CHANNELS.health until the
// preload bundling step is introduced.
const healthChannel = 'uniforge:health';

const testPreferences =
  process.env.UF_TEST_MODE === '1'
    ? { nodeIntegration: false, contextIsolation: true, sandbox: true }
    : undefined;

contextBridge.exposeInMainWorld(
  'uniforge',
  Object.freeze({
    version: '0.0.0',
    health: () => ipcRenderer.invoke(healthChannel),
    ...(testPreferences ? { testPreferences } : {}),
  }),
);
