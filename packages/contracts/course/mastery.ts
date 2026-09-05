import type { Id, Instant } from '../domain/primitives.js';

export type MasteryEvidenceKind =
  'RECENT_PRACTICE' | 'ACCURACY' | 'HINTS' | 'FORGETTING' | 'SELF_ASSESSMENT' | 'MOCK_RESULT';
export type EvidenceSourceKind = 'PRACTICE' | 'ASSIGNMENT' | 'EXAM' | 'USER' | 'AI';
export interface EvidenceSource {
  readonly kind: EvidenceSourceKind;
  readonly referenceId: string;
  readonly locator?: string;
}
export interface EvidenceProvenance {
  readonly recordedBy: 'USER' | 'AI' | 'SYSTEM';
  readonly recordedAt: Instant;
  readonly source: EvidenceSource;
}
export interface MasteryEvidence {
  readonly id: Id<'mastery-evidence'>;
  readonly courseId: Id<'course'>;
  readonly conceptRef: string;
  readonly value: number;
  readonly kind: MasteryEvidenceKind;
  readonly provenance: EvidenceProvenance;
}
export interface MasteryEntry {
  readonly conceptRef: string;
  readonly score: number;
  readonly evidenceIds: readonly Id<'mastery-evidence'>[];
}
export type WrongProblemStatus = 'OPEN' | 'CORRECTED';
export type WrongProblemClassification =
  'CONCEPT_GAP' | 'CALCULATION' | 'MISREAD' | 'CARELESS' | 'UNKNOWN';
export interface WrongProblem {
  readonly id: Id<'wrong-problem'>;
  readonly courseId?: Id<'course'>;
  readonly problemRef: string;
  readonly status: WrongProblemStatus;
  readonly classification: WrongProblemClassification;
  readonly classificationSource: 'USER' | 'AI' | 'SYSTEM';
  readonly note?: string;
  readonly provenance: readonly EvidenceProvenance[];
  readonly correction?: {
    readonly classification: WrongProblemClassification;
    readonly correctedAt: Instant;
    readonly actor: 'USER';
  };
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
}
export interface MasterySnapshotDto {
  readonly courseId: Id<'course'>;
  readonly state: 'EMPTY' | 'READY' | 'FAILED';
  readonly mastery: readonly MasteryEntry[];
  readonly evidence: readonly MasteryEvidence[];
  readonly wrongProblems: readonly WrongProblem[];
  readonly error?: 'PERMISSION_DENIED' | 'INVALID_INPUT' | 'NOT_FOUND';
}
export interface RecordMasteryEvidenceInput {
  readonly evidenceId: Id<'mastery-evidence'>;
  readonly courseId: Id<'course'>;
  readonly conceptRef: string;
  readonly kind: MasteryEvidenceKind;
  readonly value: number;
  readonly provenance: EvidenceProvenance;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
export interface RecordWrongProblemInput {
  readonly problemId: Id<'wrong-problem'>;
  readonly courseId?: Id<'course'>;
  readonly problemRef: string;
  readonly classification: WrongProblemClassification;
  readonly classificationSource: 'USER' | 'AI' | 'SYSTEM';
  readonly note?: string;
  readonly provenance: EvidenceProvenance;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
export interface CorrectWrongProblemInput {
  readonly problemId: Id<'wrong-problem'>;
  readonly classification: WrongProblemClassification;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
