import type { AppShellDto } from '../app-shell/navigation.js';
import type { DashboardSnapshotDto } from '../dashboard/index.js';
import type {
  CourseAiSnapshotDto,
  CourseMaterialSnapshotDto,
  CourseSnapshotDto,
  AssignmentSnapshotDto,
} from '../course/index.js';
import type { AgentCenterSnapshotDto } from '../agent/center.js';
import type { VoiceSnapshotDto } from '../voice/index.js';

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
  courseMasterySnapshot: 'uniforge:course-mastery-snapshot',
  courseMasteryEvidenceRecord: 'uniforge:course-mastery-evidence-record',
  courseWrongProblemRecord: 'uniforge:course-wrong-problem-record',
  courseWrongProblemCorrect: 'uniforge:course-wrong-problem-correct',
  courseReviewPlanSnapshot: 'uniforge:course-review-plan-snapshot',
  courseReviewPlanCreate: 'uniforge:course-review-plan-create',
  agentCenterSnapshot: 'uniforge:agent-center-snapshot',
  agentCenterCreate: 'uniforge:agent-center-create',
  agentCenterStart: 'uniforge:agent-center-start',
  agentCenterApprovalResolve: 'uniforge:agent-center-approval-resolve',
  agentCenterApprovalReject: 'uniforge:agent-center-approval-reject',
  agentCenterCancel: 'uniforge:agent-center-cancel',
  voiceSnapshot: 'uniforge:voice-snapshot',
  voiceExecute: 'uniforge:voice-execute',
  voiceCancel: 'uniforge:voice-cancel',
  backupCreate: 'uniforge:backup-create',
  backupValidate: 'uniforge:backup-validate',
  recycleList: 'uniforge:recycle-list',
  recycleRestore: 'uniforge:recycle-restore',
  exitRequest: 'uniforge:exit-request',
  exitShutdown: 'uniforge:exit-shutdown',
  knowledgeWorkspaceSnapshot: 'uniforge:knowledge-workspace-snapshot',
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
export type CourseMasteryResponseDto = import('../course/mastery.js').MasterySnapshotDto;
export type CourseExamReviewResponseDto = import('../course/exam-review.js').ReviewPlanSnapshotDto;
export type AgentCenterResponseDto = AgentCenterSnapshotDto;
export type VoiceResponseDto = VoiceSnapshotDto;
export type BackupResponseDto = import('../lifecycle/index.js').BackupSnapshotDto;
export type RecycleResponseDto = import('../lifecycle/index.js').RecycleSnapshotDto;
export type ExitResponseDto = import('../lifecycle/index.js').ExitDecisionDto;
export type KnowledgeWorkspaceResponseDto = import('../knowledge/workspace.js').KnowledgeWorkspaceSnapshot;
