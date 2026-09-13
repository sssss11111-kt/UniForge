import type { ProjectWorkspaceSnapshot } from '@uniforge/contracts';
export class ProjectWorkspaceSnapshotService {
  getSnapshot(permissions: readonly string[]): ProjectWorkspaceSnapshot {
    if (!permissions.includes('project:read')) throw new Error('Missing permission: project:read');
    return {
      status: 'READY',
      projectCount: 0,
      taskCount: 0,
      runningExecutions: 0,
      reviewArtifacts: 0,
      failedOperations: 0,
      files: [],
      git: { status: 'UNAVAILABLE', branch: null },
      test: { status: 'NOT_RUN', summary: '尚未授权项目工作区' },
    };
  }
}
