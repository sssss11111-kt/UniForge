import type { Id, Instant } from '../domain/primitives.js';

export type RecognitionCandidateKind = 'COURSE' | 'CHAPTER' | 'ASSIGNMENT' | 'EXAM' | 'DEADLINE';
export interface RecognitionSource {
  readonly materialId: Id<'course-material'>;
  readonly locator: string;
  readonly label: string;
}
export interface RecognitionCandidate {
  readonly kind: RecognitionCandidateKind;
  readonly title: string;
  readonly dueAt?: Instant;
}
export interface CourseRecognitionProposal {
  readonly proposalId: Id<'course-recognition'>;
  readonly courseId: Id<'course'>;
  readonly source: RecognitionSource;
  readonly confidence: number;
  readonly candidates: readonly RecognitionCandidate[];
  readonly status: 'PENDING_CONFIRMATION' | 'CONFIRMED';
  readonly createdAt: Instant;
  readonly confirmedAt?: Instant;
}
export interface ProposeCourseRecognitionInput {
  readonly proposalId: Id<'course-recognition'>;
  readonly courseId: Id<'course'>;
  readonly source: RecognitionSource;
  readonly confidence: number;
  readonly candidates: readonly RecognitionCandidate[];
}
export interface ConfirmCourseRecognitionInput {
  readonly proposalId: Id<'course-recognition'>;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
export interface CourseRecognitionSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly proposals: readonly CourseRecognitionProposal[];
}
