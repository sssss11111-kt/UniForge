import type { AppShellResponseDto, HealthDto } from './dto.js';
import type { SettingsSnapshotDto, UpdateModelSettingsInput } from '../settings/index.js';
import type { DashboardSnapshotDto } from '../dashboard/index.js';
import type {
  CourseMaterialSnapshotDto,
  CourseSnapshotDto,
  CreateCourseInput,
  AssignmentSnapshotDto,
  StartAssignmentInput,
} from '../course/index.js';
import type { CourseExecutionRequest, CourseExecutionSnapshotDto } from '../course/execution.js';
import type {
  CourseNotesSnapshotDto,
  CreateCourseNoteInput,
  PublishCourseNoteInput,
} from '../course/notes.js';
import type {
  CourseRecognitionSnapshotDto,
  CourseAiSnapshotDto,
  AskCourseAiInput,
} from '../course/index.js';
import type {
  MasterySnapshotDto,
  RecordMasteryEvidenceInput,
  RecordWrongProblemInput,
  CorrectWrongProblemInput,
} from '../course/mastery.js';
export interface UniforgeApi {
  readonly health: () => Promise<HealthDto>;
  readonly appShell: () => Promise<AppShellResponseDto>;
  readonly settings: {
    readonly getSnapshot: () => Promise<SettingsSnapshotDto>;
    readonly updateModel: (input: UpdateModelSettingsInput) => Promise<SettingsSnapshotDto>;
  };
  readonly dashboard: {
    readonly getSnapshot: () => Promise<DashboardSnapshotDto>;
  };
  readonly course: {
    readonly getSnapshot: () => Promise<CourseSnapshotDto>;
    readonly create: (input: Omit<CreateCourseInput, 'context'>) => Promise<CourseSnapshotDto>;
    readonly materials: { readonly chooseAndImport: () => Promise<CourseMaterialSnapshotDto> };
    readonly recognition: {
      readonly getSnapshot: () => Promise<CourseRecognitionSnapshotDto>;
      readonly confirm: (proposalId: string) => Promise<CourseRecognitionSnapshotDto>;
    };
    readonly ai: {
      readonly getSnapshot: () => Promise<CourseAiSnapshotDto>;
      readonly ask: (input: Omit<AskCourseAiInput, 'context'>) => Promise<CourseAiSnapshotDto>;
    };
    readonly assignments: {
      readonly getSnapshot: () => Promise<AssignmentSnapshotDto>;
      readonly start: (
        input: Omit<StartAssignmentInput, 'context'>,
      ) => Promise<AssignmentSnapshotDto>;
    };
    readonly execution: {
      readonly getSnapshot: () => Promise<CourseExecutionSnapshotDto>;
      readonly start: (
        input: Omit<CourseExecutionRequest, 'courseId' | 'context'>,
      ) => Promise<CourseExecutionSnapshotDto>;
    };
    readonly notes: {
      readonly getSnapshot: () => Promise<CourseNotesSnapshotDto>;
      readonly createPersonal: (
        input: Omit<CreateCourseNoteInput, 'context'>,
      ) => Promise<CourseNotesSnapshotDto>;
      readonly createAiDraft: (
        input: Omit<CreateCourseNoteInput, 'context'>,
      ) => Promise<CourseNotesSnapshotDto>;
      readonly publishDraft: (
        input: Omit<PublishCourseNoteInput, 'context'>,
      ) => Promise<CourseNotesSnapshotDto>;
    };
    readonly mastery: {
      readonly getSnapshot: () => Promise<MasterySnapshotDto>;
      readonly recordEvidence: (
        input: Omit<RecordMasteryEvidenceInput, 'courseId' | 'context'>,
      ) => Promise<MasterySnapshotDto>;
      readonly recordWrongProblem: (
        input: Omit<RecordWrongProblemInput, 'courseId' | 'context'>,
      ) => Promise<MasterySnapshotDto>;
      readonly correctWrongProblem: (
        input: Omit<CorrectWrongProblemInput, 'courseId' | 'context'>,
      ) => Promise<MasterySnapshotDto>;
    };
  };
}
