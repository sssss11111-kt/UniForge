import { describe, expect, it } from 'vitest';
import { ProjectTaskService } from './project-task-service.js';
describe('ProjectTaskService', () => {
  it('creates tasks with dependencies and updates visible status', () => {
    const s = new ProjectTaskService();
    s.create({
      task: {
        id: 't',
        projectId: 'p',
        goalId: 'g',
        title: 'build',
        status: 'DONE',
        dependsOn: ['t0'],
        requiresApproval: true,
      },
      permissions: ['project:write'],
    });
    expect(s.updateStatus('t', 'IN_PROGRESS', ['project:write']).status).toBe('IN_PROGRESS');
  });
  it('fails closed', () => {
    const s = new ProjectTaskService();
    expect(() => s.get('x', [])).toThrow('project:read');
    expect(() => s.getSnapshot([])).toThrow('project:read');
  });
  it('returns an honest empty or ready task snapshot', () => {
    const s = new ProjectTaskService();
    expect(s.getSnapshot(['project:read'])).toEqual({ status: 'EMPTY', tasks: [] });
    s.create({
      task: {
        id: 't',
        projectId: 'p',
        goalId: 'g',
        title: 'build',
        status: 'TODO',
        dependsOn: [],
        requiresApproval: false,
      },
      permissions: ['project:write'],
    });
    expect(s.getSnapshot(['project:read'])).toMatchObject({
      status: 'READY',
      tasks: [{ id: 't' }],
    });
  });
});
