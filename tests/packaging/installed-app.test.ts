import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

const manifestPath = path.resolve('out/make/windows-manifest.json');
const asarPath = path.resolve('out/.stage0-windows/app/out/UniForge-win32-x64/resources/app.asar');

test.skipIf(!fs.existsSync(manifestPath))(
  'preview package manifest is explicit about installer and unavailable sidecars',
  () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      signed: boolean;
      artifacts: unknown[];
      sidecars: { status: string }[];
    };
    expect(manifest.signed).toBe(false);
    expect(manifest.artifacts.length).toBeGreaterThan(0);
    expect(manifest.sidecars).toHaveLength(3);
    expect(manifest.sidecars.every((item) => item.status === 'BLOCKED')).toBe(true);
  },
);

test.skipIf(!fs.existsSync(asarPath))(
  'preview package contains compiled runtime workspace dependencies',
  () => {
    const result = spawnSync(
      process.execPath,
      [path.resolve('node_modules/@electron/asar/bin/asar.js'), 'list', asarPath],
      { encoding: 'utf8' },
    );
    expect(result.status).toBe(0);
    const entries = result.stdout.replaceAll('\\', '/');
    for (const packageName of [
      '@uniforge/contracts/dist/index.js',
      '@uniforge/core/dist/index.js',
      '@uniforge/infrastructure/dist/index.js',
      '@uniforge/platform-agent/dist/index.js',
      'ts-fsrs/dist/index.mjs',
    ])
      expect(entries).toContain(`/node_modules/${packageName}`);
    expect(entries).not.toContain('/node_modules/@uniforge/platform-agent/index.ts');
  },
);
