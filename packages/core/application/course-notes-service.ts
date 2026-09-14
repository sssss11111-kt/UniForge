import type {
  CourseNote,
  CourseNotesSnapshotDto,
  CreateCourseNoteInput,
  PublishCourseNoteInput,
} from '@uniforge/contracts/course/notes.js';

export interface CourseNotesApprovalPort {
  request(input: {
    readonly draftId: CourseNote['id'];
    readonly courseId: CourseNote['courseId'];
  }): Promise<{
    readonly status: 'APPROVED' | 'PENDING' | 'DENIED';
    readonly approvalId?: string;
  }>;
}

export class CourseNotesService {
  private readonly notes: CourseNote[] = [];

  public constructor(private readonly approval: CourseNotesApprovalPort) {}

  async createPersonalNote(input: CreateCourseNoteInput): Promise<CourseNote> {
    this.assertWritable(input);
    return this.store(this.base(input, 'PERSONAL_NOTE', 'USER_AUTHORED'));
  }

  async createAiDraft(input: CreateCourseNoteInput): Promise<CourseNote> {
    this.assertWritable(input);
    return this.store(this.base(input, 'AI_DRAFT', 'AI_GENERATED'));
  }

  async publishDraft(input: PublishCourseNoteInput): Promise<CourseNote> {
    if (input.context.actor !== 'user' || !input.context.permissions.includes('course:notes:write'))
      throw new Error('PERMISSION_DENIED');
    const draft = this.notes.find((note) => note.id === input.draftId && note.kind === 'AI_DRAFT');
    if (!draft) throw new Error('NOTE_NOT_FOUND');
    const decision = await this.approval.request({ draftId: draft.id, courseId: draft.courseId });
    if (decision.status === 'PENDING' && !input.approvalId) {
      const waiting = {
        ...draft,
        status: 'WAITING_APPROVAL' as const,
        ...(decision.approvalId ? { approvalId: decision.approvalId } : {}),
      };
      return this.replace(waiting);
    }
    if (decision.status === 'DENIED') {
      const failed = {
        ...draft,
        status: 'FAILED' as const,
        error: 'APPROVAL_DENIED' as const,
        ...(decision.approvalId ? { approvalId: decision.approvalId } : {}),
      };
      return this.replace(failed);
    }
    if (decision.status !== 'APPROVED' && !input.approvalId) {
      const failed = {
        ...draft,
        status: 'FAILED' as const,
        error: 'OFFICIAL_STORAGE_UNAVAILABLE' as const,
      };
      return this.replace(failed);
    }
    const now = new Date().toISOString() as CourseNote['updatedAt'];
    const official: CourseNote = {
      id: `course-note-official-${draft.id}` as CourseNote['id'],
      courseId: draft.courseId,
      contentEntityId: draft.contentEntityId,
      kind: 'OFFICIAL_COURSE_NOTE',
      status: 'PUBLISHED',
      title: draft.title,
      canonicalBodyRef: `content://${draft.contentEntityId}`,
      storage: 'UNIFORGE_MANAGED',
      citations: draft.citations,
      provenance: [...draft.provenance, { kind: 'USER_APPROVED', generatedAt: now }],
      diff: `+ ${draft.body ?? ''}`,
      ...(input.approvalId || decision.approvalId
        ? { approvalId: input.approvalId ?? decision.approvalId }
        : {}),
      createdAt: now,
      updatedAt: now,
    };
    return this.store(official);
  }

  async getSnapshot(courseId: CourseNote['courseId']): Promise<CourseNotesSnapshotDto> {
    return { courseId, notes: this.notes.filter((note) => note.courseId === courseId) };
  }

  private base(
    input: CreateCourseNoteInput,
    kind: CourseNote['kind'],
    provenanceKind: 'USER_AUTHORED' | 'AI_GENERATED',
  ): CourseNote {
    const now = new Date().toISOString() as CourseNote['createdAt'];
    if (!input.title.trim() || !input.body.trim() || !input.courseId || !input.contentEntityId)
      throw new Error('INVALID_INPUT');
    return {
      id: `course-note-${input.commandId}-${kind.toLowerCase()}` as CourseNote['id'],
      courseId: input.courseId,
      contentEntityId: input.contentEntityId,
      kind,
      status: 'DRAFT',
      title: input.title.trim(),
      body: input.body.trim(),
      storage: 'UNIFORGE_MANAGED',
      citations: input.citations,
      provenance: [{ kind: provenanceKind, generatedAt: now }],
      createdAt: now,
      updatedAt: now,
    };
  }

  private assertWritable(input: CreateCourseNoteInput): void {
    if (input.context.actor !== 'user' || !input.context.permissions.includes('course:notes:write'))
      throw new Error('PERMISSION_DENIED');
  }

  private store(note: CourseNote): CourseNote {
    this.notes.push(note);
    return note;
  }

  private replace(note: CourseNote): CourseNote {
    const index = this.notes.findIndex((candidate) => candidate.id === note.id);
    if (index < 0) return this.store(note);
    this.notes[index] = note;
    return note;
  }
}
