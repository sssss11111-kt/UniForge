import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { redactSecrets } from './redact.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  context?: Record<string, unknown>;
}

export class StructuredLogger {
  constructor(private readonly file?: string) {}

  async write(
    level: LogLevel,
    event: string,
    context: Record<string, unknown> = {},
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      context: redactSecrets(context) as Record<string, unknown>,
    };
    const line = `${JSON.stringify(entry)}\n`;
    if (this.file) {
      await mkdir(dirname(this.file), { recursive: true });
      await appendFile(this.file, line, 'utf8');
    }
  }

  debug(event: string, context?: Record<string, unknown>) {
    return this.write('debug', event, context);
  }
  info(event: string, context?: Record<string, unknown>) {
    return this.write('info', event, context);
  }
  warn(event: string, context?: Record<string, unknown>) {
    return this.write('warn', event, context);
  }
  error(event: string, context?: Record<string, unknown>) {
    return this.write('error', event, context);
  }

  async crash(error: unknown, context: Record<string, unknown> = {}): Promise<void> {
    const detail =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error };
    await this.error('process.crash', { ...context, ...detail });
  }
}
