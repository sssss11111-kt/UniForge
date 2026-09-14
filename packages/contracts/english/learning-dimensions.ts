import type { VocabularySourceReference } from './vocabulary.js';

/** Independent abilities used to describe lexical learning evidence. */
export type LearningDimension =
  | 'MEANING'
  | 'SPELLING'
  | 'LISTENING'
  | 'PRONUNCIATION'
  | 'PART_OF_SPEECH'
  | 'MORPHOLOGY'
  | 'COLLOCATION'
  | 'CONTEXT'
  | 'SECONDARY_SENSE';

export const LEARNING_DIMENSIONS: readonly LearningDimension[] = [
  'MEANING',
  'SPELLING',
  'LISTENING',
  'PRONUNCIATION',
  'PART_OF_SPEECH',
  'MORPHOLOGY',
  'COLLOCATION',
  'CONTEXT',
  'SECONDARY_SENSE',
];

export type LearningDimensionOutcome = 'CORRECT' | 'INCORRECT';

export interface LearningDimensionProvenance {
  recordedBy: 'USER' | 'AI' | 'SYSTEM';
  recordedAt: string;
  source: VocabularySourceReference;
}

export interface LearningDimensionEvidence {
  id: string;
  vocabularyEntryId: string;
  dimension: LearningDimension;
  outcome: LearningDimensionOutcome;
  score: number;
  provenance: LearningDimensionProvenance;
  recordedAt: string;
}

export interface RecordLearningDimensionEvidenceInput {
  evidenceId: string;
  vocabularyEntryId: string;
  dimension: LearningDimension;
  outcome: LearningDimensionOutcome;
  /** A partial score is useful for graded listening or pronunciation evidence. */
  score?: number;
  provenance: LearningDimensionProvenance;
  context: { actor: 'user' | 'agent'; permissions: readonly string[] };
}

export interface LearningDimensionSummary {
  dimension: LearningDimension;
  attempts: number;
  correct: number;
  errors: number;
  score: number | null;
  evidenceIds: readonly string[];
}

export interface LearningDimensionSnapshot {
  vocabularyEntryId: string;
  status: 'ready' | 'empty';
  dimensions: Record<LearningDimension, LearningDimensionSummary>;
  evidence: readonly LearningDimensionEvidence[];
}
