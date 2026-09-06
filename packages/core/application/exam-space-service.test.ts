import { describe, expect, it } from 'vitest';
import { ExamSpaceService } from './exam-space-service';
describe('ExamSpaceService', () => {
  it('starts empty and creates supported spaces', () => {
    const s = new ExamSpaceService();
    expect(s.getSnapshot().status).toBe('empty');
    const x = s.create({ name: 'CET 4', examType: 'CET4' });
    expect(x.ruleSet.examType).toBe('CET4');
    expect(s.getSnapshot().spaces).toHaveLength(1);
  });
  it('enforces write permission', () => {
    expect(() =>
      new ExamSpaceService({ canWrite: false }).create({ name: 'x', examType: 'Custom' }),
    ).toThrow('permission denied');
  });
});
