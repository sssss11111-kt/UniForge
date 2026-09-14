import type {
  AdaptiveTrainingProposal,
  AdaptiveTrainingSnapshot,
  ProposeAdaptiveTrainingInput,
  TrainingExerciseType,
} from '@uniforge/contracts/english/training.js';
import type { LearningDimension } from '@uniforge/contracts/english/learning-dimensions.js';

export interface TrainingApprovalPort {
  request(input: {
    trainingId: string;
    vocabularyEntryId: string;
    dimension: LearningDimension;
  }): Promise<{ status: 'APPROVED' | 'PENDING' | 'DENIED'; approvalId?: string }>;
}

const exerciseTypes: Record<LearningDimension, TrainingExerciseType> = {
  MEANING: 'meaning recognition',
  SPELLING: 'spelling',
  LISTENING: 'listening discrimination',
  PRONUNCIATION: 'pronunciation',
  PART_OF_SPEECH: 'part of speech',
  MORPHOLOGY: 'morphology',
  COLLOCATION: 'contextual collocation',
  CONTEXT: 'context',
  SECONDARY_SENSE: 'secondary sense',
};

export class AdaptiveTrainingService {
  private readonly proposals: AdaptiveTrainingProposal[] = [];

  public constructor(
    private readonly approval: TrainingApprovalPort,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async propose(input: ProposeAdaptiveTrainingInput): Promise<AdaptiveTrainingProposal> {
    this.validate(input);
    const dimension = this.weakestDimension(input.snapshot);
    const decision = await this.approval.request({
      trainingId: input.trainingId.trim(),
      vocabularyEntryId: input.snapshot.vocabularyEntryId.trim(),
      dimension,
    });
    const approvalId = input.approvalId ?? decision.approvalId;
    const waiting = decision.status === 'PENDING' && !input.approvalId;
    const denied = decision.status === 'DENIED';
    const proposal: AdaptiveTrainingProposal = {
      trainingId: input.trainingId.trim(),
      vocabularyEntryId: input.snapshot.vocabularyEntryId.trim(),
      dimension,
      exerciseType: exerciseTypes[dimension],
      rationale: `Weakest learning dimension is ${dimension}; targeted practice was selected.`,
      labels: ['AI Generated'],
      aiGenerated: true,
      status: denied ? 'DENIED' : waiting ? 'WAITING_APPROVAL' : 'PUBLISHED',
      durable: !waiting && !denied,
      createdAt: this.clock(),
      ...(approvalId ? { approvalId } : {}),
    };
    this.proposals.push(proposal);
    return structuredClone(proposal);
  }

  async getSnapshot(vocabularyEntryId: string): Promise<AdaptiveTrainingSnapshot> {
    const id = vocabularyEntryId.trim();
    if (!id) throw new Error('INVALID_INPUT');
    return {
      vocabularyEntryId: id,
      items: structuredClone(this.proposals.filter((p) => p.vocabularyEntryId === id)),
    };
  }

  private weakestDimension(snapshot: ProposeAdaptiveTrainingInput['snapshot']): LearningDimension {
    const dimensions = Object.values(snapshot.dimensions);
    return dimensions
      .slice()
      .sort(
        (a, b) =>
          (a.score ?? 0) - (b.score ?? 0) ||
          b.errors - a.errors ||
          a.dimension.localeCompare(b.dimension),
      )[0]!.dimension;
  }

  private validate(input: ProposeAdaptiveTrainingInput): void {
    if (!input.trainingId.trim() || !input.snapshot.vocabularyEntryId.trim())
      throw new Error('INVALID_INPUT');
    if (
      input.context.actor !== 'user' ||
      !input.context.permissions.includes('english:training:write')
    )
      throw new Error('PERMISSION_DENIED');
  }
}
