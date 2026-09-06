import type {
  ContentRelation,
  CreateRelationInput,
  CreateTopicInput,
  Topic,
} from '@uniforge/contracts';
export class TopicRelationService {
  private readonly topics = new Map<string, Topic>();
  private readonly relations = new Map<string, ContentRelation>();
  createTopic(input: CreateTopicInput): Topic {
    this.require(input.permissions, 'knowledge:write');
    if (!input.topic.name.trim()) throw new Error('Topic name is required');
    if (this.topics.has(input.topic.id)) throw new Error('Topic already exists');
    const t = { ...input.topic };
    this.topics.set(t.id, t);
    return { ...t };
  }
  createRelation(input: CreateRelationInput): ContentRelation {
    this.require(input.permissions, 'knowledge:write');
    if (input.relation.fromId === input.relation.toId)
      throw new Error('Self relation is not allowed');
    if (this.relations.has(input.relation.id)) throw new Error('Relation already exists');
    const r = { ...input.relation, createdAt: new Date().toISOString() };
    this.relations.set(r.id, r);
    return { ...r };
  }
  removeRelation(id: string, permissions: readonly string[]): void {
    this.require(permissions, 'knowledge:write');
    this.relations.delete(id);
  }
  listRelations(id: string, permissions: readonly string[]): ContentRelation[] {
    this.require(permissions, 'knowledge:read');
    return [...this.relations.values()]
      .filter((r) => r.fromId === id || r.toId === id)
      .map((r) => ({ ...r }));
  }
  private require(p: readonly string[], needed: string) {
    if (!p.includes(needed)) throw new Error(`Missing permission: ${needed}`);
  }
}
