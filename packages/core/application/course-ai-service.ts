import type {
  CourseAiEvidence,
  CourseAiProposal,
  CourseAiSnapshotDto,
  AskCourseAiInput,
} from '@uniforge/contracts/course/index.js';
import type { ModelGateway, RequestContext } from '@uniforge/contracts';

export interface CourseAiEvidencePort {
  collect(
    courseId: CourseAiProposal['courseId'],
    question: string,
  ): Promise<readonly CourseAiEvidence[]>;
}
export interface CourseAiApprovalPort {
  request(input: {
    courseId: CourseAiProposal['courseId'];
    proposalId: CourseAiProposal['proposalId'];
    question: string;
  }): Promise<{ status: 'APPROVED' | 'PENDING' | 'DENIED'; approvalId?: string }>;
}

export class CourseAiService {
  private readonly proposals: CourseAiProposal[] = [];
  public constructor(
    private readonly gateway: ModelGateway,
    private readonly evidencePort: CourseAiEvidencePort,
    private readonly approval: CourseAiApprovalPort,
  ) {}

  async ask(input: AskCourseAiInput): Promise<CourseAiProposal> {
    if (
      input.context.actor !== 'user' ||
      !input.context.permissions.includes('course:read') ||
      !input.context.permissions.includes('model:use')
    )
      throw new Error('PERMISSION_DENIED');
    if (!input.question.trim() || !input.courseId || !input.proposalId)
      throw new Error('INVALID_INPUT');
    const evidence = await this.evidencePort.collect(input.courseId, input.question);
    const approval = await this.approval.request({
      courseId: input.courseId,
      proposalId: input.proposalId,
      question: input.question,
    });
    const base = {
      proposalId: input.proposalId,
      courseId: input.courseId,
      question: input.question.trim(),
      evidence,
      sourceCategories: [...new Set(evidence.map((item) => item.category))],
      createdAt: new Date().toISOString() as CourseAiProposal['createdAt'],
    };
    if (approval.status === 'DENIED')
      return this.store({ ...base, status: 'FAILED', error: 'APPROVAL_DENIED' });
    if (approval.status === 'PENDING' && !input.approvalId)
      return this.store({
        ...base,
        status: 'WAITING_APPROVAL',
        ...(approval.approvalId ? { approvalId: approval.approvalId } : {}),
      });
    const context: RequestContext = {
      actorId: 'actor-user' as never,
      workspaceId: 'workspace-local' as never,
      correlationId: `course-ai:${input.proposalId}`,
    };
    const result = await this.gateway.generate(
      {
        purpose: 'course-ai-answer',
        dataClass: 'PRIVATE',
        requiredCapabilities: ['text'],
        routeOverrides: {},
        maxOutputTokens: 1200,
        messages: [
          {
            role: 'system',
            content: 'Answer using the supplied evidence. Mark source categories in the response.',
          },
          {
            role: 'user',
            content: `${input.question}\nEvidence:\n${evidence.map((item) => `[${item.category}] ${item.label}: ${item.excerpt ?? ''}`).join('\n')}`,
          },
        ],
      },
      context,
    );
    const approvalId = input.approvalId ?? approval.approvalId;
    if (!result.ok)
      return this.store({
        ...base,
        status: 'FAILED',
        ...(approvalId ? { approvalId } : {}),
        error: result.error.message,
      });
    return this.store({
      ...base,
      status: 'COMPLETED',
      ...(approvalId ? { approvalId } : {}),
      answer: result.value.text,
    });
  }

  async getSnapshot(courseId: CourseAiSnapshotDto['courseId']): Promise<CourseAiSnapshotDto> {
    return {
      courseId,
      proposals: this.proposals.filter((proposal) => proposal.courseId === courseId),
    };
  }
  private store(proposal: CourseAiProposal): CourseAiProposal {
    this.proposals.push(proposal);
    return proposal;
  }
}
