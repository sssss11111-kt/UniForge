import type { Id, Instant } from '../domain/primitives.js';

export type AssignmentMode = 'TUTORING' | 'COLLABORATION' | 'TASK_EXECUTION';
export type AssignmentSessionStatus = 'RUNNING' | 'WAITING_APPROVAL' | 'FAILED' | 'UNAVAILABLE';

export interface AssignmentCapabilities {
  readonly codeExecution: boolean;
  readonly sourceWrite: boolean;
  readonly submit: false;
}

export interface AssignmentSession {
  readonly sessionId: Id<'assignment-session'>;
  readonly assignmentId: Id<'assessment'>;
  readonly courseId: Id<'course'>;
  readonly mode: AssignmentMode;
  readonly prompt: string;
  readonly status: AssignmentSessionStatus;
  readonly capabilities: AssignmentCapabilities;
  readonly startedAt: Instant;
  readonly approvalId?: string;
  readonly error?: 'APPROVAL_DENIED' | 'EXECUTION_UNAVAILABLE';
}

export interface StartAssignmentInput {
  readonly sessionId?: Id<'assignment-session'>;
  readonly assignmentId: Id<'assessment'>;
  readonly courseId: Id<'course'>;
  readonly mode: AssignmentMode;
  readonly prompt: string;
  readonly approvalId?: string;
  readonly context: {
    readonly actor: 'user' | 'agent';
    readonly permissions: readonly string[];
  };
}

export interface AssignmentSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly sessions: readonly AssignmentSession[];
}
