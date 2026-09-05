import type { Id, Instant } from '../domain/primitives.js';
export * from './recognition.js';

export type CourseType =
  | 'THEORY_COMPUTATION'
  | 'PROGRAMMING'
  | 'EXPERIMENTAL_ENGINEERING'
  | 'LANGUAGE'
  | 'MEMORY'
  | 'COMPREHENSIVE'
  | 'CUSTOM';

export interface Term {
  readonly id: Id<'term'>;
  readonly name: string;
}
export interface Module {
  readonly id: Id<'module'>;
  readonly courseId: Id<'course'>;
  readonly title: string;
  readonly position: number;
}
export type AssessmentKind = 'ASSIGNMENT' | 'EXAM';
export interface Assessment {
  readonly id: Id<'assessment'>;
  readonly courseId: Id<'course'>;
  readonly title: string;
  readonly kind: AssessmentKind;
  readonly dueAt?: Instant;
}
export interface Course {
  readonly id: Id<'course'>;
  readonly name: string;
  readonly type: CourseType;
  readonly term: Term;
  readonly modules: readonly Module[];
  readonly assessments: readonly Assessment[];
  readonly materials: readonly CourseMaterial[];
}
export type CourseMaterialType = 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'IMAGE' | 'TEXT' | 'UNKNOWN';
export interface ExtractionRange {
  readonly locator: string;
  readonly start: number;
  readonly end: number;
}
export interface SourceCitation {
  readonly locator: string;
  readonly label: string;
}
export interface CourseMaterial {
  readonly id: Id<'course-material'>;
  readonly courseId: Id<'course'>;
  readonly originalFileName: string;
  readonly originalPath: string;
  readonly managedCopyPath: string;
  readonly contentHash: string;
  readonly detectedType: CourseMaterialType;
  readonly parserVersion: string;
  readonly extractedRanges: readonly ExtractionRange[];
  readonly citations: readonly SourceCitation[];
  readonly importedAt: Instant;
}
export interface ImportCourseMaterialInput {
  readonly commandId: Id<'command'>;
  readonly courseId: Id<'course'>;
  readonly sourcePath: string;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
export interface CourseMaterialSnapshotDto {
  readonly courseId: Id<'course'>;
  readonly materials: readonly CourseMaterial[];
  readonly imported?: CourseMaterial;
}
export interface CourseSnapshotDto {
  readonly course: Course;
  readonly generatedAt: Instant;
}
export interface CreateCourseInput {
  readonly commandId: Id<'command'>;
  readonly name: string;
  readonly type: CourseType;
  readonly termName: string;
  readonly context: { readonly actor: 'user' | 'agent'; readonly permissions: readonly string[] };
}
