import { randomUUID } from 'node:crypto';
import type { Json, Result } from '@uniforge/contracts';
import { failure } from '@uniforge/contracts';
import { ProcessSupervisor } from './supervisor.js';
import { JsonLineTransport } from './transport.js';
import { SidecarRegistry, type SidecarManifest } from './registry.js';
import { SIDECAR_PROTOCOL_VERSION, type SidecarRequest } from './protocol.js';

export class SidecarHost {
  private readonly running = new Map<
    string,
    {
      child: ReturnType<ProcessSupervisor['spawn']>;
      transport: JsonLineTransport;
      manifest: SidecarManifest;
    }
  >();
  constructor(
    private readonly registry: SidecarRegistry,
    private readonly supervisor = new ProcessSupervisor(),
  ) {}
  async start(id: string, correlationId = randomUUID()): Promise<Result<Json>> {
    const m = this.registry.get(id);
    if (!m) return failure('NOT_FOUND', 'Sidecar not registered', correlationId);
    if (this.running.has(id)) return { ok: true, value: { status: 'running' } };
    const child = this.supervisor.spawn(m);
    const transport = new JsonLineTransport(child, m.maxMessageBytes);
    const entry = { child, transport, manifest: m };
    this.running.set(id, entry);
    child.once('close', () => {
      if (this.running.get(id) === entry) this.running.delete(id);
    });
    return this.call(id, 'start', {}, correlationId);
  }
  async stop(id: string, correlationId = randomUUID()): Promise<Result<Json>> {
    const r = this.running.get(id);
    if (!r) return { ok: true, value: { status: 'stopped' } };
    const result = await this.call(id, 'stop', {}, correlationId);
    await r.transport.close();
    this.running.delete(id);
    return result;
  }
  health(id: string, correlationId = randomUUID()): Promise<Result<Json>> {
    return this.call(id, 'health', {}, correlationId);
  }
  version(id: string, correlationId = randomUUID()): Promise<Result<Json>> {
    return this.call(id, 'version', {}, correlationId);
  }
  request(
    id: string,
    payload: Json,
    signal?: AbortSignal,
    correlationId = randomUUID(),
  ): Promise<Result<Json>> {
    return this.call(id, 'request', payload, correlationId, signal);
  }
  async cancel(id: string, requestId: string, correlationId = randomUUID()): Promise<Result<Json>> {
    return this.call(id, 'cancel', { requestId }, correlationId);
  }
  async shutdown(): Promise<void> {
    for (const id of [...this.running.keys()]) await this.stop(id);
  }
  private async call(
    id: string,
    method: SidecarRequest['method'],
    payload: Json,
    correlationId: string,
    signal?: AbortSignal,
  ): Promise<Result<Json>> {
    const r = this.running.get(id);
    if (!r) return failure('UNAVAILABLE', 'Sidecar is not running', correlationId);
    const requestId = randomUUID();
    const request: SidecarRequest = {
      protocolVersion: SIDECAR_PROTOCOL_VERSION,
      requestId,
      correlationId,
      method,
      deadline: new Date(Date.now() + r.manifest.timeoutMs).toISOString(),
      payload,
    };
    try {
      const response = await r.transport.send(request, r.manifest.timeoutMs, signal);
      return response.ok
        ? { ok: true, value: response.result ?? null }
        : failure(
            response.error?.code === 'TIMEOUT' ? 'TIMEOUT' : 'UNAVAILABLE',
            response.error?.message ?? 'Sidecar request failed',
            correlationId,
          );
    } catch (e) {
      return failure(
        signal?.aborted ? 'CANCELLED' : 'TIMEOUT',
        e instanceof Error ? e.message : 'Sidecar request failed',
        correlationId,
      );
    }
  }
}
