import type { Json, ModelMessage, ModelOutput, ModelRoute } from '@uniforge/contracts';
import type { ModelTransport } from './openai-compatible.js';
export function anthropicMessages(route: ModelRoute, transport: ModelTransport = fetch) {
  return {
    async generate(
      messages: ModelMessage[],
      maxTokens: number,
      signal: AbortSignal,
    ): Promise<ModelOutput> {
      const system = messages
        .filter((m) => m.role === 'system')
        .map((m) => m.content)
        .join('\n');
      const response = await transport(route.endpoint ?? '', {
        method: 'POST',
        signal,
        headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: route.model,
          max_tokens: maxTokens,
          ...(system ? { system } : {}),
          messages: messages.filter((m) => m.role !== 'system'),
        }),
      });
      if (!response.ok) throw new Error(`provider returned ${response.status}`);
      const body = (await response.json()) as {
        content?: Array<{ text?: string }>;
        usage?: Record<string, unknown>;
      };
      return {
        text: body.content?.map((x) => x.text ?? '').join('') ?? '',
        provider: route.provider,
        model: route.model,
        usage: (body.usage ?? { input_tokens: null, output_tokens: null }) as unknown as Json,
        cost: null,
        currency: null,
      };
    },
  };
}
