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
import type { ModelGateway } from '@uniforge/contracts';
import { createCourseMaterialCopy } from '@uniforge/infrastructure';
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
): void => {
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
};

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
