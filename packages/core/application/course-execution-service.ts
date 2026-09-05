import type {
  CourseExecutionRequest,
  CourseExecutionResult,
  CourseExecutionRunner,
  CourseExecutionSnapshotDto,
} from '@uniforge/contracts/course/execution.js';
export interface CourseWorkspaceBoundaryPort {
  assertEntry(workspaceRoot: string, entrypoint: string): { readonly ok: boolean };
}

export interface CourseExecutionPermission {
  check(request: CourseExecutionRequest): 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';
  verifyApproval?(request: CourseExecutionRequest): boolean;
}

export class CourseExecutionService {
  constructor(
    private readonly runner: CourseExecutionRunner,
    private readonly permission: CourseExecutionPermission,
    private readonly boundary: CourseWorkspaceBoundaryPort = {
      assertEntry: (workspaceRoot, entrypoint) => {
        const root = normalize(workspaceRoot);
        const target = normalize(`${root}/${entrypoint}`);
        const inside = target === root || target.startsWith(`${root}/`);
        const current = normalize(process.cwd());
        const protectedRoot = root === current || root.startsWith(`${current}/`);
        return {
          ok:
            inside &&
            !protectedRoot &&
            !/(^|\/)(updater|migration|permission|node_modules)(\/|$)/i.test(target),
        };
      },
    },
  ) {}

  private readonly results: CourseExecutionResult[] = [];

  async execute(
    request: CourseExecutionRequest,
    signal = new AbortController().signal,
  ): Promise<CourseExecutionResult> {
    if (!request.command.length || request.timeoutMs <= 0 || request.processLimit !== 1)
      return this.store(request.courseId, this.denied(request, 'INVALID_INPUT'));
    if (
      request.context.actor !== 'user' ||
      !request.context.permissions.includes('assignment:execute') ||
      !request.context.permissions.includes('assignment:code-execute')
    )
      return this.store(request.courseId, this.denied(request, 'PERMISSION_DENIED'));
    if (!this.boundary.assertEntry(request.workspaceRoot, request.entrypoint).ok)
      return this.store(request.courseId, this.denied(request, 'PROTECTED_PATH'));
    const decision = this.permission.check(request);
    if (decision === 'DENY')
      return this.store(request.courseId, this.denied(request, 'PERMISSION_DENIED'));
    if (
      decision === 'REQUIRE_APPROVAL' &&
      (!request.context.approvalId || !this.permission.verifyApproval?.(request))
    )
      return this.store(
        request.courseId,
        this.denied(request, 'APPROVAL_REQUIRED', 'WAITING_APPROVAL'),
      );
    if (signal.aborted)
      return this.store(request.courseId, this.denied(request, 'CANCELLED', 'CANCELLED'));
    try {
      const result = await this.runner.execute({ request, signal });
      return this.store(request.courseId, {
        ...result,
        executionId: request.executionId,
        operation: request.operation,
      });
    } catch (error) {
      return this.store(request.courseId, {
        executionId: request.executionId,
        operation: request.operation,
        status: 'FAILED',
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Runner failed',
        errorCode: 'RUNNER_FAILURE',
      });
    }
  }

  getSnapshot(courseId: CourseExecutionSnapshotDto['courseId']): CourseExecutionSnapshotDto {
    return {
      courseId,
      results: this.results.filter(
        (result) => result.executionId && result.executionId.startsWith('execution-'),
      ),
    };
  }

  private store(
    courseId: CourseExecutionRequest['courseId'],
    result: CourseExecutionResult,
  ): CourseExecutionResult {
    void courseId;
    this.results.push(result);
    return result;
  }

  private denied(
    request: CourseExecutionRequest,
    errorCode: CourseExecutionResult['errorCode'],
    status: CourseExecutionResult['status'] = 'DENIED',
  ): CourseExecutionResult {
    return {
      executionId: request.executionId,
      operation: request.operation,
      status,
      stdout: '',
      stderr: errorCode ?? 'execution denied',
      ...(errorCode ? { errorCode } : {}),
    };
  }
}

const normalize = (value: string): string => {
  const replaced = value.replaceAll('\\', '/').replace(/\/+/g, '/');
  const drive = replaced.match(/^[A-Za-z]:/);
  const prefix = drive ? drive[0].toLowerCase() : replaced.startsWith('/') ? '/' : '';
  const parts = replaced.replace(/^[A-Za-z]:/, '').split('/');
  const output: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') output.pop();
    else output.push(part);
  }
  return `${prefix}/${output.join('/')}`.replace(/\/$/, '').toLowerCase();
};
