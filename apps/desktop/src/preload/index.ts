import { contextBridge, ipcRenderer } from 'electron';
import type { UniforgeApi } from '@uniforge/contracts/ipc/api.js';
import type { MasterySnapshotDto } from '@uniforge/contracts/course/mastery.js';

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
const courseMasterySnapshotChannel = 'uniforge:course-mastery-snapshot';
const courseMasteryEvidenceRecordChannel = 'uniforge:course-mastery-evidence-record';
const courseWrongProblemRecordChannel = 'uniforge:course-wrong-problem-record';
const courseWrongProblemCorrectChannel = 'uniforge:course-wrong-problem-correct';
const courseReviewPlanSnapshotChannel = 'uniforge:course-review-plan-snapshot';
const courseReviewPlanCreateChannel = 'uniforge:course-review-plan-create';

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
      mastery: Object.freeze({
        getSnapshot: () =>
          ipcRenderer.invoke(courseMasterySnapshotChannel) as Promise<MasterySnapshotDto>,
        recordEvidence: (
          input: Parameters<UniforgeApi['course']['mastery']['recordEvidence']>[0],
        ) =>
          ipcRenderer.invoke(
            courseMasteryEvidenceRecordChannel,
            input,
          ) as Promise<MasterySnapshotDto>,
        recordWrongProblem: (
          input: Parameters<UniforgeApi['course']['mastery']['recordWrongProblem']>[0],
        ) =>
          ipcRenderer.invoke(courseWrongProblemRecordChannel, input) as Promise<MasterySnapshotDto>,
        correctWrongProblem: (
          input: Parameters<UniforgeApi['course']['mastery']['correctWrongProblem']>[0],
        ) =>
          ipcRenderer.invoke(
            courseWrongProblemCorrectChannel,
            input,
          ) as Promise<MasterySnapshotDto>,
      }),
      reviewPlan: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(courseReviewPlanSnapshotChannel),
        create: (input: unknown) => ipcRenderer.invoke(courseReviewPlanCreateChannel, input),
      }),
    }),
    ...(testPreferences ? { testPreferences } : {}),
  }),
);
