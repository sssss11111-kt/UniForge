import type {
  CreateReviewPlanInput,
  ReviewApprovalPort,
  ReviewPlan,
  ReviewPlanSnapshotDto,
} from '@uniforge/contracts/course/exam-review.js';
import { parseInstant } from '@uniforge/contracts/domain/primitives.js';

export class CourseExamReviewService {
  private readonly plans: ReviewPlan[] = [];

  public constructor(private readonly approval: ReviewApprovalPort) {}

  public async getSnapshot(
    courseId: ReviewPlanSnapshotDto['courseId'],
  ): Promise<ReviewPlanSnapshotDto> {
    const plans = this.plans.filter((plan) => plan.courseId === courseId);
    const latest = plans.at(-1);
    return {
      courseId,
      state:
        latest?.status === 'WAITING_APPROVAL'
          ? 'WAITING_APPROVAL'
          : latest?.status === 'FAILED'
            ? 'FAILED'
            : latest
              ? 'READY'
              : 'EMPTY',
      plans,
      ...(latest?.error ? { error: latest.error } : {}),
    };
  }

  public async createPlan(input: CreateReviewPlanInput): Promise<ReviewPlan> {
    this.assertPermission(input.context.permissions);
    this.validate(input);
    const now = new Date().toISOString() as ReviewPlan['createdAt'];
    const exam = {
      id: input.examId,
      courseId: input.courseId,
      date: input.examDate,
      scope: input.scope,
      provenance: input.provenance,
    };
    const decision = await this.approval.request({
      planId: input.planId,
      courseId: input.courseId,
    });
    const base = {
      id: input.planId,
      exam,
      courseId: input.courseId,
      goal: input.goal.trim(),
      availableMinutesPerDay: input.availableMinutesPerDay,
      provenance: input.provenance,
      createdAt: now,
    } as const;
    const plan: ReviewPlan =
      decision.status === 'PENDING'
        ? { ...base, status: 'WAITING_APPROVAL', sessions: [], approvalId: decision.approvalId }
        : decision.status === 'DENIED'
          ? {
              ...base,
              status: 'FAILED',
              sessions: [],
              error: 'APPROVAL_DENIED',
              ...(decision.approvalId ? { approvalId: decision.approvalId } : {}),
            }
          : {
              ...base,
              status: 'READY',
              sessions: this.buildSessions(input),
              ...(decision.approvalId ? { approvalId: decision.approvalId } : {}),
            };
    this.plans.push(plan);
    return plan;
  }

  private buildSessions(input: CreateReviewPlanInput): ReviewPlan['sessions'] {
    const candidates = input.mastery
      .filter((item) => input.scope.includes(item.conceptRef))
      .sort((a, b) => a.score - b.score);
    const scopeOnly = input.scope.filter(
      (concept) => !input.mastery.some((item) => item.conceptRef === concept),
    );
    const concepts = [
      ...candidates.map((item) => ({
        conceptRef: item.conceptRef,
        reason: 'LOW_MASTERY' as const,
      })),
      ...scopeOnly.map((conceptRef) => ({ conceptRef, reason: 'SCOPE_COVERAGE' as const })),
    ];
    const examDay = new Date(input.examDate);
    return concepts.map((item, index) => ({
      id: `${input.planId}-session-${index + 1}`,
      date: new Date(examDay.getTime() - (concepts.length - index) * 86400000)
        .toISOString()
        .slice(0, 10),
      conceptRef: item.conceptRef,
      minutes: Math.max(1, Math.floor(input.availableMinutesPerDay / Math.max(1, concepts.length))),
      reason: item.reason,
    }));
  }

  private validate(input: CreateReviewPlanInput): void {
    if (!parseInstant(input.examDate).ok || !parseInstant(input.provenance.recordedAt).ok)
      throw new Error('INVALID_INPUT');
    if (
      !input.scope.length ||
      !input.goal.trim() ||
      !Number.isInteger(input.availableMinutesPerDay) ||
      input.availableMinutesPerDay <= 0
    )
      throw new Error('INVALID_INPUT');
    if (!input.provenance.source.referenceId.trim()) throw new Error('INVALID_INPUT');
    if (
      input.mastery.some(
        (item) =>
          !item.conceptRef.trim() ||
          !Number.isFinite(item.score) ||
          item.score < 0 ||
          item.score > 1,
      )
    )
      throw new Error('INVALID_INPUT');
  }

  private assertPermission(permissions: readonly string[]): void {
    if (!permissions.includes('course:review-plan:write')) throw new Error('PERMISSION_DENIED');
  }
}
