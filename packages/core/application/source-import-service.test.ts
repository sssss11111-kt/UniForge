import { describe, expect, it } from 'vitest';
import { SourceImportService, type SourceImportFilePort } from './source-import-service.js';

const sourcePath = 'incoming/notes.txt';
const managedRoot = 'managed';

class InMemorySourceImportFileAdapter implements SourceImportFilePort {
  readonly files = new Map<string, string>();

  async copyAndRead(input: {
    sourcePath: string;
    managedWorkspaceRoot: string;
  }): Promise<{ body: string; fileId: string; sha256: string; managedCopyPath: string }> {
    const body = this.files.get(input.sourcePath);
    if (body === undefined) throw new Error(`Missing source: ${input.sourcePath}`);
    const sha256 = 'a'.repeat(64);
    const managedCopyPath = `${input.managedWorkspaceRoot}/${sha256}`;
    this.files.set(managedCopyPath, body);
    return { body, fileId: sha256, sha256, managedCopyPath };
  }
}

describe('SourceImportService', () => {
  it('copies a source into managed storage and retains capture, license, checksum and provenance', async () => {
    const files = new InMemorySourceImportFileAdapter();
    files.files.set(sourcePath, 'captured source');

    const imported = await new SourceImportService(files).import({
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
    expect(imported.sourceEvent.checksum).toBe('a'.repeat(64));
    expect(imported.content.provenance).toEqual(['source-1']);
    expect(imported.content.body).toBe('captured source');
    expect(imported.content.provenanceRecords?.[0]).toMatchObject({
      sourceEventId: 'source-1',
      capturedAt: '2026-09-08T00:00:00Z',
      license: 'MIT',
    });
    expect(files.files.get(imported.content.workspacePath!)).toBe('captured source');
  });

  it('fails closed without write permission or a license', async () => {
    const files = new InMemorySourceImportFileAdapter();
    files.files.set(sourcePath, 'captured source');
    const input = {
      sourcePath,
      managedWorkspaceRoot: managedRoot,
      sourceEvent: {
        id: 'source-2',
        sourceType: 'FILE' as const,
        capturedAt: '2026-09-08T00:00:00Z',
        locator: sourcePath,
      },
      permissions: ['knowledge:write'],
    };

    await expect(
      new SourceImportService(files).import({ ...input, permissions: [] }),
    ).rejects.toThrow('knowledge:write');
    await expect(new SourceImportService(files).import(input)).rejects.toThrow('license');
  });
});
