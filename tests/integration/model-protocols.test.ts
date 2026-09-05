import { describe, expect, it } from 'vitest';
import { anthropicMessages, openAICompatible } from '@uniforge/platform-model';
import type { ModelRoute } from '@uniforge/contracts';
const response = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
describe('model protocol adapters', () => {
  it('maps OpenAI-compatible chat completion shape', async () => {
    let init: RequestInit | undefined;
    const adapter = openAICompatible(
      {
        id: 'custom',
        provider: 'custom',
        model: 'm',
        endpoint: 'https://example.test/v1',
        capabilities: ['text'],
      },
      async (_url, request) => {
        init = request;
        return response({ choices: [{ message: { content: 'ok' } }], usage: { total_tokens: 2 } });
      },
    );
    expect(
      (await adapter.generate([{ role: 'user', content: 'hi' }], 10, new AbortController().signal))
        .text,
    ).toBe('ok');
    expect(JSON.parse(String(init?.body))).toMatchObject({ model: 'm', max_tokens: 10 });
  });
  it('maps Anthropic Messages system and content blocks', async () => {
    let init: RequestInit | undefined;
    const route: ModelRoute = {
      id: 'anthropic',
      provider: 'anthropic',
      model: 'claude',
      endpoint: 'https://example.test/messages',
      capabilities: ['text'],
    };
    const adapter = anthropicMessages(route, async (_url, request) => {
      init = request;
      return response({ content: [{ text: 'ok' }], usage: { input_tokens: 1 } });
    });
    expect(
      (
        await adapter.generate(
          [
            { role: 'system', content: 'rule' },
            { role: 'user', content: 'hi' },
          ],
          10,
          new AbortController().signal,
        )
      ).text,
    ).toBe('ok');
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: 'claude',
      system: 'rule',
      messages: [{ role: 'user', content: 'hi' }],
    });
  });
});
