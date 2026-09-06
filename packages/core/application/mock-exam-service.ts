import type {
  CreateMockExamInput,
  MockExamInstance,
  MockExamResult,
  RecordMockExamResultInput,
} from '@uniforge/contracts';
export class MockExamService {
  private readonly exams = new Map<string, MockExamInstance>();
  private readonly results = new Map<string, MockExamResult>();
  create(input: CreateMockExamInput): MockExamInstance {
    if (!input.permissions.includes('english:write'))
      throw new Error('Missing permission: english:write');
    if (!input.sections.length) throw new Error('Mock exam requires sections');
    const exam: MockExamInstance = {
      id: input.id,
      examSpaceId: input.examSpaceId,
      sections: input.sections.map((s) => ({ ...s })),
      status: 'READY',
    };
    this.exams.set(exam.id, exam);
    return { ...exam, sections: exam.sections.map((s) => ({ ...s })) };
  }
  recordResult(input: RecordMockExamResultInput): MockExamResult {
    if (!input.permissions.includes('english:write'))
      throw new Error('Missing permission: english:write');
    if (
      input.aiEvaluation &&
      (input.aiEvaluation.confidence < 0 || input.aiEvaluation.confidence > 1)
    )
      throw new Error('Invalid AI confidence');
    const result: MockExamResult = {
      examId: input.examId,
      rawScore: input.rawScore,
      errorDimensions: [...input.errorDimensions],
      ...(input.aiEvaluation ? { aiEvaluation: { ...input.aiEvaluation } } : {}),
      scoreDisclaimer: input.scoreDisclaimer,
    };
    this.results.set(input.examId, result);
    return { ...result, errorDimensions: [...result.errorDimensions] };
  }
  getResult(examId: string, permissions: readonly string[]): MockExamResult | null {
    if (!permissions.includes('english:read')) throw new Error('Missing permission: english:read');
    const r = this.results.get(examId);
    return r ? { ...r, errorDimensions: [...r.errorDimensions] } : null;
  }
}
