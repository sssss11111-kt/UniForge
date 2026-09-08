import { describe, expect, it } from 'vitest';
import { TopicRelationService } from './topic-relation-service.js';
describe('TopicRelationService', () => {
  it('removes only the edge and keeps canonical topic/content ids', () => {
    const s = new TopicRelationService();
    s.createTopic({ topic: { id: 't', name: 'Topic' }, permissions: ['knowledge:write'] });
    s.registerContent('c');
    const r = s.createRelation({
      relation: { id: 'r', fromId: 'c', toId: 't', relationType: 'TOPIC' },
      permissions: ['knowledge:write'],
    });
    expect(r).toMatchObject({ fromId: 'c', toId: 't' });
    expect(r).not.toHaveProperty('body');
    expect(s.listRelations('t', ['knowledge:read'])).toHaveLength(1);
    s.removeRelation(r.id, ['knowledge:write']);
    expect(s.listRelations('t', ['knowledge:read'])).toEqual([]);
    expect(s.getTopic('t', ['knowledge:read'])?.name).toBe('Topic');
  });

  it('keeps archive and delete distinct from removing a relation', () => {
    const s = new TopicRelationService();
    s.createTopic({ topic: { id: 't', name: 'Topic' }, permissions: ['knowledge:write'] });
    expect(s.archiveTopic('t', ['knowledge:write']).lifecycle).toBe('ARCHIVED');
    expect(s.getTopic('t', ['knowledge:read'])?.lifecycle).toBe('ARCHIVED');
    expect(s.deleteTopic('t', ['knowledge:write']).lifecycle).toBe('DELETED');
    expect(s.getTopic('t', ['knowledge:read'])).toBeNull();
  });

  it('forgets a topic by retaining only a tombstone and invalidating its edges', () => {
    const s = new TopicRelationService();
    s.createTopic({
      topic: { id: 't', name: 'Topic', description: 'private' },
      permissions: ['knowledge:write'],
    });
    s.registerContent('c');
    s.createRelation({
      relation: { id: 'r', fromId: 'c', toId: 't', relationType: 'TOPIC' },
      permissions: ['knowledge:write'],
    });
    const forgotten = s.forgetTopic('t', ['knowledge:write']);
    expect(forgotten).toEqual({ id: 't', lifecycle: 'FORGOTTEN' });
    expect(s.listRelations('t', ['knowledge:read'])).toEqual([]);
  });

  it('rejects relations whose endpoints are not registered canonical objects', () => {
    const s = new TopicRelationService();
    s.createTopic({ topic: { id: 't', name: 'Topic' }, permissions: ['knowledge:write'] });
    expect(() =>
      s.createRelation({
        relation: { id: 'r', fromId: 'missing-content', toId: 't', relationType: 'TOPIC' },
        permissions: ['knowledge:write'],
      }),
    ).toThrow('Reference not found');
  });
  it('fails closed and rejects self links', () => {
    const s = new TopicRelationService();
    expect(() => s.createTopic({ topic: { id: 't', name: 'x' }, permissions: [] })).toThrow(
      'knowledge:write',
    );
    expect(() =>
      s.createRelation({
        relation: { id: 'r', fromId: 'a', toId: 'a', relationType: 'RELATED' },
        permissions: ['knowledge:write'],
      }),
    ).toThrow('Self');
  });

  it('requires write permission for every lifecycle mutation and read for retrieval', () => {
    const s = new TopicRelationService();
    s.createTopic({ topic: { id: 't', name: 'x' }, permissions: ['knowledge:write'] });
    expect(() => s.archiveTopic('t', [])).toThrow('knowledge:write');
    expect(() => s.deleteTopic('t', [])).toThrow('knowledge:write');
    expect(() => s.forgetTopic('t', [])).toThrow('knowledge:write');
    expect(() => s.getTopic('t', [])).toThrow('knowledge:read');
  });
});
