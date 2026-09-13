import { describe, expect, it } from 'vitest';
import { DashboardService } from './dashboard-service.js';

const workspace = {
  id: 'workspace-default',
  name: '测试工作区',
  status: 'ACTIVE' as const,
  rootHandle: 'workspace:test',
};

describe('DashboardService', () => {
  it('composes honest empty states and preserves priority metadata', async () => {
    const service = new DashboardService({
      getWorkspace: async () => workspace,
      getPendingApprovalCount: async () => 0,
    });
    const snapshot = await service.getSnapshot();
    expect(snapshot.workspaceName).toBe('测试工作区');
    expect(snapshot.pendingApprovalCount).toBe(0);
    expect(snapshot.items.map((item) => item.kind)).toEqual([
      'FOCUS',
      'QUICK_START',
      'COURSE',
      'AGENT',
      'SPACE',
    ]);
    expect(snapshot.items.find((item) => item.kind === 'AGENT')?.reason).toContain('审批状态');
    expect(snapshot.items.find((item) => item.kind === 'COURSE')?.priority).toBe('DEADLINE');
  });

  it('reports a read-only workspace without offering a write action', async () => {
    const service = new DashboardService({
      getWorkspace: async () => ({ ...workspace, status: 'READ_ONLY' }),
      getPendingApprovalCount: async () => 0,
    });
    const snapshot = await service.getSnapshot();
    expect(snapshot.items[0]?.state).toBe('READ_ONLY');
    expect(snapshot.items[1]?.actionLabel).toBeUndefined();
    expect(snapshot.items.find((item) => item.kind === 'SPACE')?.state).toBe('READ_ONLY');
  });

  it('shows pending approvals from the trusted source', async () => {
    const service = new DashboardService({
      getWorkspace: async () => workspace,
      getPendingApprovalCount: async () => 2,
    });
    const item = (await service.getSnapshot()).items.find((entry) => entry.kind === 'AGENT');
    expect(item?.state).toBe('AVAILABLE');
    expect(item?.description).toContain('2');
  });
});
