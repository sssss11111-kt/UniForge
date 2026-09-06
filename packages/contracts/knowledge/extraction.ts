export interface ExtractionCitation { contentId: string; quote: string; locator?: string; }
export interface ExtractionProposal { id: string; targetType: 'SUMMARY' | 'FACT' | 'RELATION'; body: string; citations: readonly ExtractionCitation[]; generatedBy: 'USER' | 'AI'; label: 'AI Generated' | 'User Authored'; approval: 'PENDING' | 'APPROVED' | 'REJECTED'; }
export interface CreateExtractionProposalInput { proposal: ExtractionProposal; permissions: readonly string[]; }
export interface ApproveExtractionInput { proposalId: string; permissions: readonly string[]; }
