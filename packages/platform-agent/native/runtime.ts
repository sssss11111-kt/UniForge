import type { ModelGateway, ModelRequest, ModelOutput } from '@uniforge/contracts/model/gateway.js';
export interface NativeRuntime {
  execute(request: ModelRequest, signal?: AbortSignal): Promise<ModelOutput>;
}
export class NativeRuntimeService implements NativeRuntime {
  constructor(private readonly gateway: ModelGateway) {}
  async execute(request: ModelRequest, signal?: AbortSignal): Promise<ModelOutput> {
    if (signal?.aborted) throw new Error('CANCELLED');
    const r = await this.gateway.generate(
      request,
      { actorId: 'native', workspaceId: 'native', correlationId: 'native' } as never,
      signal,
    );
    if (!r.ok) throw new Error(r.error.code);
    return r.value;
  }
}
