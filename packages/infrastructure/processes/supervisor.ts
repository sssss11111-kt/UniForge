import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
type SidecarManifest = { executable: string; args: readonly string[] };

export class ProcessSupervisor {
  spawn(manifest: SidecarManifest): ChildProcessWithoutNullStreams {
    return spawn(manifest.executable, [...manifest.args], {
      shell: false,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { PATH: process.env.PATH ?? '' },
    });
  }
  async stop(child: ChildProcessWithoutNullStreams, timeoutMs = 1000): Promise<void> {
    if (child.exitCode !== null) return;
    child.kill();
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        if (child.exitCode === null) child.kill('SIGKILL');
        resolve();
      }, timeoutMs);
      child.once('close', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}
