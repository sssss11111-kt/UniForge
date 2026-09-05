import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('preview package manifest is explicit about installer and unavailable sidecars', async () => {
  const manifestPath = path.resolve('out/make/windows-manifest.json');
  test.skip(!fs.existsSync(manifestPath), 'Run npm run package-windows first');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    signed: boolean;
    artifacts: unknown[];
    sidecars: { status: string }[];
  };
  expect(manifest.signed).toBe(false);
  expect(manifest.artifacts.length).toBeGreaterThan(0);
  expect(manifest.sidecars).toHaveLength(3);
  expect(manifest.sidecars.every((item) => item.status === 'BLOCKED')).toBe(true);
});
