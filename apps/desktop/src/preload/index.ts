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
const courseMaterialImportChannel = 'uniforge:course-material-import';
const courseRecognitionSnapshotChannel = 'uniforge:course-recognition-snapshot';
const courseRecognitionConfirmChannel = 'uniforge:course-recognition-confirm';
const courseAiSnapshotChannel = 'uniforge:course-ai-snapshot';
const courseAiAskChannel = 'uniforge:course-ai-ask';
const assignmentSnapshotChannel = 'uniforge:assignment-snapshot';
const assignmentStartChannel = 'uniforge:assignment-start';
const courseExecutionSnapshotChannel = 'uniforge:course-execution-snapshot';
const courseExecutionStartChannel = 'uniforge:course-execution-start';
const courseNotesSnapshotChannel = 'uniforge:course-notes-snapshot';
const courseNotePersonalCreateChannel = 'uniforge:course-note-personal-create';
const courseNoteAiDraftCreateChannel = 'uniforge:course-note-ai-draft-create';
const courseNoteDraftPublishChannel = 'uniforge:course-note-draft-publish';

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
      materials: Object.freeze({
        chooseAndImport: () => ipcRenderer.invoke(courseMaterialImportChannel),
      }),
      recognition: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(courseRecognitionSnapshotChannel),
        confirm: (proposalId: string) =>
          ipcRenderer.invoke(courseRecognitionConfirmChannel, proposalId),
      }),
      ai: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(courseAiSnapshotChannel),
        ask: (input: unknown) => ipcRenderer.invoke(courseAiAskChannel, input),
      }),
      assignments: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(assignmentSnapshotChannel),
        start: (input: unknown) => ipcRenderer.invoke(assignmentStartChannel, input),
      }),
      execution: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(courseExecutionSnapshotChannel),
        start: (input: unknown) => ipcRenderer.invoke(courseExecutionStartChannel, input),
      }),
      notes: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(courseNotesSnapshotChannel),
        createPersonal: (input: unknown) =>
          ipcRenderer.invoke(courseNotePersonalCreateChannel, input),
        createAiDraft: (input: unknown) =>
          ipcRenderer.invoke(courseNoteAiDraftCreateChannel, input),
        publishDraft: (input: unknown) => ipcRenderer.invoke(courseNoteDraftPublishChannel, input),
      }),
    }),
    ...(testPreferences ? { testPreferences } : {}),
  }),
);
