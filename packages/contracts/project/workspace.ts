export interface ProjectWorkspace {
  id: string;
  projectId: string;
  canonicalPath: string;
  authorized: boolean;
}
export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  repository?: string;
}
export interface RegisterProjectInput {
  project: Project;
  workspace: ProjectWorkspace;
  permissions: readonly string[];
}
