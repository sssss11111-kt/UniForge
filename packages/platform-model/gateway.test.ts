import { describe, expect, it } from 'vitest';
import { ProviderNeutralModelGateway } from './gateway.js';
import { ModelRouter } from './router.js';
import type { Id, ModelRequest, ModelRoute, RequestContext } from '@uniforge/contracts';
const ctx: RequestContext = {
  actorId: 'actor_main' as Id<'actor'>,
  workspaceId: 'workspace_main' as Id<'workspace'>,
  correlationId: 'test',
};
const route: ModelRoute = {
  id: 'mock',
  provider: 'mock',
  model: 'mock-v1',
  capabilities: ['text'],
};
const request: ModelRequest = {
  purpose: 'test',
  messages: [{ role: 'user', content: 'hello' }],
  requiredCapabilities: ['text'],
  dataClass: 'PUBLIC',
  routeOverrides: { run: 'mock' },
  maxOutputTokens: 20,
  credentialRef: 'credential:test',
};
describe('ProviderNeutralModelGateway', () => {
  it('records unknown cost as null and supports cancellation', async () => {
    const gateway = new ProviderNeutralModelGateway(
      new ModelRouter(new Map([['mock', route]])),
      new Map([
        [
          'mock',
          {
            generate: async () => ({
              text: 'ok',
              provider: 'mock',
              model: 'mock-v1',
              usage: { inputTokens: 1 },
              cost: null,
              currency: null,
            }),
          },
        ],
      ]),
    );
    const output = await gateway.generate(request, ctx);
    expect(output).toMatchObject({ ok: true, value: { text: 'ok', cost: null, currency: null } });
    const controller = new AbortController();
    controller.abort();
    expect(await gateway.generate(request, ctx, controller.signal)).toMatchObject({
      ok: false,
      error: { code: 'CANCELLED' },
    });
  });
  it('rejects capability mismatch and missing credential', async () => {
    const gateway = new ProviderNeutralModelGateway(
      new ModelRouter(new Map([['mock', route]])),
      new Map([
        [
          'mock',
          {
            generate: async () => ({
              text: '',
              provider: 'mock',
              model: 'm',
              usage: {},
              cost: null,
              currency: null,
            }),
          },
        ],
      ]),
    );
    expect(
      await gateway.generate({ ...request, requiredCapabilities: ['vision'] }, ctx),
    ).toMatchObject({ ok: false, error: { code: 'CAPABILITY_MISMATCH' } });
    const withoutCredential = { ...request };
    delete withoutCredential.credentialRef;
    expect(await gateway.generate(withoutCredential, ctx)).toMatchObject({
      ok: false,
      error: { code: 'DENIED' },
    });
  });
});
