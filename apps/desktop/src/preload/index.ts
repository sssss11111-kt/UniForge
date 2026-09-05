import { contextBridge, ipcRenderer } from 'electron';

// The sandboxed CommonJS preload cannot synchronously load the ESM contracts
// package. This literal is kept in sync with IPC_CHANNELS.health until the
// preload bundling step is introduced.
const healthChannel = 'uniforge:health';
const appShellChannel = 'uniforge:app-shell';
const settingsSnapshotChannel = 'uniforge:settings-snapshot';
const settingsUpdateModelChannel = 'uniforge:settings-update-model';
const dashboardSnapshotChannel = 'uniforge:dashboard-snapshot';
const courseSnapshotChannel = 'uniforge:course-snapshot';
const courseCreateChannel = 'uniforge:course-create';

const testPreferences =
  process.env.UF_TEST_MODE === '1'
    ? { nodeIntegration: false, contextIsolation: true, sandbox: true }
    : undefined;

contextBridge.exposeInMainWorld(
  'uniforge',
  Object.freeze({
    version: '0.0.0',
    health: () => ipcRenderer.invoke(healthChannel),
    appShell: () => ipcRenderer.invoke(appShellChannel),
    settings: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(settingsSnapshotChannel),
      updateModel: (input: unknown) => ipcRenderer.invoke(settingsUpdateModelChannel, input),
    }),
    dashboard: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(dashboardSnapshotChannel),
    }),
    course: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(courseSnapshotChannel),
      create: (input: unknown) => ipcRenderer.invoke(courseCreateChannel, input),
    }),
    ...(testPreferences ? { testPreferences } : {}),
  }),
);
