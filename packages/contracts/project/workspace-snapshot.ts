export interface ProjectWorkspaceSnapshot {
  status: 'READY';
  projectCount: number;
  taskCount: number;
  runningExecutions: number;
  reviewArtifacts: number;
  failedOperations: number;
}
