import type {
  ConfirmCourseRecognitionInput,
  CourseRecognitionProposal,
  CourseRecognitionSnapshotDto,
  ProposeCourseRecognitionInput,
} from '@uniforge/contracts/course/index.js';

export type CourseRecognitionFormalWrite = (proposal: CourseRecognitionProposal) => Promise<void>;

export class CourseRecognitionService {
  private readonly proposals: CourseRecognitionProposal[] = [];

  public constructor(private readonly formalWrite: CourseRecognitionFormalWrite) {}

  async propose(input: ProposeCourseRecognitionInput): Promise<CourseRecognitionProposal> {
    if (
      !input.proposalId ||
      !input.courseId ||
      !input.source.materialId ||
      !input.source.locator.trim() ||
      !input.source.label.trim() ||
      input.confidence < 0 ||
      input.confidence > 1 ||
      input.candidates.length === 0 ||
      input.candidates.some((candidate) => !candidate.title.trim())
    ) {
      throw new Error('INVALID_RECOGNITION');
    }
    const proposal: CourseRecognitionProposal = {
      ...input,
      status: 'PENDING_CONFIRMATION',
      createdAt: new Date().toISOString() as CourseRecognitionProposal['createdAt'],
    };
    this.proposals.push(proposal);
    return proposal;
  }

  async confirm(input: ConfirmCourseRecognitionInput): Promise<CourseRecognitionProposal> {
    if (input.context.actor !== 'user') throw new Error('USER_CONFIRMATION_REQUIRED');
    if (!input.context.permissions.includes('course:write')) throw new Error('PERMISSION_DENIED');
    const index = this.proposals.findIndex((proposal) => proposal.proposalId === input.proposalId);
    if (index < 0) throw new Error('RECOGNITION_NOT_FOUND');
    const current = this.proposals[index]!;
    if (current.status === 'CONFIRMED') return current;
    const confirmed: CourseRecognitionProposal = {
      ...current,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString() as CourseRecognitionProposal['createdAt'],
    };
    await this.formalWrite(confirmed);
    this.proposals[index] = confirmed;
    return confirmed;
  }

  async getSnapshot(
    courseId: CourseRecognitionSnapshotDto['courseId'],
  ): Promise<CourseRecognitionSnapshotDto> {
    return {
      courseId,
      proposals: this.proposals.filter((proposal) => proposal.courseId === courseId),
    };
  }
}
