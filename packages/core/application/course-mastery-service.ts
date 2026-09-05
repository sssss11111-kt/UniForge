import type {
  CorrectWrongProblemInput,
  MasteryEvidence,
  MasterySnapshotDto,
  RecordMasteryEvidenceInput,
  RecordWrongProblemInput,
  WrongProblem,
} from '@uniforge/contracts/course/mastery.js';
import { parseInstant } from '@uniforge/contracts/domain/primitives.js';

export class CourseMasteryService {
  private readonly evidence: MasteryEvidence[] = [];
  private readonly wrongProblems: WrongProblem[] = [];

  async getSnapshot(courseId: MasterySnapshotDto['courseId']): Promise<MasterySnapshotDto> {
    const evidence = this.evidence.filter((item) => item.courseId === courseId);
    const mastery = [...new Set(evidence.map((item) => item.conceptRef))].map((conceptRef) => {
      const items = evidence.filter((item) => item.conceptRef === conceptRef);
      return {
        conceptRef,
        score: Number((items.reduce((sum, item) => sum + item.value, 0) / items.length).toFixed(3)),
        evidenceIds: items.map((item) => item.id),
      };
    });
    return {
      courseId,
      state:
        evidence.length ||
        this.wrongProblems.some((item) => !item.courseId || item.courseId === courseId)
          ? 'READY'
          : 'EMPTY',
      mastery,
      evidence,
      wrongProblems: this.wrongProblems.filter(
        (item) => !item.courseId || item.courseId === courseId,
      ),
    };
  }

  async recordEvidence(input: RecordMasteryEvidenceInput): Promise<MasteryEvidence> {
    this.assertWrite(input.context.permissions);
    this.assertProvenance(input.provenance);
    if (
      !input.conceptRef.trim() ||
      !Number.isFinite(input.value) ||
      input.value < 0 ||
      input.value > 1 ||
      !this.isEvidenceKind(input.kind)
    )
      throw new Error('INVALID_INPUT');
    const item: MasteryEvidence = {
      id: input.evidenceId,
      courseId: input.courseId,
      conceptRef: input.conceptRef.trim(),
      kind: input.kind,
      value: input.value,
      provenance: input.provenance,
    };
    this.evidence.push(item);
    return item;
  }

  async recordWrongProblem(input: RecordWrongProblemInput): Promise<WrongProblem> {
    this.assertWrite(input.context.permissions);
    this.assertProvenance(input.provenance);
    if (
      !input.problemRef.trim() ||
      !this.isClassification(input.classification) ||
      !['USER', 'AI', 'SYSTEM'].includes(input.classificationSource)
    )
      throw new Error('INVALID_INPUT');
    const now = new Date().toISOString() as WrongProblem['createdAt'];
    const item: WrongProblem = {
      id: input.problemId,
      ...(input.courseId ? { courseId: input.courseId } : {}),
      problemRef: input.problemRef.trim(),
      status: 'OPEN',
      classification: input.classification,
      classificationSource: input.classificationSource,
      ...(input.note?.trim() ? { note: input.note.trim() } : {}),
      provenance: [input.provenance],
      createdAt: now,
      updatedAt: now,
    };
    this.wrongProblems.push(item);
    return item;
  }

  async correctWrongProblem(input: CorrectWrongProblemInput): Promise<WrongProblem> {
    this.assertWrite(input.context.permissions);
    const index = this.wrongProblems.findIndex(
      (item) => item.id === input.problemId && item.courseId === input.courseId,
    );
    if (index < 0) throw new Error('NOT_FOUND');
    const current = this.wrongProblems[index]!;
    const corrected: WrongProblem = {
      ...current,
      status: 'CORRECTED',
      classification: input.classification,
      classificationSource: 'USER',
      correction: {
        classification: input.classification,
        correctedAt: new Date().toISOString() as WrongProblem['updatedAt'],
        actor: 'USER',
      },
      updatedAt: new Date().toISOString() as WrongProblem['updatedAt'],
    };
    this.wrongProblems[index] = corrected;
    return corrected;
  }

  private assertWrite(permissions: readonly string[]): void {
    if (
      !permissions.includes('course:mastery:write') &&
      !permissions.includes('course:wrong-problems:write')
    )
      throw new Error('PERMISSION_DENIED');
  }

  private assertProvenance(provenance: {
    recordedAt: string;
    source: { referenceId: string };
  }): void {
    if (!parseInstant(provenance.recordedAt).ok || !provenance.source.referenceId.trim())
      throw new Error('INVALID_INPUT');
  }

  private isEvidenceKind(value: string): boolean {
    return [
      'RECENT_PRACTICE',
      'ACCURACY',
      'HINTS',
      'FORGETTING',
      'SELF_ASSESSMENT',
      'MOCK_RESULT',
    ].includes(value);
  }

  private isClassification(value: string): boolean {
    return ['CONCEPT_GAP', 'CALCULATION', 'MISREAD', 'CARELESS', 'UNKNOWN'].includes(value);
  }
}
