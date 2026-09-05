import type { Id, Instant, RequestContext, Result } from './primitives.js';
import type { OwnerRef } from './entities.js';
export type DomainCommand =
  | { type: 'workspace.create'; commandId: Id<'command'>; name: string; rootHandle: string }
  | {
      type: 'task.create';
      commandId: Id<'command'>;
      title: string;
      owner: { kind: 'workspace'; id: Id<'workspace'> };
    }
  | { type: 'task.complete'; commandId: Id<'command'>; taskId: Id<'task'>; expectedVersion: number }
  | {
      type: 'artifact.register';
      commandId: Id<'command'>;
      fileHandle: string;
      sha256: string;
      kind: string;
    }
  | {
      type: 'approval.resolve';
      commandId: Id<'command'>;
      approvalId: Id<'approval'>;
      decision: 'APPROVED' | 'DENIED';
    };
export interface CommandReceipt {
  commandId: Id<'command'>;
  entityId: Id<string>;
  entityVersion: number;
  eventIds: Id<'event'>[];
  occurredAt: Instant;
}
export interface DomainCommandBus {
  execute(command: DomainCommand, context: RequestContext): Promise<Result<CommandReceipt>>;
}
export interface CreateTaskInput {
  commandId: Id<'command'>;
  title: string;
  owner: { kind: 'workspace'; id: Id<'workspace'> };
}
export function createTaskCommand(input: CreateTaskInput): Result<DomainCommand> {
  return input.title.trim()
    ? { ok: true, value: { type: 'task.create', ...input } }
    : {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Task title is required',
          correlationId: 'contracts',
        },
      };
}
export type { OwnerRef };
