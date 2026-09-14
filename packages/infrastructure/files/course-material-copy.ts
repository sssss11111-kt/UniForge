import fs from 'node:fs/promises';
import path from 'node:path';
import { importManaged } from './managed-copy.js';
import { assertAuthorizedWritable } from './protected-path-policy.js';
import { workspaceLayout } from './workspace-layout.js';
export const createCourseMaterialCopy = (workspaceRoot: string) => async (sourcePath: string) => {
  const source = path.resolve(sourcePath);
  const stat = await fs.stat(source);
  if (!stat.isFile()) throw new Error('INVALID_INPUT');
  const layout = workspaceLayout(workspaceRoot);
  assertAuthorizedWritable(layout.root, layout.managed);
  const copied = await importManaged(source, layout.managed);
  return {
    originalFileName: path.basename(source),
    originalPath: source,
    managedCopyPath: path.join(layout.managed, copied.fileId),
    contentHash: copied.sha256,
  };
};
