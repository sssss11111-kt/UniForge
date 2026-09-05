import type { CommandReceipt } from '@uniforge/contracts/domain/commands.js';
import type { DatabaseHandle } from '../database.js';
type Row = Record<string, string | number | null>;
const text = (row: Row, key: string): string => String(row[key] ?? '');
export class CommandReceiptRepositorySqlite {
  constructor(private readonly handle: DatabaseHandle) {}
  async find(commandId: string): Promise<CommandReceipt | undefined> {
    const row = this.handle.db
      .prepare('SELECT * FROM command_receipts WHERE command_id = ?')
      .get(commandId) as Row | undefined;
    return row
      ? {
          commandId: text(row, 'command_id') as CommandReceipt['commandId'],
          entityId: text(row, 'entity_id') as CommandReceipt['entityId'],
          entityVersion: Number(row.entity_version ?? 0),
          eventIds: JSON.parse(text(row, 'event_ids')),
          occurredAt: text(row, 'completed_at') as CommandReceipt['occurredAt'],
        }
      : undefined;
  }
  async record(
    value: CommandReceipt & { workspaceId?: string; payloadHash?: string },
  ): Promise<void> {
    this.handle.db
      .prepare(
        'INSERT INTO command_receipts (command_id,workspace_id,payload_hash,entity_id,entity_version,event_ids,completed_at) VALUES (?,?,?,?,?,?,?)',
      )
      .run(
        value.commandId,
        value.workspaceId ?? 'system',
        value.payloadHash ?? '',
        value.entityId,
        value.entityVersion,
        JSON.stringify(value.eventIds),
        value.occurredAt,
      );
  }
}
export { CommandReceiptRepositorySqlite as CommandReceiptRepository };
