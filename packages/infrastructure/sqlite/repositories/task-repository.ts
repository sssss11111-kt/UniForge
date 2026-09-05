import type { Task } from '@uniforge/contracts/domain/entities.js';
import type { DatabaseHandle } from '../database.js';
export class TaskRepositorySqlite {
  constructor(private readonly handle: DatabaseHandle) {}
  async get(id: string): Promise<Task | undefined> {
    const row = this.handle.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      Record<string, unknown> | undefined;
    return row
      ? ({
          ...row,
          workspaceId: row.workspace_id,
          owner: { kind: row.owner_kind, id: row.owner_id },
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        } as Task)
      : undefined;
  }
  async save(value: Task): Promise<void> {
    this.handle.db
      .prepare(
        'INSERT INTO tasks (id,workspace_id,owner_kind,owner_id,title,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,status=excluded.status,version=excluded.version,updated_at=excluded.updated_at',
      )
      .run(
        value.id,
        value.workspaceId,
        value.owner.kind,
        value.owner.id,
        value.title,
        value.status,
        value.version,
        value.createdAt,
        value.updatedAt,
      );
  }
}
export { TaskRepositorySqlite as TaskRepository };
