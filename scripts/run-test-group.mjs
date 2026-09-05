import { spawnSync } from 'node:child_process';
import path from 'node:path';
const requested = process.argv.slice(2);
if (!requested.length) throw new Error('A test group or test path is required');
const groups = {
  engineering: 'tests/engineering',
  architecture: 'tests/architecture',
  desktop: 'apps/desktop/tests',
  packages: 'packages',
  unit: [
    'tests/engineering',
    'tests/architecture',
    'tests/recovery',
    'tests/packaging',
    'packages',
  ],
  integration: 'tests/integration',
  security: 'tests/security',
  all: ['tests', 'packages', 'apps'],
};
const [first, ...rest] = requested;
const targets = groups[first]
  ? [...(Array.isArray(groups[first]) ? groups[first] : [groups[first]]), ...rest]
  : requested;
const vitestEntry = path.resolve('node_modules/vitest/vitest.mjs');
const result = spawnSync(process.execPath, [vitestEntry, 'run', ...targets], {
  cwd: process.cwd(),
  stdio: 'inherit',
});
if (result.error) {
  console.error(`Unable to start Vitest: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
