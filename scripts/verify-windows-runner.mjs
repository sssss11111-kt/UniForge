import { access, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
const root = process.cwd();
const make = path.join(root, 'out', 'make');
const exe = await (async function find(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) {
      const x = await find(f);
      if (x) return x;
    } else if (/UniForge-.* Setup\.exe$/i.test(e.name)) return f;
  }
})(make);
if (!exe) throw new Error('Installer not found');
const local = process.env.LOCALAPPDATA;
const install = path.join(local, 'UniForge');
const run = (file, args) =>
  new Promise((res, rej) => {
    const p = spawn(file, args, { stdio: 'inherit', windowsHide: true });
    p.on('error', rej);
    p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`${path.basename(file)} exited ${c}`))));
  });
await run(exe, ['--silent']);
const update = path.join(install, 'Update.exe');
await access(update);
const app = await (async () => {
  const entries = await readdir(install, { withFileTypes: true });
  const versioned = entries
    .filter((entry) => entry.isDirectory() && /^app-/i.test(entry.name))
    .map((entry) => path.join(install, entry.name, 'uniforge.exe'));
  for (const candidate of versioned) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  const rootApp = path.join(install, 'uniforge.exe');
  await access(rootApp);
  return rootApp;
})();
const smokeData = path.join(local, 'UniForge-smoke-data');
const child = spawn(
  app,
  [
    '--user-data-dir=' + smokeData,
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-gpu-sandbox',
    '--disable-features=HardwareMediaKeyHandling,AudioServiceOutOfProcess',
    '--no-sandbox',
    '--enable-logging=stderr',
    '--log-level=0',
  ],
  { windowsHide: true, detached: true, stdio: ['ignore', 'pipe', 'pipe'] },
);
let stderr = '';
child.stderr?.on('data', (chunk) => {
  stderr += chunk.toString();
});
await new Promise((r) => setTimeout(r, 10000));
if (child.exitCode !== null) {
  throw new Error(`Packaged app exited before smoke check (code ${child.exitCode}). ${stderr}`);
}
child.kill();
await run(update, ['--uninstall']);
console.log(
  'Windows install/launch/uninstall smoke passed. SQLite and sidecar contracts remain covered by integration tests.',
);
