export type ProjectTaskStatus =
  'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'FAILED' | 'CANCELLED';
export interface ProjectGoal {
  id: string;
  projectId: string;
  title: string;
  successCriteria: string;
}
export interface ProjectTask {
  id: string;
  projectId: string;
  goalId: string;
  title: string;
  status: ProjectTaskStatus;
  dependsOn: readonly string[];
  requiresApproval: boolean;
}
export interface CreateProjectTaskInput {
  task: ProjectTask;
  permissions: readonly string[];
}

export interface ProjectTaskSnapshot {
  status: 'READY' | 'EMPTY';
  tasks: readonly ProjectTask[];
}
