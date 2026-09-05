import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
const allowed = new Set([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MPL-2.0',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  '(MIT OR CC0-1.0)',
]);
const packages = [];
const violations = [];
for (const [location, metadata] of Object.entries(lock.packages ?? {})) {
  if (!location.startsWith('node_modules/') || location.includes('/node_modules/')) continue;
  if (!metadata.version) continue; // npm workspace links have no version/license metadata.
  const license = metadata.license;
  packages.push({
    name: location.slice('node_modules/'.length),
    version: metadata.version,
    license: license ?? null,
  });
  if (!license || !allowed.has(license))
    violations.push({ location, version: metadata.version, license: license ?? 'MISSING' });
}
const report = {
  schemaVersion: 1,
  source: 'package-lock.json',
  packageCount: packages.length,
  allowedLicenses: [...allowed].sort(),
  packages,
  violations,
};
const output = path.join(root, 'out', 'compliance', 'license-report.json');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
if (violations.length) {
  console.error(
    `License check failed: ${violations.length} package(s) have missing or unapproved licenses.`,
  );
  for (const violation of violations) console.error(`${violation.location}: ${violation.license}`);
  process.exit(1);
}
console.log(`License check passed: ${packages.length} external packages reviewed.`);
