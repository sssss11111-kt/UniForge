import { describe, expect, it } from 'vitest';
import { CourseNotesService } from './course-notes-service.js';

const context = { actor: 'user' as const, permissions: ['course:notes:write'] };
const input = {
  commandId: 'command-note-1' as never,
  courseId: 'course-1' as never,
  contentEntityId: 'content-1' as never,
  title: 'Recursion',
  body: 'A function calls itself on a smaller input.',
  citations: [{ sourceId: 'material-1', locator: 'page:2', label: 'lecture.pdf p.2' }],
  context,
};

describe('CourseNotesService', () => {
  it('creates a personal note linked to the course content entity with provenance', async () => {
    const service = new CourseNotesService({
      request: async () => ({ status: 'APPROVED' as const }),
    });
    const result = await service.createPersonalNote(input);
    expect(result.kind).toBe('PERSONAL_NOTE');
    expect(result.contentEntityId).toBe('content-1');
    expect(result.citations[0]).toMatchObject({ locator: 'page:2' });
    expect(result.provenance[0]?.kind).toBe('USER_AUTHORED');
  });

  it('records an AI draft and waits for approval before publishing official content', async () => {
    const service = new CourseNotesService({
      request: async () => ({ status: 'PENDING', approvalId: 'approval-1' }),
    });
    const draft = await service.createAiDraft(input);
    const published = await service.publishDraft({ draftId: draft.id, context });
    expect(published.status).toBe('WAITING_APPROVAL');
    expect(published.approvalId).toBe('approval-1');
    expect(published.kind).toBe('AI_DRAFT');
  });

  it('publishes an approved draft with an explicit diff and provenance', async () => {
    const service = new CourseNotesService({
      request: async () => ({ status: 'APPROVED', approvalId: 'approval-2' }),
    });
    const draft = await service.createAiDraft(input);
    const published = await service.publishDraft({ draftId: draft.id, context });
    expect(published.status).toBe('PUBLISHED');
    expect(published.kind).toBe('OFFICIAL_COURSE_NOTE');
    expect(published.diff).toContain('+ A function calls itself');
    expect(published.provenance.at(-1)?.kind).toBe('USER_APPROVED');
  });

  it('records denied approval and rejects missing note permission', async () => {
    const denied = new CourseNotesService({
      request: async () => ({ status: 'DENIED', approvalId: 'approval-3' }),
    });
    const draft = await denied.createAiDraft(input);
    const failed = await denied.publishDraft({ draftId: draft.id, context });
    expect(failed.status).toBe('FAILED');
    expect(failed.error).toBe('APPROVAL_DENIED');
    await expect(
      denied.createPersonalNote({ ...input, context: { actor: 'user', permissions: [] } }),
    ).rejects.toThrow('PERMISSION_DENIED');
  });
});
