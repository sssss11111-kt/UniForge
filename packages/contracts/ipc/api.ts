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
import type { ReviewPlanSnapshotDto, CreateReviewPlanInput } from '../course/exam-review.js';
import type { AgentCenterSnapshotDto, CreateAgentRunInput } from '../agent/center.js';
import type { Id } from '../domain/primitives.js';
import type { VoiceRequest, VoiceSnapshotDto } from '../voice/index.js';
import type { KnowledgeWorkspaceSnapshot } from '../knowledge/workspace.js';
import type { NewsWorkspaceSnapshot } from '../news/workspace.js';
import type { ProjectWorkspaceSnapshot } from '../project/workspace-snapshot.js';
import type {
  BackupCreateInput,
  BackupSnapshotDto,
  RecycleSnapshotDto,
  ExitRequestDto,
  ExitDecisionDto,
} from '../lifecycle/index.js';
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
    readonly reviewPlan: {
      readonly getSnapshot: () => Promise<ReviewPlanSnapshotDto>;
      readonly create: (
        input: Omit<CreateReviewPlanInput, 'courseId' | 'context'>,
      ) => Promise<ReviewPlanSnapshotDto>;
    };
  };
  readonly agentCenter: {
    readonly getSnapshot: () => Promise<AgentCenterSnapshotDto>;
    readonly create: (input: CreateAgentRunInput) => Promise<AgentCenterSnapshotDto>;
    readonly start: (runId: Id<'agent-run'>) => Promise<AgentCenterSnapshotDto>;
    readonly resolveApproval: (runId: Id<'agent-run'>) => Promise<AgentCenterSnapshotDto>;
    readonly rejectApproval: (input: {
      runId: Id<'agent-run'>;
      reason: string;
    }) => Promise<AgentCenterSnapshotDto>;
    readonly cancel: (input: {
      runId: Id<'agent-run'>;
      reason?: string;
    }) => Promise<AgentCenterSnapshotDto>;
  };
  readonly voice: {
    readonly getSnapshot: () => Promise<VoiceSnapshotDto>;
    readonly execute: (input: Omit<VoiceRequest, 'context'>) => Promise<VoiceSnapshotDto>;
    readonly cancel: (requestId: string) => Promise<VoiceSnapshotDto>;
  };
  readonly knowledge: { readonly getSnapshot: () => Promise<KnowledgeWorkspaceSnapshot> };
  readonly news: { readonly getSnapshot: () => Promise<NewsWorkspaceSnapshot> };
  readonly project: { readonly getSnapshot: () => Promise<ProjectWorkspaceSnapshot> };
  readonly backup: {
    readonly create: (input: BackupCreateInput) => Promise<BackupSnapshotDto>;
    readonly validate: (source: string) => Promise<BackupSnapshotDto>;
  };
  readonly recycle: {
    readonly list: () => Promise<RecycleSnapshotDto>;
    readonly restore: (id: string) => Promise<RecycleSnapshotDto>;
  };
  readonly exit: {
    readonly request: (input: ExitRequestDto) => Promise<ExitDecisionDto>;
    readonly shutdown: () => Promise<{
      failures: readonly { participant: string; message: string }[];
    }>;
  };
}
