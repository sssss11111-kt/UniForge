import { describe, expect, it } from 'vitest';
import { CourseWorkspaceBoundary } from './course-workspace-boundary.js';

describe('CourseWorkspaceBoundary', () => {
  it('allows only authorized temporary course workspace paths', () => {
    const boundary = new CourseWorkspaceBoundary({
      protectedRoots: ['C:/Users/Tong/Documents/ChatGPT/New project'],
    });
    expect(boundary.assertEntry('C:/Users/student/course-work', 'main.py')).toMatchObject({
      ok: true,
      path: 'C:\\Users\\student\\course-work\\main.py',
    });
    expect(boundary.assertEntry('C:/Users/student/course-work', '../other.py')).toMatchObject({
      ok: false,
      error: 'PROTECTED_PATH',
    });
    expect(boundary.assertEntry('C:/Users/Tong/Documents/ChatGPT/New project', 'main.py')).toMatchObject({
      ok: false,
      error: 'PROTECTED_PATH',
    });
  });
});
