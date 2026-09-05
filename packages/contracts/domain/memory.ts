import type { EntityId, IsoUtc } from './primitives.js';
export type MemoryOutcome = 'ADMITTED' | 'REJECTED' | 'SUPERSEDED' | 'FORGOTTEN';
export interface Evidence {
  evidenceId: EntityId;
  sourceType: 'conversation' | 'document' | 'user';
  sourceRef: string;
  capturedAt: IsoUtc;
}
export interface MemoryCandidate {
  candidateId: EntityId;
  claim: string;
  evidence: readonly Evidence[];
  scope: 'PERSONAL' | 'WORKSPACE';
  createdAt: IsoUtc;
}
export interface MemoryClaim {
  claimId: EntityId;
  candidateId: EntityId;
  claim: string;
  evidenceIds: readonly EntityId[];
  outcome: MemoryOutcome;
  createdAt: IsoUtc;
}
