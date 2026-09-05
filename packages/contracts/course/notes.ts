import type { Id, Instant } from '../domain/primitives.js';

export type CourseNoteKind = 'PERSONAL_NOTE' | 'AI_DRAFT' | 'OFFICIAL_COURSE_NOTE';
export type CourseNoteStatus = 'DRAFT' | 'WAITING_APPROVAL' | 'PUBLISHED' | 'FAILED';
export type CourseNoteStorage = 'UNIFORGE_MANAGED' | 'OBSIDIAN_MARKDOWN';

export interface NoteCitation {
  readonly sourceId: string;
  readonly locator: string;
  readonly label: string;
  readonly contentHash?: string;
}

export interface NoteProvenance {
  readonly kind: 'USER_AUTHORED' | 'AI_GENERATED' | 'USER_APPROVED';
  readonly actorId?: string;
  readonly generatedAt?: Instant;
}

export interface CourseNote {
  readonly id: Id<'course-note'>;
  readonly courseId: Id<'course'>;
  readonly contentEntityId: Id<'content'>;
  readonly kind: CourseNoteKind;
  readonly status: CourseNoteStatus;
  readonly title: string;
  /** Draft/personal content only. Official Obsidian content is referenced by canonicalBodyRef. */
  readonly body?: string;
  readonly canonicalBodyRef?: string;
  readonly storage: CourseNoteStorage;
  readonly citations: readonly NoteCitation[];
  readonly provenance: readonly NoteProvenance[];
  readonly diff?: string;
  readonly approvalId?: string;
  readonly error?: 'APPROVAL_DENIED' | 'OFFICIAL_STORAGE_UNAVAILABLE';
  readonly createdAt: Instant;
  readonly updatedAt: Instant;
}

export interface CourseNotesSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly notes: readonly CourseNote[];
}

export interface CreateCourseNoteInput {
  readonly commandId: Id<'command'>;
  readonly courseId: Id<'course'>;
  readonly contentEntityId: Id<'content'>;
  readonly title: string;
  readonly body: string;
  readonly citations: readonly NoteCitation[];
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}

export interface PublishCourseNoteInput {
  readonly draftId: Id<'course-note'>;
  readonly approvalId?: string;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
