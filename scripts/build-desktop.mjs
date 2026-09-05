import { cp, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await rm('apps/desktop/dist', { recursive: true, force: true });
const result = spawnSync('npx', ['tsc', '-p', 'apps/desktop/tsconfig.build.json'], {
  stdio: 'inherit',
  shell: true,
});
if (result.status !== 0) process.exit(result.status ?? 1);
await mkdir('apps/desktop/dist/renderer', { recursive: true });
await cp('apps/desktop/src/renderer/index.html', 'apps/desktop/dist/renderer/index.html');
