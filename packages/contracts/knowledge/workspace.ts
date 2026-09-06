export interface KnowledgeWorkspaceSnapshot {
  status: 'READY';
  inboxCount: number;
  topicCount: number;
  knowledgeCount: number;
  memoryCount: number;
  actionCount: number;
  pendingApprovals: number;
}
