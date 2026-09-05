import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
const components = [];
for (const [location, metadata] of Object.entries(lock.packages ?? {})) {
  if (
    !location.startsWith('node_modules/') ||
    location.includes('/node_modules/') ||
    !metadata.version
  )
    continue;
  const name = location.slice('node_modules/'.length);
  components.push({
    type: 'library',
    bomRef: `pkg:npm/${name}@${metadata.version}`,
    name,
    version: metadata.version,
    purl: `pkg:npm/${name}@${metadata.version}`,
    licenses: metadata.license ? [{ license: { id: metadata.license } }] : [],
    hashes: metadata.integrity
      ? [{ alg: 'SHA-512', content: metadata.integrity.replace(/^sha512-/, '') }]
      : [],
  });
}
components.sort((a, b) => a.purl.localeCompare(b.purl));
const bom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: 'urn:uuid:uniforge-stage-0-lockfile',
  version: 1,
  metadata: { component: { type: 'application', name: 'uniforge', version: lock.version } },
  components,
};
const output = path.join(root, 'out', 'compliance', 'sbom.cdx.json');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(bom, null, 2)}\n`);
console.log(
  `SBOM generated: ${components.length} external components (${path.relative(root, output)}).`,
);
