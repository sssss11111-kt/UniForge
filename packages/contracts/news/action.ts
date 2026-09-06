export type NewsActionStatus = 'PROPOSED' | 'WAITING_APPROVAL' | 'SENT' | 'FAILED' | 'CANCELLED';
export interface NewsAction { id:string; newsEventId:string; description:string; destination?:string; evidenceIds:readonly string[]; status:NewsActionStatus; error?:string; }
export interface CreateNewsActionInput { action:NewsAction; permissions:readonly string[]; }
