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
        approvalId: 'approval-correction-1',
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

  it('requires approval for canonical verification and corrections', () => {
    const s = new NewsVerificationService();
    expect(() => s.verify({
      claimId: 'c', status: 'VERIFIED', supportingSourceIds: ['s1'],
      conflictingSourceIds: [], permissions: ['news:write'],
    })).toThrow('approval');
    expect(() => s.correct({
      correction: {
        id: 'x', claimId: 'c', previousText: 'old', correctedText: 'new',
        reason: 'updated source', sourceIds: ['s1'], createdAt: '2026-09-06T00:00:00Z',
      }, permissions: ['news:write'],
    })).toThrow('approval');
  });

  it('rejects stale corrections and keeps rejected attempts visible', () => {
    const s = new NewsVerificationService();
    s.correct({ correction: {
      id: 'x1', claimId: 'c', previousText: 'old', correctedText: 'new', reason: 'fix',
      sourceIds: ['s1'], createdAt: '2026-09-06T00:00:00Z', approvalId: 'a1',
    }, permissions: ['news:write'] });
    expect(() => s.correct({ correction: {
      id: 'x2', claimId: 'c', previousText: 'old', correctedText: 'other', reason: 'stale',
      sourceIds: ['s2'], createdAt: '2026-09-06T00:00:01Z', approvalId: 'a2',
    }, permissions: ['news:write'] })).toThrow('previous text');
    const attempt = s.recordCorrectionAttempt({ correction: {
      id: 'x2', claimId: 'c', previousText: 'old', correctedText: 'other', reason: 'stale',
      sourceIds: ['s2'], createdAt: '2026-09-06T00:00:01Z', outcome: 'DENIED',
    }, permissions: ['news:write'] });
    expect(attempt.outcome).toBe('DENIED');
    expect(s.getCorrectionHistory('c', ['news:read'])).toHaveLength(1);
    expect(s.getCorrectionAttempts('c', ['news:read'])).toHaveLength(1);
  });
});
