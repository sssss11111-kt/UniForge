import type { Id } from '../domain/primitives.js';

export type CourseExecutionOperation = 'COMPILE' | 'RUN' | 'TEST' | 'DEBUG';
export type CourseExecutionStatus =
  'WAITING_APPROVAL' | 'DENIED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMED_OUT' | 'CANCELLED';

export interface CourseExecutionContext {
  readonly actor: 'user' | 'agent';
  readonly permissions: readonly string[];
  readonly approvalId?: string;
}

export interface CourseExecutionRequest {
  readonly executionId: Id<'course-execution'>;
  readonly courseId: Id<'course'>;
  readonly assignmentId: Id<'assessment'>;
  readonly workspaceRoot: string;
  readonly entrypoint: string;
  readonly operation: CourseExecutionOperation;
  readonly command: readonly string[];
  readonly timeoutMs: number;
  readonly processLimit: number;
  readonly context: CourseExecutionContext;
}

export interface CourseExecutionResult {
  readonly executionId?: Id<'course-execution'>;
  readonly operation?: CourseExecutionOperation;
  readonly status: CourseExecutionStatus;
  readonly exitCode?: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly durationMs?: number;
  readonly errorCode?:
    | 'PROTECTED_PATH'
    | 'PERMISSION_DENIED'
    | 'APPROVAL_REQUIRED'
    | 'INVALID_INPUT'
    | 'TIMEOUT'
    | 'CANCELLED'
    | 'RUNNER_FAILURE';
}

export interface CourseExecutionRunnerInput {
  readonly request: CourseExecutionRequest;
  readonly signal: AbortSignal;
}

export interface CourseExecutionRunner {
  execute(input: CourseExecutionRunnerInput): Promise<CourseExecutionResult>;
}
export interface CourseExecutionSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly results: readonly CourseExecutionResult[];
}
