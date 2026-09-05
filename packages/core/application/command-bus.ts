import type { DomainCommand } from '@uniforge/contracts/domain/commands.js';
import type { CommandHandler } from '../domain/ports.js';
import type { Result } from '../errors/result.js';
export class CommandBus {
  private readonly handlers = new Map<DomainCommand['kind'], CommandHandler>();
  register(kind: DomainCommand['kind'], handler: CommandHandler): void {
    this.handlers.set(kind, handler);
  }
  async dispatch(command: DomainCommand): Promise<Result<unknown>> {
    const handler = this.handlers.get(command.kind);
    if (!handler)
      return { ok: false, error: { code: 'NOT_FOUND', message: `No handler for ${command.kind}` } };
    return { ok: true, value: await handler.handle(command) };
  }
}
