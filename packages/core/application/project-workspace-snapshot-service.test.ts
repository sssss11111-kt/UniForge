import { describe, expect, it } from 'vitest';
import { ProjectWorkspaceSnapshotService } from './project-workspace-snapshot-service.js';
describe('ProjectWorkspaceSnapshotService', () => {
  it('returns honest empty state', () =>
    expect(new ProjectWorkspaceSnapshotService().getSnapshot(['project:read'])).toMatchObject({
      status: 'READY',
      failedOperations: 0,
    }));
  it('fails closed', () =>
    expect(() => new ProjectWorkspaceSnapshotService().getSnapshot([])).toThrow('project:read'));
});
