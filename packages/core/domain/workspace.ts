import type { Workspace } from '@uniforge/contracts/domain/entities.js';
export function isWorkspaceOwner(workspace: Workspace, subjectId: string): boolean {
  return workspace.id === subjectId;
}
