export interface ProjectWorkspaceSnapshot {
  status: 'READY';
  projectCount: number;
  taskCount: number;
  runningExecutions: number;
  reviewArtifacts: number;
  failedOperations: number;
  files: readonly string[];
  git: { readonly status: 'UNAVAILABLE' | 'CLEAN' | 'DIRTY'; readonly branch: string | null };
  test: {
    readonly status: 'UNAVAILABLE' | 'PASSED' | 'FAILED' | 'NOT_RUN';
    readonly summary: string;
  };
}
