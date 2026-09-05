import type { AppShellResponseDto, HealthDto } from './dto.js';
import type { SettingsSnapshotDto, UpdateModelSettingsInput } from '../settings/index.js';
import type { DashboardSnapshotDto } from '../dashboard/index.js';
import type {
  CourseMaterialSnapshotDto,
  CourseSnapshotDto,
  CreateCourseInput,
} from '../course/index.js';
import type { CourseRecognitionSnapshotDto } from '../course/index.js';
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
  };
}
