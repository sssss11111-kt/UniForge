import type { EntityId, IsoUtc } from './primitives.js';
export type MemoryOutcome = 'ADMITTED' | 'REJECTED' | 'SUPERSEDED' | 'FORGOTTEN';
export type MemoryScope = 'PERSONAL' | 'WORKSPACE';
export type MemoryAuthorization = 'USER_CONFIRMED' | 'RULE_CONFIRMED';
export interface Evidence {
  evidenceId: EntityId;
  sourceType: 'conversation' | 'document' | 'user';
  sourceRef: string;
  capturedAt: IsoUtc;
  contentHash?: string;
}
export interface MemoryCandidate {
  candidateId: EntityId;
  claim: string;
  evidence: readonly Evidence[];
  scope: MemoryScope;
  createdAt: IsoUtc;
  confidence?: number;
  source?: string;
}
export interface MemoryClaim {
  claimId: EntityId;
  candidateId: EntityId;
  claim: string;
  evidenceIds: readonly EntityId[];
  outcome: MemoryOutcome;
  createdAt: IsoUtc;
  reviewedAt?: IsoUtc;
  version?: number;
  scope?: MemoryScope;
  authorization?: MemoryAuthorization;
  confidence?: number;
  source?: string;
}

export interface MemoryReceipt {
  receiptId: EntityId;
  sourceType: 'conversation' | 'document' | 'user';
  sourceRef: string;
  content: string;
  capturedAt: IsoUtc;
}
