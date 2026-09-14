import type { LearningDimension, LearningDimensionSnapshot } from './learning-dimensions.js';

export type TrainingExerciseType =
  | 'meaning recognition'
  | 'spelling'
  | 'listening discrimination'
  | 'pronunciation'
  | 'part of speech'
  | 'morphology'
  | 'contextual collocation'
  | 'context'
  | 'secondary sense';

export type TrainingProposalStatus = 'WAITING_APPROVAL' | 'PUBLISHED' | 'DENIED';

export interface AdaptiveTrainingProposal {
  readonly trainingId: string;
  readonly vocabularyEntryId: string;
  readonly dimension: LearningDimension;
  readonly exerciseType: TrainingExerciseType;
  readonly rationale: string;
  readonly labels: readonly ['AI Generated'];
  readonly aiGenerated: true;
  readonly status: TrainingProposalStatus;
  readonly durable: boolean;
  readonly createdAt: string;
  readonly approvalId?: string;
}

export interface ProposeAdaptiveTrainingInput {
  readonly trainingId: string;
  readonly snapshot: LearningDimensionSnapshot;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
  readonly approvalId?: string;
}

export interface AdaptiveTrainingSnapshot {
  readonly vocabularyEntryId: string;
  readonly items: readonly AdaptiveTrainingProposal[];
}
