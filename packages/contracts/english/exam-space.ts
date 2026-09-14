export type ExamType = 'CET4' | 'CET6' | 'IELTS' | 'Custom';
export interface ExamRuleSet {
  examType: ExamType;
  label: string;
  version: string;
}
export interface ExamSpace {
  id: string;
  name: string;
  examType: ExamType;
  ruleSet: ExamRuleSet;
  examDate?: string;
  createdAt: string;
}
export interface CreateExamSpaceInput {
  name: string;
  examType: ExamType;
  examDate?: string;
}
export interface ExamSpaceSnapshot {
  spaces: ExamSpace[];
  status: 'ready' | 'empty';
}
