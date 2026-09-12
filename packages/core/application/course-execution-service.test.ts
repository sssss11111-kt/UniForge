import { describe, expect, it } from 'vitest';
import type {
  CourseExecutionRequest,
  CourseExecutionRunner,
  CourseExecutionResult,
} from '@uniforge/contracts/course/execution.js';
import { CourseExecutionService } from './course-execution-service.js';

const request = (overrides: Partial<CourseExecutionRequest> = {}): CourseExecutionRequest => ({
  executionId: 'execution-1' as CourseExecutionRequest['executionId'],
  courseId: 'course-1' as CourseExecutionRequest['courseId'],
  assignmentId: 'assessment-1' as CourseExecutionRequest['assignmentId'],
  workspaceRoot: 'C:/Users/student/course-work',
  entrypoint: 'main.py',
  operation: 'RUN',
  command: ['python', 'main.py'],
  timeoutMs: 1000,
  processLimit: 1,
  context: {
    actor: 'user',
    permissions: ['assignment:execute', 'assignment:code-execute'],
    approvalId: 'approval-1',
  },
  ...overrides,
});

const approved = {
  check: () => 'ALLOW' as const,
  verifyApproval: () => true,
};

describe('CourseExecutionService', () => {
  it('routes an approved request through the runner and preserves output', async () => {
    const runner: CourseExecutionRunner = {
      execute: async () => ({
        status: 'COMPLETED',
        exitCode: 0,
        stdout: 'ok',
        stderr: '',
        durationMs: 4,
      }),
    };
    const service = new CourseExecutionService(runner, approved);
    await expect(service.execute(request())).resolves.toMatchObject({
      status: 'COMPLETED',
      stdout: 'ok',
      operation: 'RUN',
    });
  });

  it('keeps approval, timeout, cancellation and runner failures visible', async () => {
    const runner: CourseExecutionRunner = {
      execute: async (input) =>
        input.signal.aborted
          ? ({ status: 'CANCELLED', stdout: '', stderr: 'cancelled' } as CourseExecutionResult)
          : ({ status: 'TIMED_OUT', stdout: '', stderr: 'timeout' } as CourseExecutionResult),
    };
    const service = new CourseExecutionService(runner, {
      check: () => 'REQUIRE_APPROVAL',
      verifyApproval: () => false,
    });
    const pendingRequest = request();
    await expect(
      service.execute({
        ...pendingRequest,
        context: { actor: 'user', permissions: pendingRequest.context.permissions },
      }),
    ).resolves.toMatchObject({ status: 'WAITING_APPROVAL' });
    const approvedService = new CourseExecutionService(runner, approved);
    await expect(approvedService.execute(request({ timeoutMs: 1 }))).resolves.toMatchObject({
      status: 'TIMED_OUT',
    });
  });

  it('rejects execution outside the authorized workspace or protected paths', async () => {
    const runner: CourseExecutionRunner = {
      execute: async () => ({ status: 'COMPLETED', exitCode: 0, stdout: '', stderr: '' }),
    };
    const service = new CourseExecutionService(runner, approved);
    await expect(
      service.execute(request({ entrypoint: '../other/main.py' })),
    ).resolves.toMatchObject({ status: 'DENIED', errorCode: 'PROTECTED_PATH' });
    await expect(service.execute(request({ workspaceRoot: process.cwd() }))).resolves.toMatchObject(
      { status: 'DENIED', errorCode: 'PROTECTED_PATH' },
    );
  });
});
