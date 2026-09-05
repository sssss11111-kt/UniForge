import { describe, expect, it } from 'vitest';
import { CourseExamReviewService } from './course-exam-review-service.js';

const input = {
  planId: 'review-plan-1' as never,
  examId: 'exam-1' as never,
  courseId: 'course-1' as never,
  examDate: '2026-10-01T00:00:00.000Z' as never,
  scope: ['递归', '图论'],
  mastery: [
    { conceptRef: '递归', score: 0.4, evidenceIds: ['mastery-evidence-1'] },
    { conceptRef: '图论', score: 0.9, evidenceIds: ['mastery-evidence-2'] },
  ],
  availableMinutesPerDay: 45,
  goal: '考试前补齐薄弱知识点',
  provenance: {
    recordedBy: 'SYSTEM' as const,
    recordedAt: '2026-09-06T00:00:00.000Z' as never,
    source: { kind: 'MASTERY' as const, referenceId: 'mastery-snapshot-1' },
  },
  context: { actor: 'user' as const, permissions: ['course:review-plan:write'] },
};

describe('CourseExamReviewService', () => {
  it('keeps a newly requested plan waiting for approval and preserves mastery provenance', async () => {
    const service = new CourseExamReviewService({
      request: async () => ({ status: 'PENDING' as const, approvalId: 'approval-review-1' }),
    });
    const plan = await service.createPlan(input);
    expect(plan.status).toBe('WAITING_APPROVAL');
    expect(plan.approvalId).toBe('approval-review-1');
    expect(plan.courseId).toBe('course-1');
    expect(plan.provenance.source.referenceId).toBe('mastery-snapshot-1');
    expect(plan.sessions).toHaveLength(0);
  });

  it('creates explainable review sessions only after approval, prioritising weaker concepts', async () => {
    const service = new CourseExamReviewService({
      request: async () => ({ status: 'APPROVED' as const, approvalId: 'approval-review-2' }),
    });
    const plan = await service.createPlan(input);
    expect(plan.status).toBe('READY');
    expect(plan.sessions[0]).toMatchObject({ conceptRef: '递归', reason: 'LOW_MASTERY' });
    expect(plan.sessions[0]?.minutes).toBeGreaterThan(0);
  });

  it('keeps denied approval visible and rejects missing permission or invalid input', async () => {
    const service = new CourseExamReviewService({
      request: async () => ({ status: 'DENIED' as const, approvalId: 'approval-review-3' }),
    });
    const failed = await service.createPlan(input);
    expect(failed.status).toBe('FAILED');
    expect(failed.error).toBe('APPROVAL_DENIED');
    await expect(
      service.createPlan({ ...input, context: { actor: 'user', permissions: [] } }),
    ).rejects.toThrow('PERMISSION_DENIED');
    await expect(service.createPlan({ ...input, availableMinutesPerDay: 0 })).rejects.toThrow(
      'INVALID_INPUT',
    );
  });

  it('returns an honest empty snapshot before a plan exists', async () => {
    const service = new CourseExamReviewService({
      request: async () => ({ status: 'APPROVED' as const }),
    });
    const snapshot = await service.getSnapshot('course-1' as never);
    expect(snapshot.state).toBe('EMPTY');
    expect(snapshot.plans).toEqual([]);
  });
});
