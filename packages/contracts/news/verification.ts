export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'CONFLICTING' | 'CORRECTED';
export interface NewsVerification {
  claimId: string;
  status: VerificationStatus;
  supportingSourceIds: readonly string[];
  conflictingSourceIds: readonly string[];
  reviewedAt?: string;
  /** An approval is required when verification changes canonical claim state. */
  approvalId?: string;
  /** Keep an unavailable or incomplete review visible to the UI. */
  uncertainty?: string;
}

export interface NewsCorrectionEvidence {
  readonly sourceId: string;
  readonly quote?: string;
  readonly locator?: string;
}

/** Immutable claim version retained before a correction is applied. */
export interface NewsClaimVersion {
  readonly text: string;
  readonly evidence: readonly NewsCorrectionEvidence[];
  readonly sourceIds: readonly string[];
  readonly recordedAt: string;
}
export interface NewsCorrection {
  id: string;
  claimId: string;
  previousText: string;
  correctedText: string;
  reason: string;
  sourceIds: readonly string[];
  createdAt: string;
  /** Evidence is retained with the correction, alongside the source ids. */
  evidence?: readonly NewsCorrectionEvidence[];
  previousVersion?: NewsClaimVersion;
  /** The approval that authorized this canonical correction. */
  approvalId?: string;
  /** A failed or pending correction proposal is visible but is not canonical. */
  outcome?: 'APPLIED' | 'PENDING_APPROVAL' | 'DENIED' | 'FAILED';
  failure?: { readonly code: string; readonly message: string };
}
