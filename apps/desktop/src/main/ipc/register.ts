import { app, dialog, ipcMain, type IpcMainInvokeEvent } from 'electron';
import path from 'node:path';
import { DEFAULT_APP_SHELL, type AppShellDto } from '@uniforge/contracts/app-shell/navigation.js';
import { IPC_CHANNELS, type HealthDto } from '@uniforge/contracts/ipc/dto.js';
import type { UpdateModelSettingsInput } from '@uniforge/contracts/settings/index.js';
import { SettingsCenter } from '@uniforge/core/application/settings-center.js';
import { createDefaultDashboardService } from '@uniforge/core/application/dashboard-service.js';
import { CourseService } from '@uniforge/core/application/course-service.js';
import { CourseMaterialService } from '@uniforge/core/application/course-material-service.js';
import { CourseRecognitionService } from '@uniforge/core/application/course-recognition-service.js';
import { CourseAiService } from '@uniforge/core/application/course-ai-service.js';
import { AssignmentService } from '@uniforge/core/application/assignment-service.js';
import type { ModelGateway } from '@uniforge/contracts';
import {
  createCourseMaterialCopy,
  createWorkspaceBackup,
  validateBackup,
} from '@uniforge/infrastructure';
import { ControlledCourseRunner } from '@uniforge/infrastructure';
import { CourseExecutionService } from '@uniforge/core/application/course-execution-service.js';
import { CourseNotesService } from '@uniforge/core/application/course-notes-service.js';
import { CourseMasteryService } from '@uniforge/core/application/course-mastery-service.js';
import { CourseExamReviewService } from '@uniforge/core/application/course-exam-review-service.js';
import type { CourseExecutionRequest } from '@uniforge/contracts/course/execution.js';
import type { CreateAgentRunInput } from '@uniforge/contracts/agent/center.js';
import type { Id } from '@uniforge/contracts/domain/primitives.js';
import { AgentCenterService } from '@uniforge/platform-agent';
import { VoiceService, type SpeechPort } from '@uniforge/core/application/voice-service.js';
import type { VoiceRequest } from '@uniforge/contracts/voice/index.js';
import { InMemoryRecycleStore, RecycleBinService, ExitCoordinator } from '@uniforge/core';
import type { BackupCreateInput, ExitRequestDto } from '@uniforge/contracts/lifecycle/index.js';
import { KnowledgeWorkspaceService } from '@uniforge/core/application/knowledge-workspace-service.js';
import { NewsWorkspaceService } from '@uniforge/core/application/news-workspace-service.js';
import { ProjectWorkspaceSnapshotService } from '@uniforge/core/application/project-workspace-snapshot-service.js';
import { ExamSpaceService } from '@uniforge/core/application/exam-space-service.js';
import { VocabularyService } from '@uniforge/core/application/vocabulary-service.js';
import { ProjectTaskService } from '@uniforge/core/application/project-task-service.js';
export const registerIpcHandlers = (
  version: string,
  settings = new SettingsCenter(),
  dashboard = createDefaultDashboardService(),
  course = new CourseService(),
  materials = new CourseMaterialService(
    createCourseMaterialCopy(path.join(app.getPath('userData'), 'workspace')),
  ),
  recognition = new CourseRecognitionService((proposal) => course.applyRecognition(proposal)),
  courseAi = new CourseAiService(
    unavailableModel(),
    { collect: async () => [] },
    { request: async () => ({ status: 'PENDING' as const, approvalId: 'approval-course-ai' }) },
  ),
  assignments = new AssignmentService({
    request: async () => ({ status: 'PENDING' as const, approvalId: 'approval-assignment' }),
  }),
  execution = new CourseExecutionService(new ControlledCourseRunner(), {
    check: () => 'REQUIRE_APPROVAL',
    verifyApproval: (input) => Boolean(input.context.approvalId),
  }),
  notes = new CourseNotesService({
    request: async () => ({ status: 'PENDING' as const, approvalId: 'approval-course-note' }),
  }),
  mastery = new CourseMasteryService(),
  reviewPlan = new CourseExamReviewService({
    request: async () => ({ status: 'PENDING' as const, approvalId: 'approval-review-plan' }),
  }),
  agentCenter = new AgentCenterService(),
  voice = new VoiceService(unavailableSpeech()),
  recycle = new RecycleBinService(new InMemoryRecycleStore()),
  exit = new ExitCoordinator([]),
  knowledge = new KnowledgeWorkspaceService(),
  news = new NewsWorkspaceService(),
  project = new ProjectWorkspaceSnapshotService(),
  examSpace = new ExamSpaceService(),
  vocabulary = new VocabularyService(),
  projectTasks = new ProjectTaskService(),
): void => {
  ipcMain.handle(IPC_CHANNELS.health, (event: IpcMainInvokeEvent, payload: unknown): HealthDto => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return { ok: true, version };
  });
  ipcMain.handle(IPC_CHANNELS.knowledgeWorkspaceSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return knowledge.getSnapshot(['knowledge:read']);
  });
  ipcMain.handle(IPC_CHANNELS.newsWorkspaceSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return news.getSnapshot(['news:read']);
  });
  ipcMain.handle(IPC_CHANNELS.projectWorkspaceSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return project.getSnapshot(['project:read']);
  });
  ipcMain.handle(IPC_CHANNELS.englishSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return examSpace.getSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.englishVocabularySnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return vocabulary.getSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.projectTaskSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return projectTasks.getSnapshot(['project:read']);
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
  ipcMain.handle(
    IPC_CHANNELS.dashboardSnapshot,
    async (event: IpcMainInvokeEvent, payload: unknown) => {
      if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
      if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
      return dashboard.getSnapshot();
    },
  );
  ipcMain.handle(IPC_CHANNELS.courseSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return course.getSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.courseCreate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.commandId !== 'string' ||
      typeof input.name !== 'string' ||
      typeof input.termName !== 'string' ||
      typeof input.type !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    return course.createCourse({
      commandId: input.commandId as never,
      name: input.name,
      termName: input.termName,
      type: input.type as never,
      context: { actor: 'user', permissions: ['course:write'] },
    });
  });
  ipcMain.handle(IPC_CHANNELS.courseMaterialImport, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const selected = await dialog.showOpenDialog({ properties: ['openFile'] });
    if (selected.canceled || selected.filePaths.length !== 1) throw new Error('CANCELLED');
    const snapshot = await course.getSnapshot();
    if (!snapshot.course.name) throw new Error('COURSE_REQUIRED');
    return materials.importMaterial({
      commandId: `command-material-${Date.now()}` as never,
      courseId: snapshot.course.id,
      sourcePath: selected.filePaths[0]!,
      context: { actor: 'user', permissions: ['course:write'] },
    });
  });
  ipcMain.handle(IPC_CHANNELS.courseRecognitionSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return recognition.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseRecognitionConfirm, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (typeof payload !== 'string' || !payload.trim()) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await recognition.confirm({
      proposalId: payload as never,
      context: { actor: 'user', permissions: ['course:write'] },
    });
    return recognition.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseAiSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return courseAi.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseAiAsk, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (typeof input.proposalId !== 'string' || typeof input.question !== 'string')
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await courseAi.ask({
      proposalId: input.proposalId as never,
      courseId: snapshot.course.id,
      question: input.question,
      context: { actor: 'user', permissions: ['course:read', 'model:use'] },
    });
    return courseAi.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.assignmentSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return assignments.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.assignmentStart, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.assignmentId !== 'string' ||
      typeof input.mode !== 'string' ||
      typeof input.prompt !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await assignments.start({
      assignmentId: input.assignmentId as never,
      courseId: snapshot.course.id,
      mode: input.mode as never,
      prompt: input.prompt,
      ...(typeof input.sessionId === 'string' ? { sessionId: input.sessionId as never } : {}),
      ...(typeof input.approvalId === 'string' ? { approvalId: input.approvalId } : {}),
      context: { actor: 'user', permissions: ['course:read', 'assignment:execute'] },
    });
    return assignments.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseExecutionSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return execution.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseExecutionStart, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.executionId !== 'string' ||
      typeof input.assignmentId !== 'string' ||
      typeof input.workspaceRoot !== 'string' ||
      typeof input.entrypoint !== 'string' ||
      typeof input.operation !== 'string' ||
      !Array.isArray(input.command) ||
      typeof input.timeoutMs !== 'number' ||
      input.processLimit !== 1
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await execution.execute({
      executionId: input.executionId as never,
      courseId: snapshot.course.id,
      assignmentId: input.assignmentId as never,
      workspaceRoot: input.workspaceRoot,
      entrypoint: input.entrypoint,
      operation: input.operation as CourseExecutionRequest['operation'],
      command: input.command.filter((item): item is string => typeof item === 'string'),
      timeoutMs: input.timeoutMs,
      processLimit: input.processLimit,
      context: {
        actor: 'user',
        permissions: ['assignment:execute', 'assignment:code-execute'],
        ...(typeof input.approvalId === 'string' ? { approvalId: input.approvalId } : {}),
      },
    });
    return execution.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseNotesSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return notes.getSnapshot(snapshot.course.id);
  });
  const noteInput = (payload: unknown): Record<string, unknown> => {
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.commandId !== 'string' ||
      typeof input.contentEntityId !== 'string' ||
      typeof input.title !== 'string' ||
      typeof input.body !== 'string' ||
      !Array.isArray(input.citations)
    )
      throw new Error('INVALID_PAYLOAD');
    return input;
  };
  ipcMain.handle(IPC_CHANNELS.courseNotePersonalCreate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    const input = noteInput(payload);
    const snapshot = await course.getSnapshot();
    await notes.createPersonalNote({
      commandId: input.commandId as never,
      courseId: snapshot.course.id,
      contentEntityId: input.contentEntityId as never,
      title: input.title as string,
      body: input.body as string,
      citations: input.citations as never,
      context: { actor: 'user', permissions: ['course:notes:write'] },
    });
    return notes.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseNoteAiDraftCreate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    const input = noteInput(payload);
    const snapshot = await course.getSnapshot();
    await notes.createAiDraft({
      commandId: input.commandId as never,
      courseId: snapshot.course.id,
      contentEntityId: input.contentEntityId as never,
      title: input.title as string,
      body: input.body as string,
      citations: input.citations as never,
      context: { actor: 'user', permissions: ['course:notes:write'] },
    });
    return notes.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseNoteDraftPublish, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { draftId?: unknown }).draftId !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await notes.publishDraft({
      draftId: (payload as { draftId: string }).draftId as never,
      ...(typeof (payload as { approvalId?: unknown }).approvalId === 'string'
        ? { approvalId: (payload as { approvalId: string }).approvalId }
        : {}),
      context: { actor: 'user', permissions: ['course:notes:write'] },
    });
    return notes.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseMasterySnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return mastery.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseMasteryEvidenceRecord, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.evidenceId !== 'string' ||
      typeof input.conceptRef !== 'string' ||
      typeof input.kind !== 'string' ||
      typeof input.value !== 'number' ||
      !input.provenance ||
      typeof input.provenance !== 'object'
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await mastery.recordEvidence({
      evidenceId: input.evidenceId as never,
      courseId: snapshot.course.id,
      conceptRef: input.conceptRef,
      kind: input.kind as never,
      value: input.value,
      provenance: input.provenance as never,
      context: { actor: 'user', permissions: ['course:mastery:write'] },
    });
    return mastery.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseWrongProblemRecord, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.problemId !== 'string' ||
      typeof input.problemRef !== 'string' ||
      typeof input.classification !== 'string' ||
      typeof input.classificationSource !== 'string' ||
      !input.provenance ||
      typeof input.provenance !== 'object'
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await mastery.recordWrongProblem({
      problemId: input.problemId as never,
      courseId: snapshot.course.id,
      problemRef: input.problemRef,
      classification: input.classification as never,
      classificationSource: input.classificationSource as never,
      provenance: input.provenance as never,
      ...(typeof input.note === 'string' ? { note: input.note } : {}),
      context: { actor: 'user', permissions: ['course:mastery:write'] },
    });
    return mastery.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseWrongProblemCorrect, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { problemId?: unknown }).problemId !== 'string' ||
      typeof (payload as { classification?: unknown }).classification !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await mastery.correctWrongProblem({
      problemId: (payload as { problemId: string }).problemId as never,
      courseId: snapshot.course.id,
      classification: (payload as { classification: string }).classification as never,
      context: { actor: 'user', permissions: ['course:mastery:write'] },
    });
    return mastery.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseReviewPlanSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    return reviewPlan.getSnapshot(snapshot.course.id);
  });
  ipcMain.handle(IPC_CHANNELS.courseReviewPlanCreate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.planId !== 'string' ||
      typeof input.examId !== 'string' ||
      typeof input.examDate !== 'string' ||
      !Array.isArray(input.scope) ||
      !Array.isArray(input.mastery) ||
      typeof input.availableMinutesPerDay !== 'number' ||
      typeof input.goal !== 'string' ||
      !input.provenance ||
      typeof input.provenance !== 'object'
    )
      throw new Error('INVALID_PAYLOAD');
    const snapshot = await course.getSnapshot();
    await reviewPlan.createPlan({
      planId: input.planId as never,
      examId: input.examId as never,
      courseId: snapshot.course.id,
      examDate: input.examDate as never,
      scope: input.scope as string[],
      mastery: input.mastery as never,
      availableMinutesPerDay: input.availableMinutesPerDay,
      goal: input.goal,
      provenance: input.provenance as never,
      context: { actor: 'user', permissions: ['course:review-plan:write'] },
    });
    return reviewPlan.getSnapshot(snapshot.course.id);
  });
  const agentContext = {
    actorId: 'actor-user' as Id<'actor'>,
    workspaceId: 'workspace-default' as Id<'workspace'>,
    correlationId: `agent-center-${Date.now()}`,
    permissions: [
      'agent:run:create',
      'agent:run:control',
      'agent:approval:request',
      'agent:approval:resolve',
    ],
  } as const;
  const agentInput = (payload: unknown): CreateAgentRunInput => {
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.taskId !== 'string' ||
      typeof input.runtime !== 'string' ||
      !input.definition ||
      typeof input.definition !== 'object'
    )
      throw new Error('INVALID_PAYLOAD');
    return {
      taskId: input.taskId as Id<'task'>,
      runtime: input.runtime,
      definition: input.definition as CreateAgentRunInput['definition'],
    };
  };
  const agentSnapshot = async () => agentCenter.getSnapshot(agentContext);
  ipcMain.handle(IPC_CHANNELS.agentCenterSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return agentSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.agentCenterCreate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    const result = await agentCenter.createRun(agentContext, agentInput(payload));
    if (!result.ok) throw new Error(result.error.code);
    return agentSnapshot();
  });
  const agentRunId = (payload: unknown): Id<'agent-run'> => {
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { runId?: unknown }).runId !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    return (payload as { runId: string }).runId as Id<'agent-run'>;
  };
  ipcMain.handle(IPC_CHANNELS.agentCenterStart, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    const result = await agentCenter.start(agentContext, agentRunId(payload));
    if (!result.ok) throw new Error(result.error.code);
    return agentSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.agentCenterApprovalResolve, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    const result = await agentCenter.resolveApproval(agentContext, agentRunId(payload));
    if (!result.ok) throw new Error(result.error.code);
    return agentSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.agentCenterApprovalReject, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { reason?: unknown }).reason !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    const result = await agentCenter.rejectApproval(
      agentContext,
      agentRunId(payload),
      (payload as { reason: string }).reason,
    );
    if (!result.ok) throw new Error(result.error.code);
    return agentSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.agentCenterCancel, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    const input = payload as { runId: Id<'agent-run'>; reason?: string };
    const result = await agentCenter.cancel(agentContext, agentRunId(payload), input?.reason);
    if (!result.ok) throw new Error(result.error.code);
    return agentSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.voiceSnapshot, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return voice.getSnapshot();
  });
  ipcMain.handle(IPC_CHANNELS.voiceExecute, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (
      typeof input.requestId !== 'string' ||
      (input.operation !== 'STT' && input.operation !== 'TTS') ||
      (input.mode !== 'GLOBAL' && input.mode !== 'AGENT_INPUT')
    )
      throw new Error('INVALID_PAYLOAD');
    const result = await voice.execute({
      ...input,
      context: { actor: 'user', permissions: ['voice:use'] },
    } as unknown as VoiceRequest);
    return result.value;
  });
  ipcMain.handle(IPC_CHANNELS.voiceCancel, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { requestId?: unknown }).requestId !== 'string'
    )
      throw new Error('INVALID_PAYLOAD');
    return (await voice.cancel((payload as { requestId: string }).requestId)).value;
  });
  const workspaceRoot = path.resolve(app.getPath('userData'), 'workspace');
  ipcMain.handle(IPC_CHANNELS.backupCreate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (!payload || typeof payload !== 'object') throw new Error('INVALID_PAYLOAD');
    const input = payload as Record<string, unknown>;
    if (typeof input.schemaVersion !== 'number' || !('domainData' in input))
      throw new Error('INVALID_PAYLOAD');
    const selected = await dialog.showSaveDialog({
      defaultPath: path.join(workspaceRoot, 'backups', `backup-${Date.now()}.json`),
    });
    if (selected.canceled || !selected.filePath) throw new Error('CANCELLED');
    const result = await createWorkspaceBackup(
      selected.filePath,
      workspaceRoot,
      input as unknown as BackupCreateInput,
    );
    if (!result.ok) throw new Error(result.error.code);
    return { status: 'CREATED' as const, manifest: result.value };
  });
  ipcMain.handle(IPC_CHANNELS.backupValidate, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (typeof payload !== 'string' || !payload.trim()) throw new Error('INVALID_PAYLOAD');
    const result = await validateBackup(payload);
    return result.ok
      ? { status: 'CREATED' as const, manifest: result.value }
      : { status: 'INVALID' as const, error: result.error.message };
  });
  ipcMain.handle(IPC_CHANNELS.recycleList, (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    return { entries: recycle.list('workspace-default') };
  });
  ipcMain.handle(IPC_CHANNELS.recycleRestore, (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (typeof payload !== 'string' || !payload.trim()) throw new Error('INVALID_PAYLOAD');
    recycle.restore(payload);
    return { entries: recycle.list('workspace-default') };
  });
  ipcMain.handle(IPC_CHANNELS.exitRequest, (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (
      !payload ||
      typeof payload !== 'object' ||
      typeof (payload as { hasUnsavedChanges?: unknown }).hasUnsavedChanges !== 'boolean'
    )
      throw new Error('INVALID_PAYLOAD');
    return exit.decide(payload as ExitRequestDto);
  });
  ipcMain.handle(IPC_CHANNELS.exitShutdown, async (event, payload: unknown) => {
    if (!event.sender || event.sender.isDestroyed()) throw new Error('INVALID_SENDER');
    if (payload !== undefined) throw new Error('INVALID_PAYLOAD');
    const result = await exit.shutdown();
    if (!result.failures.length) app.quit();
    return result;
  });
};

function unavailableSpeech(): SpeechPort {
  return {
    health: async () => ({ status: 'unavailable', reason: 'Speech runtime not provisioned' }),
    transcribe: async () => {
      throw new Error('Speech runtime not provisioned');
    },
    synthesize: async () => {
      throw new Error('Speech runtime not provisioned');
    },
    cancel: async () => undefined,
  };
}

function unavailableModel(): ModelGateway {
  const failed = async () => ({
    ok: false as const,
    error: {
      code: 'UNAVAILABLE' as const,
      message: 'No model provider is configured',
      correlationId: 'course-ai',
    },
  });
  return {
    generate: failed,
    stream: async function* () {
      yield { type: 'error', error: { message: 'No model provider is configured' } } as const;
    },
    embed: failed,
    probeCapabilities: async () => ({
      ok: false as const,
      error: {
        code: 'UNAVAILABLE' as const,
        message: 'No model provider is configured',
        correlationId: 'course-ai',
      },
    }),
    estimateUsage: () => ({
      ok: true as const,
      value: { inputTokens: null, maxOutputTokens: 1200, estimatedCost: null },
    }),
  } as ModelGateway;
}
