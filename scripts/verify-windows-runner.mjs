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
const app = path.join(install, 'uniforge.exe');
await access(app);
const child = spawn(app, ['--user-data-dir=' + path.join(install, 'test-data')], {
  windowsHide: true,
  detached: true,
});
await new Promise((r) => setTimeout(r, 5000));
if (child.exitCode !== null) throw new Error('Packaged app exited before smoke check');
child.kill();
await run(update, ['--uninstall']);
console.log(
  'Windows install/launch/uninstall smoke passed. SQLite and sidecar contracts remain covered by integration tests.',
);
