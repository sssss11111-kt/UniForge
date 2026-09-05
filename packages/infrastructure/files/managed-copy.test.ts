import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isWithin } from './authorized-path.js';
import { createCourseMaterialCopy } from './course-material-copy.js';
import { assertAuthorizedWritable } from './protected-path-policy.js';
describe('workspace ownership', () => {
  it('rejects traversal', () =>
    expect(isWithin('C:/workspace', 'C:/workspace/../other')).toBe(false));
  it('rejects protected paths', () =>
    expect(() => assertAuthorizedWritable('C:/workspace', 'C:/workspace/.git/config')).toThrow(
      'PROTECTED_PATH',
    ));
  it('copies a selected file into the managed workspace area', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'uniforge-material-'));
    const source = path.join(root, 'lecture.pdf');
    await fs.writeFile(source, 'course material');
    const result = await createCourseMaterialCopy(root)(source);
    expect(result.originalFileName).toBe('lecture.pdf');
    expect(result.managedCopyPath).toContain(path.join(root, 'managed'));
    await expect(fs.readFile(result.managedCopyPath, 'utf8')).resolves.toBe('course material');
  });
});
