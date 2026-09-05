import { describe, expect, it } from 'vitest';
import { ModelRouter } from './router.js';
import type { ModelRequest, ModelRoute } from '@uniforge/contracts';
const request = (overrides: Partial<ModelRequest> = {}): ModelRequest => ({
  purpose: 'test',
  messages: [{ role: 'user', content: 'hello' }],
  requiredCapabilities: ['text'],
  dataClass: 'PUBLIC',
  routeOverrides: {},
  maxOutputTokens: 10,
  ...overrides,
});
const route = (id: string): ModelRoute => ({
  id,
  provider: id,
  model: 'm',
  capabilities: ['text'],
});
describe('ModelRouter', () => {
  it('uses the six-level precedence order', () => {
    const router = new ModelRouter(
      new Map(
        ['run', 'preset', 'owner', 'module', 'global', 'fallback'].map((id) => [id, route(id)]),
      ),
    );
    const first = router.resolve(
      request({
        routeOverrides: {
          run: 'run',
          preset: 'preset',
          owner: 'owner',
          module: 'module',
          global: 'global',
          fallback: 'fallback',
        },
      }),
    );
    const second = router.resolve(
      request({ routeOverrides: { preset: 'preset', global: 'global' } }),
    );
    expect(first).toMatchObject({ ok: true, value: { id: 'run' } });
    expect(second).toMatchObject({ ok: true, value: { id: 'preset' } });
  });
  it('does not silently fall back on a missing non-fallback route', () => {
    expect(
      new ModelRouter(new Map([['fallback', route('fallback')]])).resolve(
        request({ routeOverrides: { run: 'missing', fallback: 'fallback' } }),
      ),
    ).toMatchObject({ ok: false, error: { code: 'UNAVAILABLE' } });
  });
});
