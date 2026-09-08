import type {
  ApproveExtractionInput,
  CreateExtractionProposalInput,
  ExtractionProposal,
  PersistedExtraction,
  RejectExtractionInput,
} from '@uniforge/contracts';
export class ExtractionService {
  private readonly proposals = new Map<string, ExtractionProposal>();
  private readonly persisted = new Map<string, PersistedExtraction>();
  create(input: CreateExtractionProposalInput): ExtractionProposal {
    this.require(input.permissions, 'knowledge:propose');
    const proposal = input.proposal;
    if (this.proposals.has(proposal.id)) throw new Error('Proposal already exists');
    if (!proposal.body.trim()) throw new Error('Extraction body is required');
    if (!proposal.citations.length) throw new Error('Citation required');
    if (proposal.citations.some((citation) => !citation.contentId.trim() || !citation.quote.trim()))
      throw new Error('Citation content and quote are required');
    if (proposal.generatedBy === 'AI' && proposal.label !== 'AI Generated')
      throw new Error('AI Generated label required');
    if (proposal.generatedBy === 'USER' && proposal.label !== 'User Authored')
      throw new Error('User Authored label required');
    if (
      proposal.confidence !== undefined &&
      (!Number.isFinite(proposal.confidence) || proposal.confidence < 0 || proposal.confidence > 1)
    )
      throw new Error('Confidence must be between 0 and 1');
    const copy: ExtractionProposal = {
      ...proposal,
      approval: 'PENDING',
      confidence: proposal.confidence ?? 0.5,
      evidenceIds: this.evidenceIds(proposal),
      citations: proposal.citations.map((citation) => ({ ...citation })),
      ...(proposal.evidenceRefs
        ? { evidenceRefs: proposal.evidenceRefs.map((evidence) => ({ ...evidence })) }
        : {}),
    };
    this.proposals.set(copy.id, copy);
    return this.cloneProposal(copy);
  }
  approve(input: ApproveExtractionInput): ExtractionProposal {
    this.require(input.permissions, 'knowledge:write');
    const proposal = this.requireProposal(input.proposalId);
    if (proposal.approval !== 'PENDING') throw new Error('Proposal is no longer pending');
    const approved: ExtractionProposal = { ...proposal, approval: 'APPROVED' };
    this.proposals.set(approved.id, approved);
    this.persisted.set(approved.id, {
      proposalId: approved.id,
      targetType: approved.targetType,
      body: approved.body,
      citations: approved.citations.map((citation) => ({ ...citation })),
      generatedBy: approved.generatedBy,
      label: approved.label,
      confidence: approved.confidence ?? 0.5,
      evidenceIds: [...(approved.evidenceIds ?? [])],
    });
    return this.cloneProposal(approved);
  }
  reject(input: RejectExtractionInput): ExtractionProposal {
    this.require(input.permissions, 'knowledge:write');
    const proposal = this.requireProposal(input.proposalId);
    if (proposal.approval !== 'PENDING') throw new Error('Proposal is no longer pending');
    const rejected: ExtractionProposal = { ...proposal, approval: 'REJECTED' };
    this.proposals.set(rejected.id, rejected);
    this.persisted.delete(rejected.id);
    return this.cloneProposal(rejected);
  }
  get(id: string, permissions: readonly string[]): ExtractionProposal | null {
    this.require(permissions, 'knowledge:read');
    const proposal = this.proposals.get(id);
    return proposal ? this.cloneProposal(proposal) : null;
  }
  list(permissions: readonly string[]): ExtractionProposal[] {
    this.require(permissions, 'knowledge:read');
    return [...this.proposals.values()].map((proposal) => this.cloneProposal(proposal));
  }
  getPersisted(id: string, permissions: readonly string[]): PersistedExtraction | null {
    this.require(permissions, 'knowledge:read');
    const extraction = this.persisted.get(id);
    return extraction ? this.clonePersisted(extraction) : null;
  }
  listPersisted(permissions: readonly string[]): PersistedExtraction[] {
    this.require(permissions, 'knowledge:read');
    return [...this.persisted.values()].map((extraction) => this.clonePersisted(extraction));
  }
  private evidenceIds(proposal: ExtractionProposal): readonly string[] {
    const ids = proposal.evidenceIds?.length
      ? proposal.evidenceIds
      : proposal.evidenceRefs?.map((evidence) => evidence.id).filter(Boolean);
    return [...new Set(ids?.length ? ids : proposal.citations.map((citation) => citation.contentId))];
  }
  private requireProposal(id: string): ExtractionProposal {
    const proposal = this.proposals.get(id);
    if (!proposal) throw new Error('Proposal not found');
    return proposal;
  }
  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }
  private cloneProposal(proposal: ExtractionProposal): ExtractionProposal {
    return {
      ...proposal,
      citations: proposal.citations.map((citation) => ({ ...citation })),
      ...(proposal.evidenceIds ? { evidenceIds: [...proposal.evidenceIds] } : {}),
      ...(proposal.evidenceRefs
        ? { evidenceRefs: proposal.evidenceRefs.map((evidence) => ({ ...evidence })) }
        : {}),
    };
  }
  private clonePersisted(extraction: PersistedExtraction): PersistedExtraction {
    return {
      ...extraction,
      citations: extraction.citations.map((citation) => ({ ...citation })),
      evidenceIds: [...extraction.evidenceIds],
    };
  }
}
