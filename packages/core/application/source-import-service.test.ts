import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { SourceImportService } from './source-import-service.js';

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe('SourceImportService', () => {
  it('copies a source into managed storage and retains capture, license, checksum and provenance', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'uniforge-source-'));
    temporaryDirectories.push(root);
    const sourcePath = path.join(root, 'notes.txt');
    const managedRoot = path.join(root, 'managed');
    await writeFile(sourcePath, 'captured source', 'utf8');

    const imported = await new SourceImportService().import({
      sourcePath,
      managedWorkspaceRoot: managedRoot,
      mimeType: 'text/plain',
      sourceEvent: {
        id: 'source-1',
        sourceType: 'FILE',
        capturedAt: '2026-09-08T00:00:00Z',
        locator: sourcePath,
        license: 'MIT',
      },
      permissions: ['knowledge:write'],
    });

    expect(imported.sourceEvent.license).toBe('MIT');
    expect(imported.sourceEvent.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(imported.content.provenance).toEqual(['source-1']);
    expect(imported.content.body).toBe('captured source');
    expect(imported.content.provenanceRecords?.[0]).toMatchObject({
      sourceEventId: 'source-1',
      capturedAt: '2026-09-08T00:00:00Z',
      license: 'MIT',
    });
    expect(await readFile(imported.content.workspacePath!, 'utf8')).toBe('captured source');
  });

  it('fails closed without write permission or a license', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'uniforge-source-'));
    temporaryDirectories.push(root);
    const sourcePath = path.join(root, 'notes.txt');
    await writeFile(sourcePath, 'captured source', 'utf8');
    const input = {
      sourcePath,
      managedWorkspaceRoot: path.join(root, 'managed'),
      sourceEvent: {
        id: 'source-2',
        sourceType: 'FILE' as const,
        capturedAt: '2026-09-08T00:00:00Z',
        locator: sourcePath,
      },
      permissions: ['knowledge:write'],
    };

    await expect(new SourceImportService().import({ ...input, permissions: [] })).rejects.toThrow(
      'knowledge:write',
    );
    await expect(new SourceImportService().import(input)).rejects.toThrow('license');
  });
});
