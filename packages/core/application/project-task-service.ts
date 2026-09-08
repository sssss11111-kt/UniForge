import type { CreateProjectTaskInput, ProjectTask, ProjectTaskSnapshot } from '@uniforge/contracts';
export class ProjectTaskService {
  private readonly tasks = new Map<string, ProjectTask>();
  create(input: CreateProjectTaskInput): ProjectTask {
    if (!input.permissions.includes('project:write'))
      throw new Error('Missing permission: project:write');
    if (this.tasks.has(input.task.id)) throw new Error('Task already exists');
    const t = { ...input.task, dependsOn: [...input.task.dependsOn], status: 'TODO' as const };
    this.tasks.set(t.id, t);
    return { ...t, dependsOn: [...t.dependsOn] };
  }
  updateStatus(
    id: string,
    status: ProjectTask['status'],
    permissions: readonly string[],
  ): ProjectTask {
    if (!permissions.includes('project:write'))
      throw new Error('Missing permission: project:write');
    const t = this.tasks.get(id);
    if (!t) throw new Error('Task not found');
    const u = { ...t, status };
    this.tasks.set(id, u);
    return { ...u, dependsOn: [...u.dependsOn] };
  }
  get(id: string, permissions: readonly string[]): ProjectTask | null {
    if (!permissions.includes('project:read')) throw new Error('Missing permission: project:read');
    const t = this.tasks.get(id);
    return t ? { ...t, dependsOn: [...t.dependsOn] } : null;
  }
  getSnapshot(permissions: readonly string[]): ProjectTaskSnapshot {
    if (!permissions.includes('project:read')) throw new Error('Missing permission: project:read');
    const tasks = [...this.tasks.values()].map((task) => ({
      ...task,
      dependsOn: [...task.dependsOn],
    }));
    return { status: tasks.length ? 'READY' : 'EMPTY', tasks };
  }
}
