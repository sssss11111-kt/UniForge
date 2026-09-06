import type { KnowledgeWorkspaceSnapshot } from '@uniforge/contracts';
export class KnowledgeWorkspaceService {
  getSnapshot(permissions: readonly string[]): KnowledgeWorkspaceSnapshot {
    if (!permissions.includes('knowledge:read'))
      throw new Error('Missing permission: knowledge:read');
    return {
      status: 'READY',
      inboxCount: 0,
      topicCount: 0,
      knowledgeCount: 0,
      memoryCount: 0,
      actionCount: 0,
      pendingApprovals: 0,
    };
  }
}
