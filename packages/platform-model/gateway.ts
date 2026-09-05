import {
  failure,
  type ModelCapability,
  type ModelChunk,
  type ModelGateway as GatewayContract,
  type ModelOutput,
  type ModelRequest,
  type ModelRoute,
  type RequestContext,
  type Result,
} from '@uniforge/contracts';
import { BudgetLedger } from './budget.js';
import { ModelRouter } from './router.js';
import { openAICompatible } from './providers/openai-compatible.js';
import { anthropicMessages } from './providers/anthropic-messages.js';

export type ModelProvider = {
  generate(
    messages: ModelRequest['messages'],
    maxTokens: number,
    signal: AbortSignal,
  ): Promise<ModelOutput>;
};
export class ProviderNeutralModelGateway implements GatewayContract {
  constructor(
    private readonly router: ModelRouter,
    private readonly providers: ReadonlyMap<string, ModelProvider>,
    private readonly budget = new BudgetLedger(),
  ) {}
  estimateUsage(
    request: ModelRequest,
  ): Result<{ inputTokens: number | null; maxOutputTokens: number; estimatedCost: number | null }> {
    const input = request.messages.reduce((n, m) => n + m.content.length, 0);
    const route = this.router.resolve(request);
    const cost =
      route.ok && route.value.costPer1kInput !== undefined
        ? (input / 4 / 1000) * route.value.costPer1kInput
        : null;
    return {
      ok: true,
      value: {
        inputTokens: Math.ceil(input / 4),
        maxOutputTokens: request.maxOutputTokens,
        estimatedCost: cost,
      },
    };
  }
  async generate(
    request: ModelRequest,
    context: RequestContext,
    signal = new AbortController().signal,
  ): Promise<Result<ModelOutput>> {
    if (signal.aborted)
      return failure('CANCELLED', 'Model request cancelled', context.correlationId);
    const resolved = this.router.resolve(request);
    if (!resolved.ok)
      return { ...resolved, error: { ...resolved.error, correlationId: context.correlationId } };
    const route = resolved.value;
    if (!this.router.supports(route, request.requiredCapabilities))
      return failure(
        'CAPABILITY_MISMATCH',
        'Model route lacks required capabilities',
        context.correlationId,
      );
    const provider = this.providers.get(route.id);
    if (!provider)
      return failure(
        'UNAVAILABLE',
        `Provider ${route.provider} is unavailable`,
        context.correlationId,
      );
    if (!route.credentialRef && request.credentialRef === undefined)
      return failure('DENIED', 'Model credential is missing', context.correlationId);
    const estimate = this.estimateUsage(request);
    const reservation = this.budget.reserve(
      estimate.ok && estimate.value.estimatedCost !== null ? estimate.value.estimatedCost : 0,
    );
    if (!reservation.ok)
      return {
        ...reservation,
        error: { ...reservation.error, correlationId: context.correlationId },
      };
    try {
      const output = await provider.generate(request.messages, request.maxOutputTokens, signal);
      reservation.value(output.cost ?? undefined);
      return {
        ok: true,
        value: { ...output, cost: output.cost ?? null, currency: output.currency ?? null },
      };
    } catch (error) {
      reservation.value();
      return failure(
        signal.aborted ? 'CANCELLED' : 'UNAVAILABLE',
        error instanceof Error ? error.message : 'Model request failed',
        context.correlationId,
      );
    }
  }
  async *stream(
    request: ModelRequest,
    context: RequestContext,
    signal = new AbortController().signal,
  ): AsyncIterable<ModelChunk> {
    try {
      const result = await this.generate(request, context, signal);
      if (result.ok) {
        yield { type: 'delta', text: result.value.text };
        yield { type: 'done', output: result.value };
      } else yield { type: 'error', error: result.error };
    } catch (error) {
      yield {
        type: 'error',
        error: { message: error instanceof Error ? error.message : 'Model stream failed' },
      };
    }
  }
  async embed(
    _texts: string[],
    _request: ModelRequest,
    context: RequestContext,
    signal = new AbortController().signal,
  ): Promise<Result<number[][]>> {
    return signal.aborted
      ? failure('CANCELLED', 'Embedding request cancelled', context.correlationId)
      : failure(
          'CAPABILITY_MISMATCH',
          'Embedding provider is not configured',
          context.correlationId,
        );
  }
  async probeCapabilities(
    routeId: string,
    context: RequestContext,
  ): Promise<Result<ModelCapability[]>> {
    const route = this.router.get(routeId);
    return route
      ? { ok: true, value: route.capabilities }
      : failure('NOT_FOUND', 'Model route not found', context.correlationId);
  }
}
export function createProvider(route: ModelRoute) {
  return route.provider === 'anthropic' ? anthropicMessages(route) : openAICompatible(route);
}
