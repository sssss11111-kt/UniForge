import type { CreateNewsClaimInput, NewsClaim, UpdateNewsClaimStatusInput } from '@uniforge/contracts';
export class NewsClaimService {
  private readonly claims = new Map<string, NewsClaim>();
  create(input: CreateNewsClaimInput): NewsClaim {
    this.require(input.permissions, 'news:write');
    if (!input.claim.newsEventId.trim()) throw new Error('newsEventId is required');
    if (!input.claim.text.trim()) throw new Error('Claim text is required');
    if (!input.claim.evidence.length) throw new Error('Evidence required');
    if (input.claim.confidence < 0 || input.claim.confidence > 1) throw new Error('Confidence must be between 0 and 1');
    const c = {
      ...input.claim,
      evidence: input.claim.evidence.map((x) => ({ ...x })),
      provenance: { ...input.claim.provenance, sourceEventIds: [...input.claim.provenance.sourceEventIds] },
      status: 'PENDING' as const,
    };
    this.claims.set(c.id, c);
    return this.clone(c);
  }
  get(id: string, permissions: readonly string[]): NewsClaim | null {
    this.require(permissions, 'news:read');
    const c = this.claims.get(id);
    return c ? this.clone(c) : null;
  }
  verify(input: UpdateNewsClaimStatusInput): NewsClaim {
    this.require(input.permissions, 'news:write');
    const c = this.claims.get(input.claimId);
    if (!c) throw new Error('Claim not found');
    if (c.provenance.origin === 'AI' && c.status === 'PENDING') { /* verification is an explicit write */ }
    const a = { ...c, status: 'VERIFIED' as const }; this.claims.set(c.id, a); return this.clone(a);
  }
  reject(input: UpdateNewsClaimStatusInput): NewsClaim {
    this.require(input.permissions, 'news:write');
    const c = this.claims.get(input.claimId); if (!c) throw new Error('Claim not found');
    const a = { ...c, status: 'REJECTED' as const }; this.claims.set(c.id, a); return this.clone(a);
  }
  private clone(c: NewsClaim): NewsClaim { return { ...c, evidence: c.evidence.map((x) => ({ ...x })), provenance: { ...c.provenance, sourceEventIds: [...c.provenance.sourceEventIds] } }; }
  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }
}
