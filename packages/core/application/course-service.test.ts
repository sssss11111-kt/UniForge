import { describe, expect, it } from 'vitest';
import { CourseService } from './course-service.js';

describe('CourseService', () => {
  it('creates a course through an authorized domain command and returns an empty course snapshot', async () => {
    const service = new CourseService();
    const result = await service.createCourse({
      commandId: 'command-course-1' as never,
      name: 'Algorithms',
      type: 'THEORY_COMPUTATION',
      termName: 'Fall 2026',
      context: { actor: 'user', permissions: ['course:write'] },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.course.name).toBe('Algorithms');
      expect(result.value.course.term.name).toBe('Fall 2026');
      expect(result.value.course.modules).toEqual([]);
      expect(result.value.course.assessments).toEqual([]);
    }
  });

  it('rejects writes without the course permission', async () => {
    const result = await new CourseService().createCourse({
      commandId: 'command-course-2' as never,
      name: 'Physics',
      type: 'THEORY_COMPUTATION',
      termName: 'Fall 2026',
      context: { actor: 'user', permissions: [] },
    });

    expect(result).toEqual({ ok: false, error: 'PERMISSION_DENIED' });
  });
});
