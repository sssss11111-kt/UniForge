import type { NewsCorrection, NewsVerification, VerificationStatus } from '@uniforge/contracts';
export class NewsVerificationService {
  private readonly verifications = new Map<string, NewsVerification>();
  private readonly corrections = new Map<string, NewsCorrection[]>();
  private readonly correctionAttempts = new Map<string, NewsCorrection[]>();
  verify(input: {
    claimId: string;
    status: VerificationStatus;
    supportingSourceIds: readonly string[];
    conflictingSourceIds: readonly string[];
    permissions: readonly string[];
    approvalId?: string;
    uncertainty?: string;
  }): NewsVerification {
    if (!input.permissions.includes('news:write'))
      throw new Error('Missing permission: news:write');
    if (!input.claimId.trim()) throw new Error('Claim id is required');
    if (input.supportingSourceIds.some((id) => !id.trim()) || input.conflictingSourceIds.some((id) => !id.trim()))
      throw new Error('Source id is required');
    if (input.status === 'VERIFIED' && !input.supportingSourceIds.length)
      throw new Error('Supporting source required');
    if (input.status === 'CONFLICTING' && !input.conflictingSourceIds.length)
      throw new Error('Conflicting source required');
    if (input.status === 'VERIFIED' && !input.approvalId?.trim())
      throw new Error('Verification approval required');
    if (input.supportingSourceIds.some((id) => input.conflictingSourceIds.includes(id)))
      throw new Error('A source cannot support and conflict with the same claim');
    const v = {
      claimId: input.claimId,
      status: input.status,
      supportingSourceIds: [...input.supportingSourceIds],
      conflictingSourceIds: [...input.conflictingSourceIds],
      reviewedAt: new Date().toISOString(),
      ...(input.approvalId ? { approvalId: input.approvalId } : {}),
      ...(input.uncertainty ? { uncertainty: input.uncertainty } : {}),
    };
    this.verifications.set(input.claimId, v);
    return { ...v };
  }
  correct(input: { correction: NewsCorrection; permissions: readonly string[] }): NewsCorrection {
    if (!input.permissions.includes('news:write'))
      throw new Error('Missing permission: news:write');
    const correction = input.correction;
    if (!correction.id.trim() || !correction.claimId.trim()) throw new Error('Correction id and claim id are required');
    if (!correction.previousText.trim() || !correction.correctedText.trim())
      throw new Error('Correction text is required');
    if (!correction.reason.trim()) throw new Error('Correction reason is required');
    if (!correction.sourceIds.length) throw new Error('Correction source required');
    if (correction.sourceIds.some((id) => !id.trim())) throw new Error('Correction source required');
    if (!correction.approvalId?.trim()) throw new Error('Correction approval required');
    if (!isIsoTimestamp(correction.createdAt)) throw new Error('Invalid correction timestamp');
    const history = this.corrections.get(correction.claimId) ?? [];
    if (history.some((item) => item.id === correction.id)) throw new Error('Correction already exists');
    const latestText = history.at(-1)?.correctedText;
    if (latestText !== undefined && latestText !== correction.previousText)
      throw new Error('Correction previous text does not match current claim version');
    const c = this.cloneCorrection({
      ...correction,
      sourceIds: [...correction.sourceIds],
      ...(correction.evidence ? { evidence: correction.evidence.map((item) => ({ ...item })) } : {}),
      ...(correction.previousVersion
        ? {
            previousVersion: {
              ...correction.previousVersion,
              evidence: correction.previousVersion.evidence.map((item) => ({ ...item })),
              sourceIds: [...correction.previousVersion.sourceIds],
            },
          }
        : {}),
      outcome: correction.outcome ?? 'APPLIED',
    });
    this.corrections.set(c.claimId, [...history, c]);
    return this.cloneCorrection(c);
  }
  getVerification(id: string, permissions: readonly string[]): NewsVerification | null {
    if (!permissions.includes('news:read')) throw new Error('Missing permission: news:read');
    const v = this.verifications.get(id);
    return v
      ? {
          ...v,
          supportingSourceIds: [...v.supportingSourceIds],
          conflictingSourceIds: [...v.conflictingSourceIds],
        }
      : null;
  }
  getCorrections(id: string, permissions: readonly string[]): readonly NewsCorrection[] {
    if (!permissions.includes('news:read')) throw new Error('Missing permission: news:read');
    return (this.corrections.get(id) ?? []).map((c) => this.cloneCorrection(c));
  }

  /** Alias used by detail views to make append-only history explicit. */
  getCorrectionHistory(id: string, permissions: readonly string[]): readonly NewsCorrection[] {
    return this.getCorrections(id, permissions);
  }

  /** Record a proposal that could not be applied without making it canonical. */
  recordCorrectionAttempt(input: { correction: NewsCorrection; permissions: readonly string[] }): NewsCorrection {
    if (!input.permissions.includes('news:write')) throw new Error('Missing permission: news:write');
    const c = this.cloneCorrection({ ...input.correction, outcome: input.correction.outcome ?? 'PENDING_APPROVAL' });
    const attempts = this.correctionAttempts.get(c.claimId) ?? [];
    this.correctionAttempts.set(c.claimId, [...attempts, c]);
    return this.cloneCorrection(c);
  }

  getCorrectionAttempts(id: string, permissions: readonly string[]): readonly NewsCorrection[] {
    if (!permissions.includes('news:read')) throw new Error('Missing permission: news:read');
    return (this.correctionAttempts.get(id) ?? []).map((c) => this.cloneCorrection(c));
  }

  private cloneCorrection(c: NewsCorrection): NewsCorrection {
    return {
      ...c,
      sourceIds: [...c.sourceIds],
      ...(c.evidence ? { evidence: c.evidence.map((item) => ({ ...item })) } : {}),
      ...(c.previousVersion
        ? {
            previousVersion: {
              ...c.previousVersion,
              evidence: c.previousVersion.evidence.map((item) => ({ ...item })),
              sourceIds: [...c.previousVersion.sourceIds],
            },
          }
        : {}),
      ...(c.failure ? { failure: { ...c.failure } } : {}),
    };
  }
}

function isIsoTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(new Date(value).valueOf());
}
