import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stage = path.join(root, 'out', '.stage0-windows');
const appRoot = path.join(stage, 'app');
const npm =
  process.platform === 'win32'
    ? (process.env.npm_execpath ??
      path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'))
    : 'npm';
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed (${result.status})`);
}
if (process.platform !== 'win32' && process.env.UF_ALLOW_CROSS_WINDOWS_PACKAGE !== '1') {
  console.error(
    'BLOCKED: Windows packaging requires a Windows host; use a Windows VM for installer evidence.',
  );
  process.exit(2);
}
for (const args of [
  ['run', 'typecheck'],
  ['run', 'lint'],
  ['run', 'format:check'],
  ['run', 'check-boundaries'],
  ['run', 'check-doc-links'],
  ['run', 'unit'],
  ['run', 'build:desktop'],
])
  run(
    process.platform === 'win32' ? process.execPath : npm,
    process.platform === 'win32' ? [npm, ...args] : args,
  );
await rm(stage, { recursive: true, force: true });
await mkdir(appRoot, { recursive: true });
await cp(path.join(root, 'apps', 'desktop', 'dist'), path.join(appRoot, 'dist'), {
  recursive: true,
});
const contractsRoot = path.join(appRoot, 'node_modules', '@uniforge', 'contracts');
await mkdir(contractsRoot, { recursive: true });
await cp(path.join(root, 'packages', 'contracts', 'dist'), path.join(contractsRoot, 'dist'), {
  recursive: true,
});
await writeFile(
  path.join(contractsRoot, 'package.json'),
  JSON.stringify(
    {
      name: '@uniforge/contracts',
      version: '0.0.0',
      type: 'module',
      exports: { '.': './dist/index.js', './*': './dist/*' },
    },
    null,
    2,
  ),
);
const rootPackage = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
await writeFile(
  path.join(appRoot, 'package.json'),
  JSON.stringify(
    {
      name: 'uniforge',
      productName: 'UniForge',
      version: rootPackage.version,
      private: true,
      type: 'module',
      main: 'dist/main/index.js',
      description: 'UniForge preview test build',
    },
    null,
    2,
  ),
);
await cp(path.join(root, 'sidecars'), path.join(appRoot, 'sidecars'), { recursive: true });
run(
  process.execPath,
  [
    path.join(root, 'node_modules', '@electron-forge', 'cli', 'dist', 'electron-forge.js'),
    'make',
    '--platform',
    'win32',
    '--arch',
    'x64',
    '--config',
    path.join(root, 'apps', 'desktop', 'forge.config.ts'),
  ],
  appRoot,
);
const makeRoot = path.join(root, 'out', 'make');
const artifacts = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (/\.(?:exe|msi|zip)$/i.test(entry.name))
      artifacts.push({
        path: path.relative(root, file),
        sha256: createHash('sha256')
          .update(await readFile(file))
          .digest('hex'),
      });
  }
}
await collect(makeRoot);
const manifest = {
  format: 'uniforge-windows-preview',
  schemaVersion: 1,
  productVersion: rootPackage.version,
  platform: 'win32',
  arch: 'x64',
  signed: false,
  artifacts,
  nativeBinding: {
    driver: 'node:sqlite',
    verification: 'host-only; packaged Electron verification pending',
  },
  sidecars: ['ocr', 'speech', 'document'].map((kind) => ({
    kind,
    status: 'BLOCKED',
    reason: 'reviewed engine executable is not bundled in Stage 0',
  })),
  generatedAt: new Date().toISOString(),
};
await writeFile(
  path.join(makeRoot, 'windows-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Windows preview package created with ${artifacts.length} artifact(s).`);
