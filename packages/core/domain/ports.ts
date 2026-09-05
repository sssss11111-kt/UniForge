import type {
  DomainCommand,
  CommandReceipt,
  DomainCommandBus,
} from '@uniforge/contracts/domain/commands.js';
import type { DomainEvent } from '@uniforge/contracts/domain/events.js';
import type { Task, Workspace } from '@uniforge/contracts/domain/entities.js';
import type { RequestContext, Result } from '@uniforge/contracts/domain/primitives.js';
export interface CommandReceiptRepository {
  record(receipt: CommandReceipt): Promise<void>;
  find(commandId: string): Promise<CommandReceipt | undefined>;
}
export interface TransactionContext {
  tasks: TaskRepository;
  workspaces: WorkspaceRepository;
  events: DomainEventStore;
  commandReceipts: CommandReceiptRepository;
}
export interface UnitOfWork {
  run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
export interface TaskRepository {
  get(id: string): Promise<Task | undefined>;
  save(task: Task): Promise<void>;
}
export interface WorkspaceRepository {
  get(id: string): Promise<Workspace | undefined>;
  save(workspace: Workspace): Promise<void>;
}
export interface DomainEventStore {
  append(events: readonly DomainEvent[]): Promise<void>;
}
export interface ApplicationCommandBus extends DomainCommandBus {
  execute(command: DomainCommand, context: RequestContext): Promise<Result<CommandReceipt>>;
}
