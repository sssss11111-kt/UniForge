import type { DashboardSnapshotDto } from '@uniforge/contracts/dashboard/index.js';
import type { WorkspaceSettingsDto } from '@uniforge/contracts/settings/index.js';

export interface DashboardStateSource {
  getWorkspace(): Promise<WorkspaceSettingsDto>;
  getPendingApprovalCount(): Promise<number>;
}

/** Composes Dashboard state from trusted application sources. */
export class DashboardService {
  constructor(private readonly source: DashboardStateSource) {}

  async getSnapshot(): Promise<DashboardSnapshotDto> {
    const [workspace, pendingApprovalCount] = await Promise.all([
      this.source.getWorkspace(),
      this.source.getPendingApprovalCount(),
    ]);
    const readOnly = workspace.status === 'READ_ONLY';
    const state = readOnly ? 'READ_ONLY' : 'EMPTY';
    return {
      generatedAt: new Date().toISOString(),
      workspaceName: workspace.name,
      workspaceStatus: workspace.status,
      pendingApprovalCount,
      items: [
        {
          id: 'dashboard-focus',
          kind: 'FOCUS',
          title: '今日焦点',
          description: readOnly
            ? '工作区当前为只读，保留上次快照供查看。'
            : '暂无已确认的今日焦点。',
          state,
          priority: 'CONFIRMED_PLAN',
        },
        {
          id: 'dashboard-quick-start',
          kind: 'QUICK_START',
          title: '快速开始',
          description: readOnly
            ? '只读工作区不能创建新的对象。'
            : '创建课程或任务后，这里会显示可执行入口。',
          state,
          ...(readOnly ? {} : { actionLabel: '查看可用入口' }),
        },
        {
          id: 'dashboard-course',
          kind: 'COURSE',
          title: '课程与考试',
          description: '课程领域尚未创建对象。完成课程设置后，这里会显示截止日期和复习计划。',
          state: 'EMPTY',
          priority: 'DEADLINE',
        },
        {
          id: 'dashboard-agent',
          kind: 'AGENT',
          title: 'Agent 与审批',
          description:
            pendingApprovalCount > 0
              ? `有 ${pendingApprovalCount} 项审批待处理。`
              : '当前没有待处理审批或运行中的 Agent。',
          state: pendingApprovalCount > 0 ? 'AVAILABLE' : 'EMPTY',
          priority: 'AI_RISK',
          reason: '只展示已记录的审批状态，不推断未发生的 Agent 进度。',
        },
        {
          id: 'dashboard-spaces',
          kind: 'SPACE',
          title: '最近空间',
          description: workspace.name,
          state: readOnly ? 'READ_ONLY' : 'AVAILABLE',
          priority: 'PINNED',
        },
      ],
    };
  }
}

export const createDefaultDashboardService = (
  workspace: WorkspaceSettingsDto = {
    id: 'workspace-default',
    name: '默认工作区',
    status: 'ACTIVE',
    rootHandle: 'workspace:default',
  },
): DashboardService =>
  new DashboardService({
    getWorkspace: async () => workspace,
    getPendingApprovalCount: async () => 0,
  });
