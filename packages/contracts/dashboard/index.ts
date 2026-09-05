export type DashboardItemKind = 'FOCUS' | 'QUICK_START' | 'COURSE' | 'AGENT' | 'SPACE';

export type DashboardPriority =
  'PINNED' | 'DEADLINE' | 'CONFIRMED_PLAN' | 'AI_RISK' | 'NORMAL_RECOMMENDATION';

export type DashboardItemState = 'AVAILABLE' | 'EMPTY' | 'READ_ONLY' | 'ROADMAP';

export interface DashboardItemDto {
  readonly id: string;
  readonly kind: DashboardItemKind;
  readonly title: string;
  readonly description: string;
  readonly state: DashboardItemState;
  readonly priority?: DashboardPriority;
  readonly reason?: string;
  readonly actionLabel?: string;
}

export interface DashboardSnapshotDto {
  readonly generatedAt: string;
  readonly workspaceName: string;
  readonly workspaceStatus: 'ACTIVE' | 'READ_ONLY';
  readonly items: readonly DashboardItemDto[];
  readonly pendingApprovalCount: number;
}
