import { describe, expect, it } from 'vitest';
import { AssignmentService, type AssignmentApprovalPort } from './assignment-service.js';

const base = {
  assignmentId: 'assignment-1' as never,
  courseId: 'course-1' as never,
  prompt: 'Explain the algorithm',
};
const context = { actor: 'user' as const, permissions: ['course:read'] };
const approved: AssignmentApprovalPort = {
  request: async () => ({ status: 'APPROVED' as const, approvalId: 'approval-1' }),
};

describe('AssignmentService', () => {
  it('starts tutoring and collaboration without execution or submission capability', async () => {
    const service = new AssignmentService(approved);
    const tutoring = await service.start({ ...base, mode: 'TUTORING', context });
    const collaboration = await service.start({ ...base, mode: 'COLLABORATION', context });

    expect(tutoring.status).toBe('RUNNING');
    expect(collaboration.status).toBe('RUNNING');
    expect(tutoring.capabilities).toEqual({
      codeExecution: false,
      sourceWrite: false,
      submit: false,
    });
    expect(collaboration.capabilities).toEqual({
      codeExecution: false,
      sourceWrite: false,
      submit: false,
    });
  });

  it('requires an execution permission and approval before task execution', async () => {
    let requests = 0;
    const pending: AssignmentApprovalPort = {
      request: async () => {
        requests += 1;
        return { status: 'PENDING' as const, approvalId: 'approval-2' };
      },
    };
    const service = new AssignmentService(pending);
    await expect(service.start({ ...base, mode: 'TASK_EXECUTION', context })).rejects.toThrow(
      'PERMISSION_DENIED',
    );
    const result = await service.start({
      ...base,
      mode: 'TASK_EXECUTION',
      context: { actor: 'user', permissions: ['course:read', 'assignment:execute'] },
    });
    expect(result.status).toBe('WAITING_APPROVAL');
    expect(result.approvalId).toBe('approval-2');
    expect(requests).toBe(1);
    expect(result.capabilities.submit).toBe(false);
  });

  it('keeps code execution and source writing separately authorized', async () => {
    const service = new AssignmentService(approved);
    const result = await service.start({
      ...base,
      mode: 'TASK_EXECUTION',
      context: {
        actor: 'user',
        permissions: ['course:read', 'assignment:execute', 'assignment:code-execute'],
      },
    });
    expect(result.capabilities.codeExecution).toBe(true);
    expect(result.capabilities.sourceWrite).toBe(false);
    expect(result.capabilities.submit).toBe(false);
    expect(result.status).toBe('UNAVAILABLE');
    expect(result.error).toBe('EXECUTION_UNAVAILABLE');
  });

  it('records denied approval as failed and never reports submission', async () => {
    const service = new AssignmentService({
      request: async () => ({ status: 'DENIED' as const, approvalId: 'approval-3' }),
    });
    const result = await service.start({
      ...base,
      mode: 'TASK_EXECUTION',
      context: { actor: 'user', permissions: ['course:read', 'assignment:execute'] },
    });
    expect(result.status).toBe('FAILED');
    expect(result.error).toBe('APPROVAL_DENIED');
    expect(result.capabilities.submit).toBe(false);
    expect(JSON.stringify(result)).not.toContain('submitted');
  });
});
