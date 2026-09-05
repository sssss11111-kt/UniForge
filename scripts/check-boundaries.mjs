import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const forbiddenModules = [
  'electron',
  'node:sqlite',
  'better-sqlite3',
  'langgraph',
  '@langchain',
  'openai',
  '@modelcontextprotocol/sdk',
  '@uniforge/infrastructure',
  '@uniforge/platform-agent',
  '@uniforge/platform-knowledge',
  '@uniforge/platform-model',
  '@uniforge/platform-sidecar',
  '@uniforge/platform-tool',
];
const modulePattern = forbiddenModules.map(escapeRegExp).join('|');
const forbiddenPatterns = [
  new RegExp(
    `\\b(?:import|export)\\s+(?:type\\s+)?(?:[^'";\\n]+?\\s+from\\s+)?['"](?:${modulePattern})(?:/[^'"]*)?['"]`,
  ),
  new RegExp(`\\b(?:import|require)\\s*\\(\\s*['"](?:${modulePattern})(?:/[^'"]*)?['"]`),
  /\b(?:import|export)\s+(?:type\s+)?(?:[^'";\n]+?\s+from\s+)?['"]node:[^'"]+['"]|\b(?:import|require)\s*\(\s*['"]node:[^'"]+['"]/,
];
const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['packages/contracts', 'packages/core', 'apps/desktop/src/renderer'];
const violations = [];
const isForbidden = (source) => forbiddenPatterns.some((pattern) => pattern.test(source));
async function walk(dir) {
  if ((await stat(dir)).isFile()) {
    if (/\.(?:ts|tsx|mjs)$/.test(dir) && isForbidden(await readFile(dir, 'utf8')))
      violations.push(path.relative(root, dir));
    return;
  }
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:ts|tsx|mjs)$/.test(entry.name) && isForbidden(await readFile(file, 'utf8')))
      violations.push(path.relative(root, file));
  }
}
for (const dir of roots) await walk(path.resolve(root, dir));
if (violations.length) {
  console.error(`Forbidden imports detected:\n${violations.join('\n')}`);
  process.exit(1);
}
console.log('Boundary scan passed.');
