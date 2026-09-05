import type { Id, Instant } from '../domain/primitives.js';

export type CourseAiSourceCategory =
  'COURSE_MATERIAL' | 'AUTHORIZED_PERSONAL_KNOWLEDGE' | 'MODEL_KNOWLEDGE' | 'ON_DEMAND_WEB';
export interface CourseAiEvidence {
  readonly evidenceId: Id<'evidence'>;
  readonly category: CourseAiSourceCategory;
  readonly materialId?: Id<'course-material'>;
  readonly locator: string;
  readonly label: string;
  readonly excerpt?: string;
}
export interface CourseAiProposal {
  readonly proposalId: Id<'course-ai-proposal'>;
  readonly courseId: Id<'course'>;
  readonly question: string;
  readonly status: 'WAITING_APPROVAL' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  readonly evidence: readonly CourseAiEvidence[];
  readonly sourceCategories: readonly CourseAiSourceCategory[];
  readonly createdAt: Instant;
  readonly approvalId?: string;
  readonly answer?: string;
  readonly error?: string;
}
export interface AskCourseAiInput {
  readonly proposalId: Id<'course-ai-proposal'>;
  readonly courseId: Id<'course'>;
  readonly question: string;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
  readonly approvalId?: string;
}
export interface CourseAiSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly proposals: readonly CourseAiProposal[];
}
