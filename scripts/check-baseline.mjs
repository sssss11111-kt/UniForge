import { access, readFile } from 'node:fs/promises';
const required = ['package-lock.json','tsconfig.base.json','eslint.config.mjs','vitest.config.ts','playwright.config.ts','scripts/check-boundaries.mjs','apps/desktop/src/main/index.ts'];
for (const file of required) await access(file);
const ts = await readFile('tsconfig.base.json', 'utf8');
if (!/"strict"\s*:\s*true/.test(ts)) throw new Error('TypeScript strict mode is required');
console.log('Baseline files and strict mode are present.');
