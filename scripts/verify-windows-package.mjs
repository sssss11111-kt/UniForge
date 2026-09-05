import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.resolve(
  process.argv[2] ?? path.join(root, 'out', 'make', 'windows-manifest.json'),
);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.format !== 'uniforge-windows-preview' || manifest.signed !== false)
  throw new Error('Invalid preview manifest');
if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0)
  throw new Error('No installer/package artifact recorded');
for (const artifact of manifest.artifacts) {
  const file = path.resolve(root, artifact.path);
  await access(file);
  if (
    createHash('sha256')
      .update(await readFile(file))
      .digest('hex') !== artifact.sha256
  )
    throw new Error(`Hash mismatch: ${artifact.path}`);
}
console.error(
  'BLOCKED: clean Windows install, launch, SQLite, sidecar, uninstall, and rollback require an isolated Windows VM.',
);
process.exit(2);
