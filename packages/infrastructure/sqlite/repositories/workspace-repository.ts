import type { Workspace } from '@uniforge/contracts/domain/entities.js';
import type { DatabaseHandle } from '../database.js';
export class WorkspaceRepositorySqlite {
  constructor(private readonly handle: DatabaseHandle) {}
  async get(id: string): Promise<Workspace | undefined> {
    const row = this.handle.db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id) as
      Record<string, unknown> | undefined;
    return row
      ? ({
          ...row,
          rootHandle: row.root_handle,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          workspaceId: row.id,
        } as Workspace)
      : undefined;
  }
  async save(value: Workspace): Promise<void> {
    this.handle.db
      .prepare(
        'INSERT INTO workspaces (id,name,root_handle,status,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,status=excluded.status,version=excluded.version,updated_at=excluded.updated_at',
      )
      .run(
        value.id,
        value.name,
        value.rootHandle,
        value.status,
        value.version,
        value.createdAt,
        value.updatedAt,
      );
  }
}
export { WorkspaceRepositorySqlite as WorkspaceRepository };
