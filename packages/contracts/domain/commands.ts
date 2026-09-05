import { parseEntityId, parseIsoUtc, type EntityId, type IsoUtc } from './primitives.js';
import type { Workspace } from './entities.js';
import type { Result, DomainValidationError } from './primitives.js';
export interface CreateTaskCommand {
  kind: 'task.create';
  taskId: EntityId;
  workspaceId: EntityId;
  title: string;
  requestedAt: IsoUtc;
}
export interface CompleteTaskCommand {
  kind: 'task.complete';
  taskId: EntityId;
  expectedVersion: number;
  requestedAt: IsoUtc;
}
export interface CreateWorkspaceCommand {
  kind: 'workspace.create';
  workspaceId: EntityId;
  name: string;
  workspaceKind: Workspace['kind'];
  requestedAt: IsoUtc;
}
export type DomainCommand = CreateTaskCommand | CompleteTaskCommand | CreateWorkspaceCommand;
export function createTaskCommand(
  input: Omit<CreateTaskCommand, 'kind'>,
): Result<CreateTaskCommand, DomainValidationError> {
  if (!parseEntityId(input.taskId).ok || !parseEntityId(input.workspaceId).ok)
    return {
      ok: false,
      error: { code: 'INVALID_ID', message: 'Task and workspace IDs are invalid' },
    };
  if (!parseIsoUtc(input.requestedAt).ok)
    return {
      ok: false,
      error: { code: 'INVALID_UTC', message: 'requestedAt must be canonical UTC' },
    };
  if (!input.title.trim())
    return { ok: false, error: { code: 'INVALID_INPUT', message: 'Task title is required' } };
  return { ok: true, value: { kind: 'task.create', ...input } };
}
