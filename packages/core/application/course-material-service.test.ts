import { describe, expect, it } from 'vitest';
import { CourseMaterialService } from './course-material-service.js';
describe('CourseMaterialService', () => {
  it('records managed copy provenance without extraction', async () => {
    const service = new CourseMaterialService(async (sourcePath) => ({
      originalFileName: 'lecture.pdf',
      originalPath: sourcePath,
      managedCopyPath: 'managed/hash',
      contentHash: 'hash',
    }));
    const result = await service.importMaterial({
      commandId: 'command-material-1' as never,
      courseId: 'course-1' as never,
      sourcePath: 'C:/input/lecture.pdf',
      context: { actor: 'user', permissions: ['course:write'] },
    });
    expect(result.imported?.detectedType).toBe('PDF');
    expect(result.imported?.managedCopyPath).toBe('managed/hash');
    expect(result.imported?.parserVersion).toBe('none@1');
    expect(result.imported?.extractedRanges).toEqual([]);
    expect(result.imported?.citations).toEqual([]);
  });
  it('requires course write permission', async () => {
    const service = new CourseMaterialService(async () => ({
      originalFileName: 'x.txt',
      originalPath: 'x',
      managedCopyPath: 'm',
      contentHash: 'h',
    }));
    await expect(
      service.importMaterial({
        commandId: 'command-material-2' as never,
        courseId: 'course-1' as never,
        sourcePath: 'x',
        context: { actor: 'user', permissions: [] },
      }),
    ).rejects.toThrow('PERMISSION_DENIED');
  });
});
