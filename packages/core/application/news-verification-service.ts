import type { NewsCorrection, NewsVerification, VerificationStatus } from '@uniforge/contracts';
export class NewsVerificationService {
  private readonly verifications = new Map<string, NewsVerification>();
  private readonly corrections = new Map<string, NewsCorrection[]>();
  verify(input: {
    claimId: string;
    status: VerificationStatus;
    supportingSourceIds: readonly string[];
    conflictingSourceIds: readonly string[];
    permissions: readonly string[];
  }): NewsVerification {
    if (!input.permissions.includes('news:write'))
      throw new Error('Missing permission: news:write');
    if (input.status === 'VERIFIED' && !input.supportingSourceIds.length)
      throw new Error('Supporting source required');
    if (input.status === 'CONFLICTING' && !input.conflictingSourceIds.length)
      throw new Error('Conflicting source required');
    const v = {
      claimId: input.claimId,
      status: input.status,
      supportingSourceIds: [...input.supportingSourceIds],
      conflictingSourceIds: [...input.conflictingSourceIds],
      reviewedAt: new Date().toISOString(),
    };
    this.verifications.set(input.claimId, v);
    return { ...v };
  }
  correct(input: { correction: NewsCorrection; permissions: readonly string[] }): NewsCorrection {
    if (!input.permissions.includes('news:write'))
      throw new Error('Missing permission: news:write');
    if (!input.correction.sourceIds.length) throw new Error('Correction source required');
    const c = { ...input.correction, sourceIds: [...input.correction.sourceIds] };
    const history = this.corrections.get(c.claimId) ?? [];
    this.corrections.set(c.claimId, [...history, c]);
    return { ...c };
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
    return (this.corrections.get(id) ?? []).map((c) => ({ ...c, sourceIds: [...c.sourceIds] }));
  }
}
