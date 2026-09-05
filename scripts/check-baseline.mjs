import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.cwd());
const required = [
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
for (const file of required) await access(path.join(root, file));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
for (const script of [
  'typecheck',
  'lint',
  'unit',
  'e2e-smoke',
  'check-boundaries',
  'check-doc-links',
  'build:desktop',
  'format:check',
  'test:group',
]) {
  if (typeof pkg.scripts?.[script] !== 'string')
    throw new Error(`Missing required script: ${script}`);
}
const ts = await readFile(path.join(root, 'tsconfig.base.json'), 'utf8');
if (!/"strict"\s*:\s*true/.test(ts)) throw new Error('TypeScript strict mode is required');
console.log('Baseline files and strict mode are present.');
