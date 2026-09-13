import { describe, expect, it } from 'vitest';
import { ProjectWorkspaceService } from './project-workspace-service.js';
describe('ProjectWorkspaceService', () => {
  it('registers only explicitly authorized workspaces', () => {
    const s = new ProjectWorkspaceService();
    const p = s.register({
      project: { id: 'p', name: 'Demo', workspaceId: 'w', repository: 'git://demo' },
      workspace: { id: 'w', projectId: 'p', canonicalPath: 'C:/Projects/Demo', authorized: true },
      permissions: ['project:write'],
    });
    expect(p.workspaceId).toBe('w');
    expect(s.getWorkspace('w', ['project:read'])?.authorized).toBe(true);
  });
  it('rejects unauthorized or traversal paths', () => {
    const s = new ProjectWorkspaceService();
    expect(() =>
      s.register({
        project: { id: 'p', name: 'x', workspaceId: 'w' },
        workspace: { id: 'w', projectId: 'p', canonicalPath: '../x', authorized: true },
        permissions: ['project:write'],
      }),
    ).toThrow('path');
  });
});
