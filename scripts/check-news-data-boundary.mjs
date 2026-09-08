import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const bundleRoots = ['apps/desktop/src', 'packages', 'fixtures'];
const textExtensions = new Set([
  '.csv',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sql',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
]);
const forbiddenName =
  /(?:scraped[-_ ]?articles?|paywalled|private[-_ ]?(?:feed|corpus|archive)|(?:news|article)[-_ ]?(?:corpus|dataset|archive)|unclear[-_ ]?licen[cs]e)/i;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:gh[pousr]|xox[baprs])-[A-Za-z0-9-]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|authorization)\s*[:=]\s*["'][^"'${}\\s]{12,}["']/i,
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'dist' && entry.name !== 'node_modules')
        files.push(...(await collectFiles(file)));
    } else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(file);
  }
  return files;
}

const violations = [];
for (const relativeRoot of bundleRoots) {
  const directory = path.resolve(root, relativeRoot);
  if (!(await stat(directory).catch(() => null))) continue;
  for (const file of await collectFiles(directory)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (forbiddenName.test(relative))
      violations.push(`${relative}: restricted dataset/archive name`);
    const contents = await readFile(file, 'utf8');
    for (const pattern of secretPatterns)
      if (pattern.test(contents)) violations.push(`${relative}: secret-shaped value`);
  }
}

const registry = await readFile(path.join(root, 'docs/governance/third-party-registry.md'), 'utf8');
if (!/No production news connector or dataset is currently enabled/i.test(registry))
  violations.push(
    'docs/governance/third-party-registry.md: missing current news connector inventory',
  );
if (!/scope evidence/i.test(registry) || !/license evidence/i.test(registry))
  violations.push(
    'docs/governance/third-party-registry.md: missing connector scope/license admission requirements',
  );

if (violations.length) {
  console.error(`Lawful news data boundary failed (${violations.length} violation(s)):`);
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}
console.log(
  'Lawful news data boundary passed: no restricted corpus names or secret-shaped values in bundle roots.',
);
