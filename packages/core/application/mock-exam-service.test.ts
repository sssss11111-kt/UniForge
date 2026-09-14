import { describe, expect, it } from 'vitest';
import { MockExamService } from './mock-exam-service.js';
describe('MockExamService', () => {
  it('creates exams and records results with disclaimer', () => {
    const s = new MockExamService();
    s.create({
      id: 'm1',
      examSpaceId: 'IELTS',
      sections: [{ id: 'r', name: 'Reading', maxScore: 40 }],
      permissions: ['english:write'],
    });
    const r = s.recordResult({
      examId: 'm1',
      rawScore: 32,
      errorDimensions: ['CONTEXT'],
      aiEvaluation: { modelVersion: 'm1', confidence: 0.8, text: 'review' },
      scoreDisclaimer: 'Practice estimate',
      permissions: ['english:write'],
    });
    expect(r.scoreDisclaimer).toBe('Practice estimate');
    expect(s.getResult('m1', ['english:read'])?.rawScore).toBe(32);
  });
  it('fails closed for permissions and invalid confidence', () => {
    const s = new MockExamService();
    expect(() =>
      s.create({
        id: 'm',
        examSpaceId: 'CET4',
        sections: [{ id: 'x', name: 'x', maxScore: 1 }],
        permissions: [],
      }),
    ).toThrow('english:write');
    expect(() =>
      s.recordResult({
        examId: 'm',
        rawScore: 1,
        errorDimensions: [],
        scoreDisclaimer: 'x',
        aiEvaluation: { modelVersion: 'x', confidence: 2, text: '' },
        permissions: ['english:write'],
      }),
    ).toThrow('confidence');
  });
});
