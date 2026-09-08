import type { ContentProvenance } from './provenance.js';
type Provenance = ContentProvenance;

export type KnowledgeWorkspaceState =
  | 'READY'
  | 'EMPTY'
  | 'ERROR'
  | 'OFFLINE'
  | 'READ_ONLY'
  | 'APPROVAL';

export interface KnowledgeInboxItemDto {
  readonly id: string;
  readonly title: string;
  readonly sourceName: string;
  readonly capturedAt: string;
  readonly lifecycle: 'ACTIVE' | 'ARCHIVED' | 'FAILED';
  readonly provenance: Provenance;
}

export interface KnowledgeTopicDto {
  readonly id: string;
  readonly name: string;
  readonly itemCount: number;
}

export interface KnowledgeMemoryDto {
  readonly id: string;
  readonly claim: string;
  readonly status: 'CANDIDATE' | 'APPROVED' | 'REJECTED' | 'FORGOTTEN';
  readonly provenance: Provenance;
}

export interface KnowledgeActionDto {
  readonly id: string;
  readonly title: string;
  readonly status: 'PROPOSED' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'FAILED';
  readonly requiresApproval: boolean;
  readonly provenance: Provenance;
}

export interface KnowledgeSourceHealthDto {
  readonly id: string;
  readonly name: string;
  readonly status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';
  readonly lastCheckedAt: string | null;
  readonly message?: string;
}

export interface KnowledgeWorkspaceSnapshot {
  readonly status: KnowledgeWorkspaceState;
  readonly readOnly: boolean;
  readonly inbox: readonly KnowledgeInboxItemDto[];
  readonly topics: readonly KnowledgeTopicDto[];
  readonly memories: readonly KnowledgeMemoryDto[];
  readonly actions: readonly KnowledgeActionDto[];
  readonly sourceHealth: readonly KnowledgeSourceHealthDto[];
  readonly selectedContentId: string | null;
  readonly pendingApprovals: number;
  readonly error?: string;
  readonly inboxCount: number;
  readonly topicCount: number;
  readonly knowledgeCount: number;
  readonly memoryCount: number;
  readonly actionCount: number;
}
