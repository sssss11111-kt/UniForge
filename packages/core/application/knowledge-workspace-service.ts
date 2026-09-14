import type {
  KnowledgeActionDto,
  KnowledgeInboxItemDto,
  KnowledgeMemoryDto,
  KnowledgeSourceHealthDto,
  KnowledgeTopicDto,
  KnowledgeWorkspaceSnapshot,
} from '@uniforge/contracts';

export interface KnowledgeWorkspaceSeed {
  readonly inbox?: readonly KnowledgeInboxItemDto[];
  readonly topics?: readonly KnowledgeTopicDto[];
  readonly memories?: readonly KnowledgeMemoryDto[];
  readonly actions?: readonly KnowledgeActionDto[];
  readonly sourceHealth?: readonly KnowledgeSourceHealthDto[];
  readonly selectedContentId?: string | null;
  readonly status?: KnowledgeWorkspaceSnapshot['status'];
  readonly readOnly?: boolean;
  readonly error?: string;
}

export class KnowledgeWorkspaceService {
  constructor(private readonly seed: KnowledgeWorkspaceSeed = {}) {}

  getSnapshot(permissions: readonly string[]): KnowledgeWorkspaceSnapshot {
    if (!permissions.includes('knowledge:read'))
      throw new Error('Missing permission: knowledge:read');
    const inbox = [...(this.seed.inbox ?? [])];
    const topics = [...(this.seed.topics ?? [])];
    const memories = [...(this.seed.memories ?? [])];
    const actions = [...(this.seed.actions ?? [])];
    const status = this.seed.status ?? 'READY';
    return {
      status,
      readOnly: this.seed.readOnly ?? true,
      inbox,
      topics,
      memories,
      actions,
      sourceHealth: [...(this.seed.sourceHealth ?? [])],
      selectedContentId: this.seed.selectedContentId ?? inbox[0]?.id ?? null,
      ...(this.seed.error === undefined ? {} : { error: this.seed.error }),
      inboxCount: inbox.length,
      topicCount: topics.length,
      knowledgeCount: inbox.length,
      memoryCount: memories.length,
      actionCount: actions.length,
      pendingApprovals: actions.filter((action) => action.status === 'WAITING_APPROVAL').length,
    };
  }
}
