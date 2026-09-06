import { describe, expect, it } from 'vitest';
import { NewsVerificationService } from './news-verification-service.js';
describe('NewsVerificationService', () => {
  it('keeps conflicting evidence visible and records corrections', () => {
    const s = new NewsVerificationService();
    s.verify({
      claimId: 'c',
      status: 'CONFLICTING',
      supportingSourceIds: ['s1'],
      conflictingSourceIds: ['s2'],
      permissions: ['news:write'],
    });
    s.correct({
      correction: {
        id: 'x',
        claimId: 'c',
        previousText: 'old',
        correctedText: 'new',
        reason: 'source update',
        sourceIds: ['s3'],
        createdAt: '2026-09-06T00:00:00Z',
      },
      permissions: ['news:write'],
    });
    expect(s.getVerification('c', ['news:read'])?.status).toBe('CONFLICTING');
    expect(s.getCorrections('c', ['news:read'])).toHaveLength(1);
  });
  it('requires evidence and permission', () => {
    const s = new NewsVerificationService();
    expect(() =>
      s.verify({
        claimId: 'c',
        status: 'VERIFIED',
        supportingSourceIds: [],
        conflictingSourceIds: [],
        permissions: ['news:write'],
      }),
    ).toThrow('Supporting');
    expect(() => s.getCorrections('c', [])).toThrow('news:read');
  });
});
