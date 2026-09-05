import { describe, expect, it } from 'vitest';
import type { ModelGateway, ModelOutput, RequestContext } from '@uniforge/contracts';
import {
  CourseAiService,
  type CourseAiApprovalPort,
  type CourseAiEvidencePort,
} from './course-ai-service.js';

const context = { actor: 'user' as const, permissions: ['course:read', 'model:use'] };
const modelOutput: ModelOutput = {
  text: 'Recursion solves a problem by calling itself on a smaller input.',
  provider: 'test',
  model: 'test-model',
  usage: { inputTokens: 10, outputTokens: 12 },
  cost: null,
  currency: null,
};
const model: ModelGateway = {
  generate: async () => ({ ok: true, value: modelOutput }),
  stream: async function* () {
    yield { type: 'done', output: modelOutput } as const;
  },
  embed: async () => ({
    ok: false,
    error: { code: 'UNAVAILABLE', message: 'unused', correlationId: 'test' },
  }),
  probeCapabilities: async () => ({ ok: true, value: ['text'] }),
  estimateUsage: () => ({
    ok: true,
    value: { inputTokens: 1, maxOutputTokens: 100, estimatedCost: null },
  }),
};
const evidence: CourseAiEvidencePort = {
  collect: async () => [
    {
      evidenceId: 'evidence-1' as never,
      category: 'COURSE_MATERIAL',
      materialId: 'material-1' as never,
      locator: 'page:2',
      label: 'lecture.pdf p.2',
      excerpt: 'Recursion is a function calling itself.',
    },
  ],
};
const approved: CourseAiApprovalPort = {
  request: async () => ({ status: 'APPROVED' as const, approvalId: 'approval-1' }),
};

describe('CourseAiService', () => {
  it('rejects requests without course read and model permissions', async () => {
    const service = new CourseAiService(model, evidence, approved);
    await expect(
      service.ask({
        proposalId: 'proposal-1' as never,
        courseId: 'course-1' as never,
        question: 'Explain recursion',
        context: { actor: 'user', permissions: [] },
      }),
    ).rejects.toThrow('PERMISSION_DENIED');
  });

  it('keeps a traceable proposal and waits for approval before model call', async () => {
    let calls = 0;
    const waiting: CourseAiApprovalPort = {
      request: async () => ({ status: 'PENDING', approvalId: 'approval-2' }),
    };
    const gateway = {
      ...model,
      generate: async (...args: Parameters<ModelGateway['generate']>) => {
        calls += 1;
        return model.generate(...args);
      },
    } as ModelGateway;
    const service = new CourseAiService(gateway, evidence, waiting);
    const result = await service.ask({
      proposalId: 'proposal-2' as never,
      courseId: 'course-1' as never,
      question: 'Explain recursion',
      context,
    });
    expect(result.status).toBe('WAITING_APPROVAL');
    expect(result.approvalId).toBe('approval-2');
    expect(result.evidence[0]?.locator).toBe('page:2');
    expect(calls).toBe(0);
  });

  it('calls the gateway after approval and records source categories without credentials', async () => {
    let request: Parameters<ModelGateway['generate']>[0] | undefined;
    const gateway = {
      ...model,
      generate: async (input: Parameters<ModelGateway['generate']>[0], ctx: RequestContext) => {
        request = input;
        expect(ctx.actorId).toBe('actor-user');
        return model.generate(input, ctx);
      },
    } as ModelGateway;
    const service = new CourseAiService(gateway, evidence, approved);
    const result = await service.ask({
      proposalId: 'proposal-3' as never,
      courseId: 'course-1' as never,
      question: 'Explain recursion',
      context,
    });
    expect(result.status).toBe('COMPLETED');
    expect(result.answer).toBe(modelOutput.text);
    expect(result.sourceCategories).toEqual(['COURSE_MATERIAL']);
    expect(request?.credentialRef).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain('key');
  });

  it('records model failure and does not claim success', async () => {
    const failed: ModelGateway = {
      ...model,
      generate: async () => ({
        ok: false,
        error: { code: 'UNAVAILABLE', message: 'provider offline', correlationId: 'c' },
      }),
    };
    const service = new CourseAiService(failed, evidence, approved);
    const result = await service.ask({
      proposalId: 'proposal-4' as never,
      courseId: 'course-1' as never,
      question: 'Explain recursion',
      context,
    });
    expect(result.status).toBe('FAILED');
    expect(result.error).toBe('provider offline');
    expect(result.answer).toBeUndefined();
  });
});
