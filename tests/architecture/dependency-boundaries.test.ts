import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

describe('dependency boundary scanner', () => {
  it('detects a forbidden import in a package fixture', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'uniforge-boundary-'));
    const fixture = path.join(dir, 'fixture.ts');
    writeFileSync(fixture, "import { app } from 'electron';\n");
    const script = path.resolve('scripts/check-boundaries.mjs');
    const result = spawnSync(process.execPath, [script, fixture], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    rmSync(dir, { recursive: true, force: true });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Forbidden imports detected');
  });
});
