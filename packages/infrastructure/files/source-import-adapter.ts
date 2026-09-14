import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SourceImportFilePort } from '@uniforge/core/application/source-import-service.js';

export const createSourceImportFileAdapter = (): SourceImportFilePort => ({
  async copyAndRead({ sourcePath, managedWorkspaceRoot }) {
    const data = await readFile(sourcePath);
    const sha256 = createHash('sha256').update(data).digest('hex');
    const managedRoot = path.resolve(managedWorkspaceRoot);
    const managedCopyPath = path.join(managedRoot, sha256);
    await mkdir(managedRoot, { recursive: true });
    try {
      await writeFile(managedCopyPath, data, { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    return {
      body: data.toString('utf8'),
      fileId: sha256,
      sha256,
      managedCopyPath,
    };
  },
});
