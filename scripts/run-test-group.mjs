import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
if (!args.length) throw new Error('A test group path is required');
const result = spawnSync('npx', ['vitest', 'run', ...args], { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);
