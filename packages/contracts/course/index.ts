import type { Id, Instant } from '../domain/primitives.js';

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
