export type ProjectOperation = 'BUILD' | 'TEST' | 'RUN';
export type ProjectExecutionStatus =
  'PENDING_APPROVAL' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export interface ProjectExecution {
  id: string;
  projectId: string;
  workspaceId: string;
  operation: ProjectOperation;
  command: string;
  status: ProjectExecutionStatus;
  output?: string;
  error?: string;
}
export interface StartProjectExecutionInput {
  execution: ProjectExecution;
  permissions: readonly string[];
}
