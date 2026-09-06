import type {
  LearningDimension,
  LearningDimensionEvidence,
  LearningDimensionProvenance,
  LearningDimensionSnapshot,
  LearningDimensionSummary,
  RecordLearningDimensionEvidenceInput,
} from '@uniforge/contracts/english/learning-dimensions.js';
import { LEARNING_DIMENSIONS } from '@uniforge/contracts/english/learning-dimensions.js';
import { parseInstant } from '@uniforge/contracts/domain/primitives.js';

export interface LearningDimensionPermission {
  canWrite: boolean;
}

export class LearningDimensionService {
  private readonly evidence: LearningDimensionEvidence[] = [];
  private readonly entries = new Set<string>();

  constructor(
    private readonly permission: LearningDimensionPermission = { canWrite: true },
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  recordEvidence(input: RecordLearningDimensionEvidenceInput): LearningDimensionEvidence {
    this.assertWrite(input.context.permissions);
    this.validate(input);
    if (this.evidence.some((item) => item.id === input.evidenceId))
      throw new Error('learning dimension evidence already exists');
    const score = input.score ?? (input.outcome === 'CORRECT' ? 1 : 0);
    const item: LearningDimensionEvidence = {
      id: input.evidenceId.trim(),
      vocabularyEntryId: input.vocabularyEntryId.trim(),
      dimension: input.dimension,
      outcome: input.outcome,
      score,
      provenance: structuredClone(input.provenance),
      recordedAt: this.clock(),
    };
    this.entries.add(item.vocabularyEntryId);
    this.evidence.push(item);
    return structuredClone(item);
  }

  recordError(
    vocabularyEntryId: string,
    dimension: LearningDimension,
    provenance: LearningDimensionProvenance,
    context: RecordLearningDimensionEvidenceInput['context'],
  ): LearningDimensionEvidence {
    return this.recordEvidence({
      evidenceId: `dimension-evidence-${this.evidence.length + 1}`,
      vocabularyEntryId,
      dimension,
      outcome: 'INCORRECT',
      provenance,
      context,
    });
  }

  getSnapshot(vocabularyEntryId: string): LearningDimensionSnapshot {
    const id = vocabularyEntryId.trim();
    if (!this.entries.has(id)) throw new Error('vocabulary entry not found');
    const evidence = this.evidence.filter((item) => item.vocabularyEntryId === id);
    const dimensions = Object.fromEntries(
      LEARNING_DIMENSIONS.map((dimension) => {
        const items = evidence.filter((item) => item.dimension === dimension);
        const summary: LearningDimensionSummary = {
          dimension,
          attempts: items.length,
          correct: items.filter((item) => item.outcome === 'CORRECT').length,
          errors: items.filter((item) => item.outcome === 'INCORRECT').length,
          score: items.length
            ? Number((items.reduce((total, item) => total + item.score, 0) / items.length).toFixed(3))
            : null,
          evidenceIds: items.map((item) => item.id),
        };
        return [dimension, summary];
      }),
    ) as Record<LearningDimension, LearningDimensionSummary>;
    return {
      vocabularyEntryId: id,
      status: evidence.length ? 'ready' : 'empty',
      dimensions,
      evidence: structuredClone(evidence),
    };
  }

  private assertWrite(permissions: readonly string[]): void {
    if (!this.permission.canWrite || !permissions.includes('learning-dimension:write'))
      throw new Error('permission denied: learning-dimension:write');
  }

  private validate(input: RecordLearningDimensionEvidenceInput): void {
    if (!input.evidenceId.trim() || !input.vocabularyEntryId.trim())
      throw new Error('learning dimension ids are required');
    if (!LEARNING_DIMENSIONS.includes(input.dimension)) throw new Error('invalid learning dimension');
    if (!['CORRECT', 'INCORRECT'].includes(input.outcome)) throw new Error('invalid learning dimension outcome');
    if (input.score !== undefined && (!Number.isFinite(input.score) || input.score < 0 || input.score > 1))
      throw new Error('learning dimension score must be between 0 and 1');
    if (!parseInstant(input.provenance.recordedAt).ok || !input.provenance.source.sourceId.trim())
      throw new Error('invalid learning dimension provenance');
  }
}
