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
const agentCenterSnapshotChannel = 'uniforge:agent-center-snapshot';
const agentCenterCreateChannel = 'uniforge:agent-center-create';
const agentCenterStartChannel = 'uniforge:agent-center-start';
const agentCenterApprovalResolveChannel = 'uniforge:agent-center-approval-resolve';
const agentCenterApprovalRejectChannel = 'uniforge:agent-center-approval-reject';
const agentCenterCancelChannel = 'uniforge:agent-center-cancel';
const voiceSnapshotChannel = 'uniforge:voice-snapshot';
const voiceExecuteChannel = 'uniforge:voice-execute';
const voiceCancelChannel = 'uniforge:voice-cancel';
const backupCreateChannel = 'uniforge:backup-create';
const backupValidateChannel = 'uniforge:backup-validate';
const recycleListChannel = 'uniforge:recycle-list';
const recycleRestoreChannel = 'uniforge:recycle-restore';
const exitRequestChannel = 'uniforge:exit-request';
const exitShutdownChannel = 'uniforge:exit-shutdown';
const knowledgeWorkspaceSnapshotChannel = 'uniforge:knowledge-workspace-snapshot';
const newsWorkspaceSnapshotChannel = 'uniforge:news-workspace-snapshot';
const projectWorkspaceSnapshotChannel = 'uniforge:project-workspace-snapshot';
const englishSnapshotChannel = 'uniforge:english-snapshot';
const englishVocabularySnapshotChannel = 'uniforge:english-vocabulary-snapshot';
const projectTaskSnapshotChannel = 'uniforge:project-task-snapshot';

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
    agentCenter: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(agentCenterSnapshotChannel),
      create: (input: unknown) => ipcRenderer.invoke(agentCenterCreateChannel, input),
      start: (runId: string) => ipcRenderer.invoke(agentCenterStartChannel, { runId }),
      resolveApproval: (runId: string) =>
        ipcRenderer.invoke(agentCenterApprovalResolveChannel, { runId }),
      rejectApproval: (input: { runId: string; reason: string }) =>
        ipcRenderer.invoke(agentCenterApprovalRejectChannel, input),
      cancel: (input: { runId: string; reason?: string }) =>
        ipcRenderer.invoke(agentCenterCancelChannel, input),
    }),
    voice: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(voiceSnapshotChannel),
      execute: (input: unknown) => ipcRenderer.invoke(voiceExecuteChannel, input),
      cancel: (requestId: string) => ipcRenderer.invoke(voiceCancelChannel, { requestId }),
    }),
    backup: Object.freeze({
      create: (input: unknown) => ipcRenderer.invoke(backupCreateChannel, input),
      validate: (source: string) => ipcRenderer.invoke(backupValidateChannel, source),
    }),
    recycle: Object.freeze({
      list: () => ipcRenderer.invoke(recycleListChannel),
      restore: (id: string) => ipcRenderer.invoke(recycleRestoreChannel, id),
    }),
    exit: Object.freeze({
      request: (input: unknown) => ipcRenderer.invoke(exitRequestChannel, input),
      shutdown: () => ipcRenderer.invoke(exitShutdownChannel),
    }),
    knowledge: Object.freeze({
      getSnapshot: () =>
        ipcRenderer.invoke(knowledgeWorkspaceSnapshotChannel) as ReturnType<
          UniforgeApi['knowledge']['getSnapshot']
        >,
    }),
    news: Object.freeze({ getSnapshot: () => ipcRenderer.invoke(newsWorkspaceSnapshotChannel) }),
    project: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(projectWorkspaceSnapshotChannel),
      tasks: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(projectTaskSnapshotChannel),
      }),
    }),
    english: Object.freeze({
      getSnapshot: () => ipcRenderer.invoke(englishSnapshotChannel),
      vocabulary: Object.freeze({
        getSnapshot: () => ipcRenderer.invoke(englishVocabularySnapshotChannel),
      }),
    }),
    ...(testPreferences ? { testPreferences } : {}),
  }),
);
