import type {
  CreateExamSpaceInput,
  ExamSpace,
  ExamSpaceSnapshot,
  ExamRuleSet,
} from '@uniforge/contracts/english/exam-space.js';
export interface ExamSpacePermission {
  canWrite: boolean;
}
export class ExamSpaceService {
  private readonly spaces: ExamSpace[] = [];
  constructor(private readonly permission: ExamSpacePermission = { canWrite: true }) {}
  getSnapshot(): ExamSpaceSnapshot {
    return {
      spaces: this.spaces.map((s) => ({ ...s, ruleSet: { ...s.ruleSet } })),
      status: this.spaces.length ? 'ready' : 'empty',
    };
  }
  create(input: CreateExamSpaceInput): ExamSpace {
    if (!this.permission.canWrite) throw new Error('permission denied: exam-space:write');
    if (!input.name.trim()) throw new Error('exam space name is required');
    const ruleSet: ExamRuleSet = { examType: input.examType, label: input.examType, version: 'v1' };
    const space: ExamSpace = {
      id: `exam-${this.spaces.length + 1}`,
      name: input.name.trim(),
      examType: input.examType,
      ruleSet,
      createdAt: new Date().toISOString(),
    };
    if (input.examDate) space.examDate = input.examDate;
    this.spaces.push(space);
    return { ...space, ruleSet: { ...ruleSet } };
  }
}
