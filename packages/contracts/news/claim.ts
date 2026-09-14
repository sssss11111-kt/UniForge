/** A citation into a canonical NewsEvent and, when available, its source observation. */
export interface NewsClaimEvidence {
  readonly id: string;
  readonly quote: string;
  readonly sourceEventId?: string;
  readonly locator?: string;
}
export interface NewsClaimProvenance {
  readonly origin: 'USER' | 'AI';
  readonly recordedAt: string;
  readonly sourceEventIds: readonly string[];
  readonly extractionRunId?: string;
}
export type NewsClaimStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export interface NewsClaim {
  readonly id: string;
  readonly newsEventId: string;
  readonly text: string;
  readonly evidence: readonly NewsClaimEvidence[];
  readonly confidence: number;
  readonly status: NewsClaimStatus;
  readonly provenance: NewsClaimProvenance;
}
export interface CreateNewsClaimInput {
  readonly claim: Omit<NewsClaim, 'status'> & { readonly status?: NewsClaimStatus };
  readonly permissions: readonly string[];
}
export interface UpdateNewsClaimStatusInput {
  readonly claimId: string;
  readonly permissions: readonly string[];
}
