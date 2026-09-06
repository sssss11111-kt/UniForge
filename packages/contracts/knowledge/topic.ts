export type RelationType = 'TOPIC' | 'RELATED' | 'DERIVED_FROM' | 'SUPPORTS';
export interface Topic { id: string; name: string; description?: string; }
export interface ContentRelation { id: string; fromId: string; toId: string; relationType: RelationType; createdAt: string; }
export interface CreateTopicInput { topic: Topic; permissions: readonly string[]; }
export interface CreateRelationInput { relation: Omit<ContentRelation, 'createdAt'>; permissions: readonly string[]; }
