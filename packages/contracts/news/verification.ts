export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'CONFLICTING' | 'CORRECTED';
export interface NewsVerification {
  claimId: string;
  status: VerificationStatus;
  supportingSourceIds: readonly string[];
  conflictingSourceIds: readonly string[];
  reviewedAt?: string;
}
export interface NewsCorrection {
  id: string;
  claimId: string;
  previousText: string;
  correctedText: string;
  reason: string;
  sourceIds: readonly string[];
  createdAt: string;
}
