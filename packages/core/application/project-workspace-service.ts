import type { Project, ProjectWorkspace, RegisterProjectInput } from '@uniforge/contracts';
export class ProjectWorkspaceService {
  private readonly projects = new Map<string, Project>();
  private readonly workspaces = new Map<string, ProjectWorkspace>();
  register(input: RegisterProjectInput): Project {
    if (!input.permissions.includes('project:write'))
      throw new Error('Missing permission: project:write');
    if (!input.workspace.authorized) throw new Error('Workspace authorization required');
    const p = input.workspace.canonicalPath.toLowerCase();
    if (
      !p ||
      p.includes('..') ||
      p.includes('uniforge') ||
      p.includes('program files') ||
      p.includes('chatgpt')
    )
      throw new Error('Invalid workspace path');
    if (this.projects.has(input.project.id)) throw new Error('Project already exists');
    this.workspaces.set(input.workspace.id, { ...input.workspace });
    this.projects.set(input.project.id, { ...input.project });
    return { ...input.project };
  }
  getWorkspace(id: string, permissions: readonly string[]): ProjectWorkspace | null {
    if (!permissions.includes('project:read')) throw new Error('Missing permission: project:read');
    const w = this.workspaces.get(id);
    return w ? { ...w } : null;
  }
}
