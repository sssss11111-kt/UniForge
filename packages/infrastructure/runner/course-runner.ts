import { spawn } from 'node:child_process';
import type {
  CourseExecutionRunner,
  CourseExecutionRunnerInput,
} from '@uniforge/contracts/course/execution.js';

export class ControlledCourseRunner implements CourseExecutionRunner {
  async execute({ request, signal }: CourseExecutionRunnerInput) {
    const started = Date.now();
    const [command, ...args] = request.command;
    if (!command)
      return {
        status: 'FAILED' as const,
        stdout: '',
        stderr: 'Missing command',
        errorCode: 'INVALID_INPUT' as const,
      };
    return await new Promise<Awaited<ReturnType<CourseExecutionRunner['execute']>>>((resolve) => {
      const child = spawn(command, args, {
        cwd: request.workspaceRoot,
        shell: false,
        windowsHide: true,
      });
      let stdout = '';
      let stderr = '';
      let settled = false;
      const finish = (result: Awaited<ReturnType<CourseExecutionRunner['execute']>>) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
        resolve({ ...result, durationMs: Date.now() - started });
      };
      const cancel = () => {
        child.kill();
        finish({
          status: 'CANCELLED',
          stdout,
          stderr: `${stderr}cancelled`,
          errorCode: 'CANCELLED',
        });
      };
      const timer = setTimeout(() => {
        child.kill();
        finish({ status: 'TIMED_OUT', stdout, stderr: `${stderr}timed out`, errorCode: 'TIMEOUT' });
      }, request.timeoutMs);
      signal.addEventListener('abort', cancel, { once: true });
      child.stdout?.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on('error', (error) =>
        finish({ status: 'FAILED', stdout, stderr: error.message, errorCode: 'RUNNER_FAILURE' }),
      );
      child.on('close', (code) =>
        finish({ status: code === 0 ? 'COMPLETED' : 'FAILED', exitCode: code, stdout, stderr }),
      );
    });
  }
}
