import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const forbidden =
  /(?:from\s+['"](?:electron|node:sqlite|better-sqlite3|langgraph|@langchain)|require\(['"](?:electron|node:sqlite|better-sqlite3|langgraph|@langchain))/;
const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['packages/contracts', 'packages/core'];
const violations = [];
async function walk(dir) {
  if ((await stat(dir)).isFile()) {
    if (/\.(?:ts|tsx|mjs)$/.test(dir) && forbidden.test(await readFile(dir, 'utf8')))
      violations.push(path.relative(root, dir));
    return;
  }
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.(?:ts|tsx|mjs)$/.test(entry.name) && forbidden.test(await readFile(file, 'utf8')))
      violations.push(path.relative(root, file));
  }
}
for (const dir of roots) await walk(path.resolve(root, dir));
if (violations.length) {
  console.error(`Forbidden imports detected:\n${violations.join('\n')}`);
  process.exit(1);
}
console.log('Boundary scan passed.');
