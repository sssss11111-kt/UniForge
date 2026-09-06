import { describe, expect, it } from 'vitest';
import { LearningDimensionService } from './learning-dimension-service.js';

const provenance = {
  recordedBy: 'USER' as const,
  recordedAt: '2026-09-06T00:00:00.000Z' as never,
  source: { sourceId: 'practice-1', locator: 'item:2' },
};

describe('LearningDimensionService', () => {
  it('records independent evidence and derives each dimension separately', () => {
    const service = new LearningDimensionService(undefined, () => '2026-09-06T00:00:00.000Z');

    service.recordEvidence({
      evidenceId: 'dimension-evidence-1',
      vocabularyEntryId: 'vocabulary-1',
      dimension: 'MEANING',
      outcome: 'INCORRECT',
      provenance,
      context: { actor: 'user', permissions: ['learning-dimension:write'] },
    });
    service.recordEvidence({
      evidenceId: 'dimension-evidence-2',
      vocabularyEntryId: 'vocabulary-1',
      dimension: 'SPELLING',
      outcome: 'CORRECT',
      score: 0.8,
      provenance,
      context: { actor: 'user', permissions: ['learning-dimension:write'] },
    });

    const snapshot = service.getSnapshot('vocabulary-1');
    expect(snapshot.status).toBe('ready');
    expect(snapshot.dimensions.MEANING).toMatchObject({ attempts: 1, errors: 1, score: 0 });
    expect(snapshot.dimensions.SPELLING).toMatchObject({ attempts: 1, errors: 0, score: 0.8 });
    expect(snapshot.dimensions.LISTENING).toMatchObject({ attempts: 0, errors: 0, score: null });
    expect(snapshot.evidence[0]?.provenance.source.sourceId).toBe('practice-1');
  });

  it('preserves partial updates and validates provenance, score, and permission', () => {
    const service = new LearningDimensionService();
    const input = {
      evidenceId: 'dimension-evidence-3',
      vocabularyEntryId: 'vocabulary-2',
      dimension: 'COLLOCATION' as const,
      outcome: 'INCORRECT' as const,
      provenance,
      context: { actor: 'user' as const, permissions: ['learning-dimension:write'] },
    };
    expect(() => service.recordEvidence({ ...input, context: { actor: 'user', permissions: [] } })).toThrow(
      'permission denied',
    );
    expect(() => service.recordEvidence({ ...input, score: 2 })).toThrow('score');
    expect(() => service.recordEvidence({ ...input, provenance: { ...provenance, recordedAt: 'yesterday' as never } })).toThrow(
      'provenance',
    );
    service.recordEvidence(input);
    expect(service.getSnapshot('vocabulary-2').dimensions.COLLOCATION.errors).toBe(1);
    expect(service.getSnapshot('vocabulary-2').dimensions.CONTEXT.attempts).toBe(0);
  });

  it('rejects unknown entries and returns defensive snapshots', () => {
    const service = new LearningDimensionService();
    expect(() => service.getSnapshot('missing')).toThrow('not found');
    service.recordError('vocabulary-3', 'MORPHOLOGY', provenance, {
      actor: 'user',
      permissions: ['learning-dimension:write'],
    });
    const snapshot = service.getSnapshot('vocabulary-3');
    snapshot.evidence[0]!.provenance.source.sourceId = 'mutated';
    expect(service.getSnapshot('vocabulary-3').evidence[0]?.provenance.source.sourceId).toBe('practice-1');
  });
});
