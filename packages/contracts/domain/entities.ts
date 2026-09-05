import type { Entity, Id, Instant, Json } from './primitives.js';
export type TaskStatus = 'CREATED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
export type WorkspaceStatus = 'ACTIVE' | 'READ_ONLY';
export type OwnerRef = {
  kind: 'workspace' | 'course' | 'project' | 'exam-space' | 'content' | 'news';
  id: Id<string>;
};
export interface Workspace extends Entity<'workspace'> {
  name: string;
  status: WorkspaceStatus;
  rootHandle: string;
}
export interface Task extends Entity<'task'> {
  title: string;
  status: TaskStatus;
  owner: OwnerRef;
}
export interface Artifact extends Entity<'artifact'> {
  kind: string;
  managedFileId: Id<'managed-file'>;
  sha256: string;
  runId?: Id<'agent-run'>;
}
export interface ApprovalRef {
  approvalId: Id<'approval'>;
  decision: 'APPROVED' | 'DENIED' | 'PENDING';
}
export interface AgentRunRef {
  runId: Id<'agent-run'>;
  status: string;
}
export interface ReferenceEntity<K extends string> extends Entity<K> {
  sourceId?: Id<'source'>;
  parentId?: Id<string>;
  metadata?: Json;
}
export type CourseRef = ReferenceEntity<'course'>;
export type ExamSpaceRef = ReferenceEntity<'exam-space'>;
export type ProjectRef = ReferenceEntity<'project'>;
export type ContentEntityRef = ReferenceEntity<'content'>;
export type SourceEventRef = ReferenceEntity<'source-event'> & {
  externalId: string;
  sourceId: Id<'source'>;
  observedAt: Instant;
};
export type TopicRef = ReferenceEntity<'topic'>;
export type VocabularyEntryRef = ReferenceEntity<'vocabulary-entry'>;
export type LearningEventRef = ReferenceEntity<'learning-event'>;
export type NewsEventRef = ReferenceEntity<'news-event'> & { contentId: Id<'content'> };
export type WorkflowRef = ReferenceEntity<'workflow'>;
export type MemoryClaimRef = ReferenceEntity<'memory-claim'>;
export type DecisionRef = ReferenceEntity<'decision'>;
export type ProjectTaskRef = ReferenceEntity<'project-task'> & { taskId: Id<'task'> };
