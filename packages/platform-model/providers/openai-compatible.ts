import type { Json, ModelMessage, ModelOutput, ModelRoute } from '@uniforge/contracts';
export interface ModelTransport {
  (url: string, init: RequestInit): Promise<Response>;
}
export function openAICompatible(
  route: ModelRoute,
  transport: ModelTransport = fetch,
): {
  generate(messages: ModelMessage[], maxTokens: number, signal: AbortSignal): Promise<ModelOutput>;
} {
  return {
    async generate(messages, maxTokens, signal) {
      const response = await transport(`${route.endpoint ?? ''}/chat/completions`, {
        method: 'POST',
        signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: route.model, messages, max_tokens: maxTokens }),
      });
      if (!response.ok) throw new Error(`provider returned ${response.status}`);
      const body = (await response.json()) as {
        usage?: Record<string, unknown>;
        choices?: Array<{ message?: { content?: string } }>;
      };
      const usage = body.usage ?? { inputTokens: null, outputTokens: null, totalTokens: null };
      return {
        text: body.choices?.[0]?.message?.content ?? '',
        provider: route.provider,
        model: route.model,
        usage: usage as unknown as Json,
        cost: null,
        currency: null,
      };
    },
  };
}
