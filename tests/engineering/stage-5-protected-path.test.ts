import { describe, expect, it } from 'vitest';
import { ProjectWorkspaceService } from '../../packages/core/application/project-workspace-service.js';
describe('Stage 5 protected-path gate', () => {
  it('rejects traversal and protected UniForge paths', () => {
    const s = new ProjectWorkspaceService();
    for (const canonicalPath of [
      '../uniforge',
      'C:/Program Files/UniForge',
      'C:/Users/Tong/Documents/ChatGPT/New project',
    ]) {
      expect(() =>
        s.register({
          project: { id: canonicalPath, name: 'x', workspaceId: canonicalPath },
          workspace: {
            id: canonicalPath,
            projectId: canonicalPath,
            canonicalPath,
            authorized: true,
          },
          permissions: ['project:write'],
        }),
      ).toThrow();
    }
  });
  it('requires explicit authorization and write permission', () => {
    const s = new ProjectWorkspaceService();
    expect(() =>
      s.register({
        project: { id: 'p', name: 'x', workspaceId: 'w' },
        workspace: { id: 'w', projectId: 'p', canonicalPath: 'C:/Projects/x', authorized: false },
        permissions: ['project:write'],
      }),
    ).toThrow('authorization');
    expect(() =>
      s.register({
        project: { id: 'p', name: 'x', workspaceId: 'w' },
        workspace: { id: 'w', projectId: 'p', canonicalPath: 'C:/Projects/x', authorized: true },
        permissions: [],
      }),
    ).toThrow('project:write');
  });
});
