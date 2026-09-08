import { describe, expect, it } from 'vitest';
import { NewsClaimService } from './news-claim-service.js';
const claim = { id: 'c', newsEventId: 'n', text: 'claim', evidence: [{ id: 'e', quote: 'q' }], confidence: 0.8, provenance: { origin: 'AI' as const, recordedAt: '2026-09-08T00:00:00.000Z', sourceEventIds: ['s'] } };
describe('NewsClaimService', () => {
  it('keeps AI claims pending until explicitly verified', () => { const s = new NewsClaimService(); const c = s.create({ claim: { ...claim, status: 'VERIFIED' }, permissions: ['news:write'] }); expect(c.status).toBe('PENDING'); expect(s.get('c', ['news:read'])?.status).toBe('PENDING'); expect(s.verify({ claimId: c.id, permissions: ['news:write'] }).status).toBe('VERIFIED'); });
  it('requires evidence and scoped permissions', () => { const s = new NewsClaimService(); expect(() => s.create({ claim: { ...claim, evidence: [] }, permissions: ['news:write'] })).toThrow('Evidence'); expect(() => s.create({ claim, permissions: [] })).toThrow('news:write'); expect(() => s.get('c', [])).toThrow('news:read'); });
  it('supports rejection', () => { const s = new NewsClaimService(); s.create({ claim, permissions: ['news:write'] }); expect(s.reject({ claimId: 'c', permissions: ['news:write'] }).status).toBe('REJECTED'); });
});
