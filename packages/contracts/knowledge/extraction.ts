export interface ExtractionCitation {
  contentId: string;
  quote: string;
  locator?: string;
}

/** A stable domain reference retained alongside an extraction proposal. */
export interface ExtractionEvidenceRef {
  id: string;
  locator?: string;
}

export interface ExtractionProposal {
  id: string;
  targetType: 'SUMMARY' | 'FACT' | 'RELATION';
  body: string;
  citations: readonly ExtractionCitation[];
  generatedBy: 'USER' | 'AI';
  label: 'AI Generated' | 'User Authored';
  approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  /** Model/user confidence, represented as a probability in [0, 1]. */
  confidence?: number;
  /** Canonical evidence identifiers supporting the proposal. */
  evidenceIds?: readonly string[];
  /** Optional richer evidence references for callers that need a locator. */
  evidenceRefs?: readonly ExtractionEvidenceRef[];
}

/** Canonical extraction truth created only by an approved proposal. */
export interface PersistedExtraction {
  proposalId: string;
  targetType: ExtractionProposal['targetType'];
  body: string;
  citations: readonly ExtractionCitation[];
  generatedBy: ExtractionProposal['generatedBy'];
  label: ExtractionProposal['label'];
  confidence: number;
  evidenceIds: readonly string[];
}
export interface CreateExtractionProposalInput {
  proposal: ExtractionProposal;
  permissions: readonly string[];
}
export interface ApproveExtractionInput {
  proposalId: string;
  permissions: readonly string[];
}

export interface RejectExtractionInput {
  proposalId: string;
  permissions: readonly string[];
}
