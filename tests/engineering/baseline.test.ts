import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const requiredFiles = [
  'package-lock.json',
  'tsconfig.base.json',
  'eslint.config.mjs',
  '.prettierignore',
  'vitest.config.ts',
  'playwright.config.ts',
  'tsconfig.tests.json',
  'scripts/check-boundaries.mjs',
  'apps/desktop/src/main/index.ts',
];

const createFixture = (options: { strict?: boolean; includeBuildScript?: boolean } = {}) => {
  const directory = mkdtempSync(path.join(tmpdir(), 'uniforge-baseline-'));
  for (const file of requiredFiles) {
    const target = path.join(directory, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, '');
  }
  writeFileSync(
    path.join(directory, 'tsconfig.base.json'),
    JSON.stringify({ compilerOptions: { strict: options.strict ?? true } }),
  );
  const scripts = {
    typecheck: 'tsc',
    lint: 'eslint',
    unit: 'vitest',
    integration: 'vitest',
    security: 'npm audit',
    license: 'node scripts/check-licenses.mjs',
    sbom: 'node scripts/generate-sbom.mjs',
    'e2e-smoke': 'playwright',
    'package-windows': 'node scripts/package-windows.mjs',
    'verify:windows-package': 'node scripts/verify-windows-package.mjs',
    'check-boundaries': 'node scripts/check-boundaries.mjs',
    'check-doc-links': 'node scripts/check-doc-links.mjs',
    'format:check': 'prettier --check .',
    'test:group': 'node scripts/run-test-group.mjs',
    ...(options.includeBuildScript === false ? {} : { 'build:desktop': 'node build.mjs' }),
  };
  writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ scripts }));
  writeFileSync(path.join(directory, 'package-lock.json'), '{}');
  return directory;
};

const runBaseline = (directory: string) =>
  spawnSync(process.execPath, [path.resolve('scripts/check-baseline.mjs'), directory], {
    encoding: 'utf8',
  });

describe('engineering baseline', () => {
  it('uses strict TypeScript and a lockfile', () => {
    expect(readFileSync('tsconfig.base.json', 'utf8')).toMatch(/"strict"\s*:\s*true/);
    expect(() => readFileSync('package-lock.json')).not.toThrow();
  });

  it('passes a complete isolated fixture', () => {
    const directory = createFixture();
    try {
      expect(runBaseline(directory).status).toBe(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejects a fixture without strict mode', () => {
    const directory = createFixture({ strict: false });
    try {
      const result = runBaseline(directory);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('TypeScript strict mode is required');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejects a fixture without a required script', () => {
    const directory = createFixture({ includeBuildScript: false });
    try {
      const result = runBaseline(directory);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Missing required script: build:desktop');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
