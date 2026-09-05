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
  CourseRecognitionSnapshotDto,
  CourseAiSnapshotDto,
  AskCourseAiInput,
} from '../course/index.js';
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
  };
}
