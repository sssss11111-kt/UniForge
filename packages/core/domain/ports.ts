import type { DomainCommand } from '@uniforge/contracts/domain/commands.js';
import type { DomainEvent } from '@uniforge/contracts/domain/events.js';
import type { Task, Workspace } from '@uniforge/contracts/domain/entities.js';
export interface UnitOfWork {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
export interface TaskRepository {
  get(id: string): Promise<Task | undefined>;
  save(task: Task, unit: UnitOfWork): Promise<void>;
}
export interface WorkspaceRepository {
  get(id: string): Promise<Workspace | undefined>;
  save(workspace: Workspace, unit: UnitOfWork): Promise<void>;
}
export interface DomainEventStore {
  append(events: readonly DomainEvent[], unit: UnitOfWork): Promise<void>;
}
export interface CommandHandler<C extends DomainCommand = DomainCommand, R = unknown> {
  handle(command: C): Promise<R>;
}
