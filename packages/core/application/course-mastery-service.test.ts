import { describe, expect, it } from 'vitest';
import { CourseMasteryService } from './course-mastery-service.js';

const courseId = 'course-1' as never;
const context = { actor: 'user' as const, permissions: ['course:mastery:write'] };
const provenance = {
  recordedBy: 'USER' as const,
  recordedAt: '2026-09-06T00:00:00.000Z' as never,
  source: { kind: 'PRACTICE' as const, referenceId: 'practice-1', locator: 'item:2' },
};

describe('CourseMasteryService', () => {
  it('starts empty and derives mastery from evidence without copying canonical content', async () => {
    const service = new CourseMasteryService();
    expect((await service.getSnapshot(courseId)).state).toBe('EMPTY');
    await service.recordEvidence({
      evidenceId: 'evidence-1' as never,
      courseId,
      conceptRef: 'recursion',
      kind: 'ACCURACY',
      value: 0.8,
      provenance,
      context,
    });
    const snapshot = await service.getSnapshot(courseId);
    expect(snapshot.state).toBe('READY');
    expect(snapshot.mastery[0]).toMatchObject({ conceptRef: 'recursion', score: 0.8 });
    expect(snapshot.evidence[0]?.provenance.source.referenceId).toBe('practice-1');
    expect(snapshot.evidence[0]).not.toHaveProperty('body');
  });

  it('requires mastery write permission and validates normalized evidence', async () => {
    const service = new CourseMasteryService();
    await expect(
      service.recordEvidence({
        evidenceId: 'evidence-2' as never,
        courseId,
        conceptRef: 'loops',
        kind: 'RECENT_PRACTICE',
        value: 1.2,
        provenance,
        context: { actor: 'user', permissions: [] },
      }),
    ).rejects.toThrow('PERMISSION_DENIED');
  });

  it('records a course optional wrong problem and preserves provenance', async () => {
    const service = new CourseMasteryService();
    const result = await service.recordWrongProblem({
      problemId: 'wrong-1' as never,
      problemRef: 'content://problem/42',
      classification: 'CONCEPT_GAP',
      classificationSource: 'AI',
      provenance: { ...provenance, recordedBy: 'AI' },
      context,
    });
    expect(result.courseId).toBeUndefined();
    expect(result.classificationSource).toBe('AI');
    expect(result).not.toHaveProperty('body');
  });

  it('lets the user correct an AI classification and records correction state', async () => {
    const service = new CourseMasteryService();
    await service.recordWrongProblem({
      problemId: 'wrong-2' as never,
      courseId,
      problemRef: 'content://problem/43',
      classification: 'CONCEPT_GAP',
      classificationSource: 'AI',
      provenance,
      context,
    });
    const corrected = await service.correctWrongProblem({
      problemId: 'wrong-2' as never,
      courseId,
      classification: 'CARELESS',
      context,
    });
    expect(corrected.status).toBe('CORRECTED');
    expect(corrected.classification).toBe('CARELESS');
    expect(corrected.correction?.actor).toBe('USER');
  });

  it('rejects invalid provenance and scopes correction to the course', async () => {
    const service = new CourseMasteryService();
    await expect(
      service.recordEvidence({
        evidenceId: 'evidence-invalid' as never,
        courseId,
        conceptRef: 'loops',
        kind: 'ACCURACY',
        value: 0.5,
        provenance: { ...provenance, recordedAt: 'yesterday' as never },
        context,
      }),
    ).rejects.toThrow('INVALID_INPUT');
    await service.recordWrongProblem({
      problemId: 'wrong-3' as never,
      courseId,
      problemRef: 'problem://3',
      classification: 'UNKNOWN',
      classificationSource: 'USER',
      provenance,
      context,
    });
    await expect(
      service.correctWrongProblem({
        problemId: 'wrong-3' as never,
        courseId: 'course-2' as never,
        classification: 'CARELESS',
        context,
      }),
    ).rejects.toThrow('NOT_FOUND');
  });
});
