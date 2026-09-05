import type { Artifact } from '@uniforge/contracts/domain/entities.js';
import type { DatabaseHandle } from '../database.js';
type Row = Record<string, string | number | null>;
const text = (row: Row, key: string): string => String(row[key] ?? '');
const number = (row: Row, key: string): number => Number(row[key] ?? 0);
export class ArtifactRepositorySqlite {
  constructor(private readonly handle: DatabaseHandle) {}
  async get(id: string): Promise<Artifact | undefined> {
    const row = this.handle.db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as
      Row | undefined;
    return row
      ? ({
          id: text(row, 'id') as Artifact['id'],
          workspaceId: text(row, 'workspace_id') as Artifact['workspaceId'],
          ...(row.run_id ? { runId: text(row, 'run_id') as Artifact['runId'] } : {}),
          managedFileId: text(row, 'managed_file_id') as Artifact['managedFileId'],
          kind: text(row, 'kind'),
          sha256: text(row, 'sha256'),
          version: number(row, 'version'),
          createdAt: text(row, 'created_at') as Artifact['createdAt'],
          updatedAt: text(row, 'created_at') as Artifact['updatedAt'],
        } as Artifact)
      : undefined;
  }
  async save(value: Artifact): Promise<void> {
    this.handle.db
      .prepare(
        'INSERT INTO artifacts (id,workspace_id,run_id,managed_file_id,kind,sha256,created_at,version) VALUES (?,?,?,?,?,?,?,?)',
      )
      .run(
        value.id,
        value.workspaceId,
        value.runId ?? null,
        value.managedFileId,
        value.kind,
        value.sha256,
        value.createdAt,
        value.version,
      );
  }
}
export { ArtifactRepositorySqlite as ArtifactRepository };
