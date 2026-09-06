export const IELTS_SECTIONS = ['overview','plan','vocabulary','listening','reading','writing','speaking','mock-exam','materials','ai-coach'] as const;
export type IeltsSection = typeof IELTS_SECTIONS[number];
export interface IeltsWorkspaceSnapshot { status: 'ready'; sections: readonly IeltsSection[]; restrictedContentIncluded: false; }
export interface IeltsWorkspaceInput { actor: 'user' | 'agent'; permissions: readonly string[]; }
