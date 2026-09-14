import type {
  AssignmentSession,
  AssignmentSnapshotDto,
  StartAssignmentInput,
} from '@uniforge/contracts/course/index.js';

export interface AssignmentApprovalPort {
  request(input: {
    courseId: StartAssignmentInput['courseId'];
    assignmentId: StartAssignmentInput['assignmentId'];
    mode: 'TASK_EXECUTION';
  }): Promise<{ status: 'APPROVED' | 'PENDING' | 'DENIED'; approvalId?: string }>;
}

export class AssignmentService {
  private readonly sessions: AssignmentSession[] = [];

  public constructor(private readonly approval: AssignmentApprovalPort) {}

  async start(input: StartAssignmentInput): Promise<AssignmentSession> {
    if (input.context.actor !== 'user' || !input.courseId || !input.assignmentId)
      throw new Error('PERMISSION_DENIED');
    if (!input.prompt.trim()) throw new Error('INVALID_INPUT');
    const capabilities = {
      codeExecution:
        input.mode === 'TASK_EXECUTION' &&
        input.context.permissions.includes('assignment:code-execute'),
      sourceWrite:
        input.mode === 'TASK_EXECUTION' &&
        input.context.permissions.includes('assignment:source-write'),
      submit: false as const,
    };
    const base = {
      sessionId: (input.sessionId ??
        `assignment-session-${this.sessions.length + 1}`) as AssignmentSession['sessionId'],
      assignmentId: input.assignmentId,
      courseId: input.courseId,
      mode: input.mode,
      prompt: input.prompt.trim(),
      capabilities,
      startedAt: new Date().toISOString() as AssignmentSession['startedAt'],
    };
    if (input.mode !== 'TASK_EXECUTION') return this.store({ ...base, status: 'RUNNING' });
    if (!input.context.permissions.includes('assignment:execute'))
      throw new Error('PERMISSION_DENIED');
    const approval = await this.approval.request({
      courseId: input.courseId,
      assignmentId: input.assignmentId,
      mode: 'TASK_EXECUTION',
    });
    if (approval.status === 'DENIED')
      return this.store({ ...base, status: 'FAILED', error: 'APPROVAL_DENIED' });
    if (approval.status === 'PENDING' && !input.approvalId)
      return this.store({
        ...base,
        status: 'WAITING_APPROVAL',
        ...(approval.approvalId ? { approvalId: approval.approvalId } : {}),
      });
    if (approval.status !== 'APPROVED' && !input.approvalId)
      return this.store({ ...base, status: 'UNAVAILABLE', error: 'EXECUTION_UNAVAILABLE' });
    return this.store({
      ...base,
      // The execution engine is intentionally deferred to Task 1.9. Approval
      // authorizes the boundary but cannot be presented as completed work.
      status: 'UNAVAILABLE',
      error: 'EXECUTION_UNAVAILABLE',
      ...((input.approvalId ?? approval.approvalId)
        ? { approvalId: input.approvalId ?? approval.approvalId }
        : {}),
    });
  }

  async getSnapshot(courseId: AssignmentSnapshotDto['courseId']): Promise<AssignmentSnapshotDto> {
    return { courseId, sessions: this.sessions.filter((item) => item.courseId === courseId) };
  }

  private store(session: AssignmentSession): AssignmentSession {
    this.sessions.push(session);
    return session;
  }
}
