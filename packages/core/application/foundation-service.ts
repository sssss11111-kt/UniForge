import type { CommandReceipt, DomainCommand } from '@uniforge/contracts/domain/commands.js';
import type { DomainEvent } from '@uniforge/contracts/domain/events.js';
import type { RequestContext, Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';
import { completeTask } from '../domain/task.js';
import type { UnitOfWork } from '../domain/ports.js';

export class FoundationService {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  async execute(command: DomainCommand, context: RequestContext): Promise<Result<CommandReceipt>> {
    return this.unitOfWork.run(async (tx) => {
      const prior = await tx.commandReceipts.find(command.commandId);
      if (prior) return { ok: true, value: prior };
      const now = new Date().toISOString() as never;
      let entityId: string;
      let entityVersion = 1;
      const events: DomainEvent[] = [];
      if (command.type === 'workspace.create') {
        entityId = command.commandId;
        await tx.workspaces.save({
          id: entityId as never,
          workspaceId: entityId as never,
          name: command.name,
          rootHandle: command.rootHandle,
          status: 'ACTIVE',
          version: 1,
          createdAt: now,
          updatedAt: now,
        });
        events.push({
          type: 'workspace.created',
          eventId: `${command.commandId}_event` as never,
          occurredAt: now,
          aggregateId: entityId as never,
          aggregateVersion: 1,
          name: command.name,
        });
      } else if (command.type === 'task.create') {
        entityId = command.commandId;
        await tx.tasks.save({
          id: entityId as never,
          workspaceId: context.workspaceId,
          title: command.title,
          status: 'CREATED',
          owner: command.owner,
          version: 1,
          createdAt: now,
          updatedAt: now,
        });
        events.push({
          type: 'task.created',
          eventId: `${command.commandId}_event` as never,
          occurredAt: now,
          aggregateId: entityId as never,
          aggregateVersion: 1,
          workspaceId: context.workspaceId as never,
          title: command.title,
        });
      } else if (command.type === 'task.complete') {
        const task = await tx.tasks.get(command.taskId);
        if (!task) return failure('NOT_FOUND', 'Task not found', context.correlationId);
        const result = completeTask(task, command.expectedVersion, now);
        if (!result.ok) return result;
        await tx.tasks.save(result.value);
        entityId = task.id;
        entityVersion = result.value.version;
        events.push({
          type: 'task.completed',
          eventId: `${command.commandId}_event` as never,
          occurredAt: now,
          aggregateId: task.id as never,
          aggregateVersion: entityVersion,
        });
      } else
        return failure(
          'UNAVAILABLE',
          'Foundation command is not implemented',
          context.correlationId,
        );
      await tx.events.append(events);
      const receipt: CommandReceipt = {
        commandId: command.commandId,
        entityId: entityId as never,
        entityVersion,
        eventIds: events.map((event) => event.eventId as never),
        occurredAt: now,
      };
      await tx.commandReceipts.record(receipt);
      return { ok: true, value: receipt };
    });
  }
}
