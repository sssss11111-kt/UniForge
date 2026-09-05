import type { Id, Instant } from '../domain/primitives.js';

export type ExamScope = readonly string[];
export type ReviewPlanStatus = 'WAITING_APPROVAL' | 'READY' | 'FAILED';
export type ReviewPlanError = 'APPROVAL_DENIED' | 'INVALID_INPUT';

export interface ExamProvenance {
  readonly recordedBy: 'USER' | 'SYSTEM' | 'AI';
  readonly recordedAt: Instant;
  readonly source: {
    readonly kind: 'COURSE' | 'MATERIAL' | 'MASTERY' | 'USER';
    readonly referenceId: string;
    readonly locator?: string;
  };
}

export interface Exam {
  readonly id: Id<'exam'>;
  readonly courseId: Id<'course'>;
  readonly date: Instant;
  readonly scope: ExamScope;
  readonly provenance: ExamProvenance;
}

export interface ReviewMasteryInput {
  readonly conceptRef: string;
  readonly score: number;
  readonly evidenceIds: readonly string[];
}

export interface ReviewSession {
  readonly id: string;
  readonly date: string;
  readonly conceptRef: string;
  readonly minutes: number;
  readonly reason: 'LOW_MASTERY' | 'SCOPE_COVERAGE';
}

export interface ReviewPlan {
  readonly id: Id<'review-plan'>;
  readonly exam: Exam;
  readonly courseId: Id<'course'>;
  readonly status: ReviewPlanStatus;
  readonly goal: string;
  readonly availableMinutesPerDay: number;
  readonly sessions: readonly ReviewSession[];
  readonly provenance: ExamProvenance;
  readonly approvalId?: string;
  readonly error?: ReviewPlanError;
  readonly createdAt: Instant;
}

export interface ReviewPlanSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly state: 'EMPTY' | 'READY' | 'WAITING_APPROVAL' | 'FAILED';
  readonly plans: readonly ReviewPlan[];
  readonly error?: 'PERMISSION_DENIED' | 'INVALID_INPUT' | 'NOT_FOUND' | 'APPROVAL_DENIED';
}

export interface CreateReviewPlanInput {
  readonly planId: Id<'review-plan'>;
  readonly examId: Id<'exam'>;
  readonly courseId: Id<'course'>;
  readonly examDate: Instant;
  readonly scope: ExamScope;
  readonly mastery: readonly ReviewMasteryInput[];
  readonly availableMinutesPerDay: number;
  readonly goal: string;
  readonly provenance: ExamProvenance;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}

export interface ReviewApprovalPort {
  request(input: {
    readonly planId: Id<'review-plan'>;
    readonly courseId: Id<'course'>;
  }): Promise<
    | { readonly status: 'APPROVED'; readonly approvalId?: string }
    | { readonly status: 'PENDING'; readonly approvalId: string }
    | { readonly status: 'DENIED'; readonly approvalId?: string }
  >;
}
