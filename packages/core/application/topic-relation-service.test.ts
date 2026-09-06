import { describe, expect, it } from 'vitest';
import { TopicRelationService } from './topic-relation-service.js';
describe('TopicRelationService', () => {
  it('creates topics and relations and removes only the relation', () => {
    const s = new TopicRelationService();
    s.createTopic({ topic: { id: 't', name: 'Topic' }, permissions: ['knowledge:write'] });
    const r = s.createRelation({
      relation: { id: 'r', fromId: 'c', toId: 't', relationType: 'TOPIC' },
      permissions: ['knowledge:write'],
    });
    expect(s.listRelations('t', ['knowledge:read'])).toHaveLength(1);
    s.removeRelation(r.id, ['knowledge:write']);
    expect(s.listRelations('t', ['knowledge:read'])).toEqual([]);
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
});
