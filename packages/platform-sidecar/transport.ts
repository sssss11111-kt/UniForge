import { once } from 'node:events';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { isSidecarResponse, type SidecarRequest, type SidecarResponse } from './protocol.js';

export class JsonLineTransport {
  private buffer = '';
  private readonly pending = new Map<
    string,
    { resolve: (r: SidecarResponse) => void; reject: (e: Error) => void }
  >();
  private closed = false;
  constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    private readonly maxBytes: number,
  ) {
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => this.consume(chunk));
    child.on('close', () => this.failPending());
  }
  private consume(chunk: string): void {
    this.buffer += chunk;
    if (Buffer.byteLength(this.buffer) > this.maxBytes) {
      this.closed = true;
      this.failPending();
      return;
    }
    let newline = this.buffer.indexOf('\n');
    while (newline >= 0) {
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      newline = this.buffer.indexOf('\n');
      try {
        const value: unknown = JSON.parse(line);
        if (isSidecarResponse(value)) this.pending.get(value.requestId)?.resolve(value);
        else this.failPending();
      } catch {
        this.failPending();
      }
    }
  }
  send(request: SidecarRequest, timeoutMs: number, signal?: AbortSignal): Promise<SidecarResponse> {
    if (this.closed || this.child.killed) return Promise.reject(new Error('transport closed'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(request.requestId);
        reject(new Error('sidecar timeout'));
      }, timeoutMs);
      const abort = () => {
        clearTimeout(timer);
        this.pending.delete(request.requestId);
        reject(new Error('sidecar cancelled'));
      };
      this.pending.set(request.requestId, {
        resolve: (response) => {
          clearTimeout(timer);
          signal?.removeEventListener('abort', abort);
          this.pending.delete(request.requestId);
          resolve(response);
        },
        reject,
      });
      signal?.addEventListener('abort', abort, { once: true });
      this.child.stdin.write(`${JSON.stringify(request)}\n`, (error) => {
        if (error) abort();
      });
    });
  }
  private failPending(): void {
    this.closed = true;
    for (const pending of this.pending.values()) pending.reject(new Error('sidecar exited'));
    this.pending.clear();
  }
  async close(): Promise<void> {
    if (!this.child.killed) {
      this.child.kill();
      await once(this.child, 'close').catch(() => undefined);
    }
  }
}
