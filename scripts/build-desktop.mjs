import { cp, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktopRoot = path.join(repositoryRoot, 'apps', 'desktop');
const outputRoot = path.join(desktopRoot, 'dist');
await rm(outputRoot, { recursive: true, force: true });
const tscEntry = path.join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const result = spawnSync(
  process.execPath,
  [tscEntry, '-p', path.join(desktopRoot, 'tsconfig.build.json')],
  {
    cwd: repositoryRoot,
    stdio: 'inherit',
  },
);
if (result.error) {
  console.error(`Unable to start TypeScript compiler: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);
const preloadResult = spawnSync(
  process.execPath,
  [tscEntry, '-p', path.join(desktopRoot, 'tsconfig.preload.json')],
  { cwd: repositoryRoot, stdio: 'inherit' },
);
if (preloadResult.error) {
  console.error(`Unable to start TypeScript compiler: ${preloadResult.error.message}`);
  process.exit(1);
}
if (preloadResult.status !== 0) process.exit(preloadResult.status ?? 1);
await mkdir(path.join(outputRoot, 'renderer'), { recursive: true });
await cp(
  path.join(desktopRoot, 'src', 'renderer', 'index.html'),
  path.join(outputRoot, 'renderer', 'index.html'),
);
