import type { NewsWorkspaceSnapshot } from '@uniforge/contracts';
export class NewsWorkspaceService {
  getSnapshot(permissions: readonly string[]): NewsWorkspaceSnapshot {
    if (!permissions.includes('news:read')) throw new Error('Missing permission: news:read');
    return {
      status: 'READY',
      sourceCount: 0,
      eventCount: 0,
      claimCount: 0,
      conflictingCount: 0,
      correctionCount: 0,
      pendingActions: 0,
    };
  }
}
