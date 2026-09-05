import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  StructuredLogger,
  createBackup,
  restoreBackup,
  validateBackup,
} from '../../packages/infrastructure/index.js';

describe('diagnostics and backup foundation', () => {
  it('redacts secrets in structured and crash logs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'uniforge-log-'));
    const file = join(root, 'logs', 'app.jsonl');
    const logger = new StructuredLogger(file);
    await logger.crash(new Error('boom'), { apiKey: 'sk-live-secret', cookie: 'private' });
    const line = await readFile(file, 'utf8');
    expect(line).toContain('process.crash');
    expect(line).not.toContain('sk-live-secret');
    expect(line).not.toContain('private');
  });

  it('round trips only authorized managed files and validates corruption', async () => {
    const root = await mkdtemp(join(tmpdir(), 'uniforge-backup-'));
    const source = join(root, 'backup.json');
    const created = await createBackup(source, {
      schemaVersion: 1,
      domainData: { task: 'keep', apiKey: 'omit' },
      configuration: { theme: 'dark', cookie: 'omit' },
      managedFiles: [
        { relativePath: 'course/a.md', content: Buffer.from('hello'), authorized: true },
        { relativePath: 'private.raw', content: Buffer.from('omit'), authorized: false },
      ],
    });
    expect(created.ok).toBe(true);
    expect(
      created.ok
        ? (created.value.payload.domainData as { apiKey?: string }).apiKey
        : 'unexpected failure',
    ).toBeUndefined();
    const checked = await validateBackup(source, 1);
    expect(checked.ok).toBe(true);
    const restored = await restoreBackup(source, join(root, 'restored'), 1);
    expect(restored.ok).toBe(true);
    expect(await readFile(join(root, 'restored', 'course/a.md'), 'utf8')).toBe('hello');
    await writeFile(source, '{corrupt');
    expect((await validateBackup(source)).ok).toBe(false);
  });
});
