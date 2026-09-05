import type { AppShellDto } from '../app-shell/navigation.js';
import type { DashboardSnapshotDto } from '../dashboard/index.js';
import type {
  CourseAiSnapshotDto,
  CourseMaterialSnapshotDto,
  CourseSnapshotDto,
  AssignmentSnapshotDto,
} from '../course/index.js';

export const IPC_CHANNELS = Object.freeze({
  health: 'uniforge:health',
  appShell: 'uniforge:app-shell',
  settingsSnapshot: 'uniforge:settings-snapshot',
  settingsUpdateModel: 'uniforge:settings-update-model',
  dashboardSnapshot: 'uniforge:dashboard-snapshot',
  courseSnapshot: 'uniforge:course-snapshot',
  courseCreate: 'uniforge:course-create',
  courseMaterialImport: 'uniforge:course-material-import',
  courseRecognitionSnapshot: 'uniforge:course-recognition-snapshot',
  courseRecognitionConfirm: 'uniforge:course-recognition-confirm',
  courseAiSnapshot: 'uniforge:course-ai-snapshot',
  courseAiAsk: 'uniforge:course-ai-ask',
  assignmentSnapshot: 'uniforge:assignment-snapshot',
  assignmentStart: 'uniforge:assignment-start',
  courseExecutionSnapshot: 'uniforge:course-execution-snapshot',
  courseExecutionStart: 'uniforge:course-execution-start',
  courseNotesSnapshot: 'uniforge:course-notes-snapshot',
  courseNotePersonalCreate: 'uniforge:course-note-personal-create',
  courseNoteAiDraftCreate: 'uniforge:course-note-ai-draft-create',
  courseNoteDraftPublish: 'uniforge:course-note-draft-publish',
} as const);
export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
export interface HealthDto {
  readonly ok: true;
  readonly version: string;
}

export type AppShellResponseDto = AppShellDto;
export type DashboardResponseDto = DashboardSnapshotDto;
export type CourseResponseDto = CourseSnapshotDto;
export type CourseMaterialResponseDto = CourseMaterialSnapshotDto;
export type CourseAiResponseDto = CourseAiSnapshotDto;
export type AssignmentResponseDto = AssignmentSnapshotDto;
export type CourseNotesResponseDto = import('../course/notes.js').CourseNotesSnapshotDto;
