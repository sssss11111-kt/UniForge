import { describe, expect, it } from 'vitest';
import type { LearningDimensionSnapshot } from '@uniforge/contracts/english/learning-dimensions.js';
import { AdaptiveTrainingService, type TrainingApprovalPort } from './adaptive-training-service.js';

const snapshot: LearningDimensionSnapshot = {
  vocabularyEntryId: 'vocabulary-1',
  status: 'ready',
  evidence: [],
  dimensions: {
    MEANING: {
      dimension: 'MEANING',
      attempts: 3,
      correct: 0,
      errors: 3,
      score: 0,
      evidenceIds: [],
    },
    SPELLING: {
      dimension: 'SPELLING',
      attempts: 1,
      correct: 1,
      errors: 0,
      score: 1,
      evidenceIds: [],
    },
    LISTENING: {
      dimension: 'LISTENING',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
    PRONUNCIATION: {
      dimension: 'PRONUNCIATION',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
    PART_OF_SPEECH: {
      dimension: 'PART_OF_SPEECH',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
    MORPHOLOGY: {
      dimension: 'MORPHOLOGY',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
    COLLOCATION: {
      dimension: 'COLLOCATION',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
    CONTEXT: {
      dimension: 'CONTEXT',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
    SECONDARY_SENSE: {
      dimension: 'SECONDARY_SENSE',
      attempts: 0,
      correct: 0,
      errors: 0,
      score: null,
      evidenceIds: [],
    },
  },
};

const context = { actor: 'user' as const, permissions: ['english:training:write'] };

describe('AdaptiveTrainingService', () => {
  it('maps the weakest dimension to an explainable AI generated training proposal', async () => {
    const approval: TrainingApprovalPort = {
      request: async () => ({ status: 'PENDING', approvalId: 'approval-1' }),
    };
    const service = new AdaptiveTrainingService(approval, () => '2026-09-06T00:00:00.000Z');
    const proposal = await service.propose({ trainingId: 'training-1', snapshot, context });
    expect(proposal.status).toBe('WAITING_APPROVAL');
    expect(proposal.approvalId).toBe('approval-1');
    expect(proposal.dimension).toBe('MEANING');
    expect(proposal.exerciseType).toBe('meaning recognition');
    expect(proposal.labels).toContain('AI Generated');
    expect(proposal.durable).toBe(false);
  });

  it('publishes only after approval and keeps denied proposals visible', async () => {
    const denied: TrainingApprovalPort = {
      request: async () => ({ status: 'DENIED', approvalId: 'approval-2' }),
    };
    const service = new AdaptiveTrainingService(denied);
    const proposal = await service.propose({ trainingId: 'training-2', snapshot, context });
    expect(proposal.status).toBe('DENIED');
    expect(proposal.durable).toBe(false);
    expect((await service.getSnapshot('vocabulary-1')).items).toHaveLength(1);
  });

  it('rejects missing permission and invalid training input', async () => {
    const service = new AdaptiveTrainingService({
      request: async () => ({ status: 'APPROVED' as const }),
    });
    await expect(
      service.propose({
        trainingId: 'training-3',
        snapshot,
        context: { actor: 'user', permissions: [] },
      }),
    ).rejects.toThrow('PERMISSION_DENIED');
    await expect(service.propose({ trainingId: '', snapshot, context })).rejects.toThrow(
      'INVALID_INPUT',
    );
  });
});
