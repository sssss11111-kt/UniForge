import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { expect, test } from 'vitest';

test('desktop build includes nested UI assets and loads compiled runtime exports', async () => {
  const build = spawnSync(process.execPath, ['scripts/build-desktop.mjs'], { encoding: 'utf8' });
  expect(build.status, build.stderr).toBe(0);
  expect(await readFile('apps/desktop/dist/renderer/ui/tokens.css', 'utf8')).toBe(
    await readFile('apps/desktop/src/renderer/ui/tokens.css', 'utf8'),
  );
  const runtime = JSON.parse(await readFile('packages/platform-agent/package.json', 'utf8'));
  expect(runtime.exports).toBe('./dist/index.js');
}, 30000);
