import { describe, expect, it } from 'vitest';
import { CourseRecognitionService } from './course-recognition-service.js';
import { CourseService } from './course-service.js';

const candidate = {
  kind: 'ASSIGNMENT' as const,
  title: 'Problem set 1',
  dueAt: '2026-09-20T10:00:00.000Z' as never,
};

describe('CourseRecognitionService', () => {
  it('stores a reviewable recognition proposal with evidence and confidence without formal writes', async () => {
    let formalWrites = 0;
    const service = new CourseRecognitionService(async () => {
      formalWrites += 1;
    });

    const result = await service.propose({
      proposalId: 'recognition-1' as never,
      courseId: 'course-1' as never,
      source: {
        materialId: 'course-material-1' as never,
        locator: 'page:2',
        label: 'syllabus.pdf, page 2',
      },
      confidence: 0.91,
      candidates: [candidate],
    });

    expect(result.status).toBe('PENDING_CONFIRMATION');
    expect(result.source.locator).toBe('page:2');
    expect(result.confidence).toBe(0.91);
    expect(result.candidates).toEqual([candidate]);
    expect(formalWrites).toBe(0);
  });

  it('requires user confirmation and course permission before formal write', async () => {
    let formalWrites = 0;
    const service = new CourseRecognitionService(async () => {
      formalWrites += 1;
    });
    await service.propose({
      proposalId: 'recognition-2' as never,
      courseId: 'course-1' as never,
      source: { materialId: 'material-1' as never, locator: 'page:3', label: 'page 3' },
      confidence: 0.8,
      candidates: [candidate],
    });

    await expect(
      service.confirm({
        proposalId: 'recognition-2' as never,
        context: { actor: 'agent', permissions: ['course:write'] },
      }),
    ).rejects.toThrow('USER_CONFIRMATION_REQUIRED');
    await expect(
      service.confirm({
        proposalId: 'recognition-2' as never,
        context: { actor: 'user', permissions: [] },
      }),
    ).rejects.toThrow('PERMISSION_DENIED');
    await service.confirm({
      proposalId: 'recognition-2' as never,
      context: { actor: 'user', permissions: ['course:write'] },
    });
    expect(formalWrites).toBe(1);
  });

  it('rejects recognition without evidence or with invalid confidence', async () => {
    const service = new CourseRecognitionService(async () => undefined);
    await expect(
      service.propose({
        proposalId: 'recognition-3' as never,
        courseId: 'course-1' as never,
        source: { materialId: 'material-1' as never, locator: '', label: '' },
        confidence: 1.2,
        candidates: [candidate],
      }),
    ).rejects.toThrow('INVALID_RECOGNITION');
  });

  it('writes confirmed candidates through the Course domain service', async () => {
    const course = new CourseService();
    await course.createCourse({
      commandId: 'command-course-recognition' as never,
      name: 'Algorithms',
      type: 'THEORY_COMPUTATION',
      termName: 'Fall 2026',
      context: { actor: 'user', permissions: ['course:write'] },
    });
    const service = new CourseRecognitionService((proposal) => course.applyRecognition(proposal));
    await service.propose({
      proposalId: 'recognition-4' as never,
      courseId: 'course-command-course-recognition' as never,
      source: { materialId: 'material-1' as never, locator: 'page:4', label: 'page 4' },
      confidence: 0.95,
      candidates: [candidate],
    });
    await service.confirm({
      proposalId: 'recognition-4' as never,
      context: { actor: 'user', permissions: ['course:write'] },
    });
    expect((await course.getSnapshot()).course.assessments[0]?.title).toBe('Problem set 1');
  });
});
