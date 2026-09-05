import type {
  DomainCommand,
  CommandReceipt,
  DomainCommandBus,
} from '@uniforge/contracts/domain/commands.js';
import type { RequestContext, Result } from '@uniforge/contracts/domain/primitives.js';
export class CommandBus implements DomainCommandBus {
  async execute(command: DomainCommand, context: RequestContext): Promise<Result<CommandReceipt>> {
    if (!context.correlationId)
      return {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Correlation ID is required',
          correlationId: 'command-bus',
        },
      };
    return {
      ok: false,
      error: {
        code: 'UNAVAILABLE',
        message: `No handler for ${command.type}`,
        correlationId: context.correlationId,
      },
    };
  }
}
