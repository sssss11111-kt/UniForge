import type {
  ContentRelation,
  CreateRelationInput,
  CreateTopicInput,
  TopicLifecycle,
  TopicTombstone,
  Topic,
} from '@uniforge/contracts';
export class TopicRelationService {
  private readonly topics = new Map<string, Topic>();
  private readonly relations = new Map<string, ContentRelation>();
  private readonly contentIds = new Set<string>();

  /** Register a canonical ContentEntity id; the body remains owned by ContentService. */
  registerContent(id: string): void {
    if (!id.trim()) throw new Error('Content id is required');
    this.contentIds.add(id);
  }

  createTopic(input: CreateTopicInput): Topic {
    this.require(input.permissions, 'knowledge:write');
    if (!input.topic.name.trim()) throw new Error('Topic name is required');
    if (this.topics.has(input.topic.id)) throw new Error('Topic already exists');
    const t = { ...input.topic, lifecycle: input.topic.lifecycle ?? ('ACTIVE' as const) };
    this.topics.set(t.id, t);
    return { ...t };
  }
  createRelation(input: CreateRelationInput): ContentRelation {
    this.require(input.permissions, 'knowledge:write');
    if (input.relation.fromId === input.relation.toId)
      throw new Error('Self relation is not allowed');
    if (
      !this.hasActiveReference(input.relation.fromId) ||
      !this.hasActiveReference(input.relation.toId)
    )
      throw new Error('Reference not found');
    if (this.relations.has(input.relation.id)) throw new Error('Relation already exists');
    const r = { ...input.relation, createdAt: new Date().toISOString() };
    this.relations.set(r.id, r);
    return { ...r };
  }
  removeRelation(id: string, permissions: readonly string[]): void {
    this.require(permissions, 'knowledge:write');
    this.relations.delete(id);
  }

  getTopic(id: string, permissions: readonly string[]): Topic | null {
    this.require(permissions, 'knowledge:read');
    const topic = this.topics.get(id);
    if (!topic || topic.lifecycle === 'DELETED' || topic.lifecycle === 'FORGOTTEN') return null;
    return { ...topic };
  }

  archiveTopic(id: string, permissions: readonly string[]): Topic {
    return this.setLifecycle(id, 'ARCHIVED', permissions);
  }

  deleteTopic(id: string, permissions: readonly string[]): Topic {
    const topic = this.setLifecycle(id, 'DELETED', permissions);
    this.removeRelationsFor(id);
    return topic;
  }

  forgetTopic(id: string, permissions: readonly string[]): TopicTombstone {
    this.require(permissions, 'knowledge:write');
    if (!this.topics.has(id)) throw new Error('Topic not found');
    this.topics.set(id, { id, name: '', lifecycle: 'FORGOTTEN' });
    this.removeRelationsFor(id);
    return { id, lifecycle: 'FORGOTTEN' };
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

  private setLifecycle(
    id: string,
    lifecycle: TopicLifecycle,
    permissions: readonly string[],
  ): Topic {
    this.require(permissions, 'knowledge:write');
    const topic = this.topics.get(id);
    if (!topic) throw new Error('Topic not found');
    const next = { ...topic, lifecycle };
    this.topics.set(id, next);
    return { ...next };
  }

  private hasActiveReference(id: string): boolean {
    const topic = this.topics.get(id);
    return (
      this.contentIds.has(id) ||
      (topic !== undefined && topic.lifecycle !== 'DELETED' && topic.lifecycle !== 'FORGOTTEN')
    );
  }

  private removeRelationsFor(id: string): void {
    for (const [relationId, relation] of this.relations) {
      if (relation.fromId === id || relation.toId === id) this.relations.delete(relationId);
    }
  }
}
