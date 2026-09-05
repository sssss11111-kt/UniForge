import type {
  Course,
  CourseSnapshotDto,
  CreateCourseInput,
} from '@uniforge/contracts/course/index.js';

export type CourseResult =
  | { readonly ok: true; readonly value: CourseSnapshotDto }
  | { readonly ok: false; readonly error: 'INVALID_INPUT' | 'PERMISSION_DENIED' };

export class CourseService {
  private course?: Course;

  async createCourse(input: CreateCourseInput): Promise<CourseResult> {
    if (!input.name.trim() || !input.termName.trim()) return { ok: false, error: 'INVALID_INPUT' };
    if (!input.context.permissions.includes('course:write'))
      return { ok: false, error: 'PERMISSION_DENIED' };
    const courseId = `course-${input.commandId}` as Course['id'];
    this.course = {
      id: courseId,
      name: input.name.trim(),
      type: input.type,
      term: { id: `term-${input.commandId}` as Course['term']['id'], name: input.termName.trim() },
      modules: [],
      assessments: [],
      materials: [],
    };
    return { ok: true, value: this.snapshot() };
  }

  async getSnapshot(): Promise<CourseSnapshotDto> {
    return this.snapshot();
  }

  private snapshot(): CourseSnapshotDto {
    return {
      course: this.course ?? {
        id: 'course-empty' as Course['id'],
        name: '',
        type: 'CUSTOM',
        term: { id: 'term-empty' as Course['term']['id'], name: '' },
        modules: [],
        assessments: [],
        materials: [],
      },
      generatedAt: new Date().toISOString() as CourseSnapshotDto['generatedAt'],
    };
  }
}
