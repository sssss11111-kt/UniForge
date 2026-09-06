export interface MockExamSection {
  id: string;
  name: string;
  maxScore: number;
}
export interface MockExamInstance {
  id: string;
  examSpaceId: string;
  sections: readonly MockExamSection[];
  status: 'READY' | 'IN_PROGRESS' | 'COMPLETED';
}
export interface MockExamResult {
  examId: string;
  rawScore: number;
  errorDimensions: readonly string[];
  aiEvaluation?: { modelVersion: string; confidence: number; text: string };
  scoreDisclaimer: string;
}
export interface CreateMockExamInput {
  id: string;
  examSpaceId: string;
  sections: readonly MockExamSection[];
  permissions: readonly string[];
}
export interface RecordMockExamResultInput extends MockExamResult {
  permissions: readonly string[];
}
