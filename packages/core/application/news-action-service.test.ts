import { describe, expect, it } from 'vitest';
import { NewsActionService } from './news-action-service.js';
describe('NewsActionService', () => {
  it('keeps external action pending until approved', () => {
    const s = new NewsActionService();
    const a = s.create({
      action: {
        id: 'a',
        newsEventId: 'n',
        description: 'notify',
        destination: 'user',
        evidenceIds: ['c'],
        status: 'PROPOSED',
      },
      permissions: ['news:propose'],
    });
    expect(a.status).toBe('WAITING_APPROVAL');
    expect(s.send(a.id, ['external:send']).status).toBe('SENT');
  });
  it('fails closed without evidence or send permission', () => {
    const s = new NewsActionService();
    expect(() =>
      s.create({
        action: {
          id: 'a',
          newsEventId: 'n',
          description: 'x',
          evidenceIds: [],
          status: 'PROPOSED',
        },
        permissions: ['news:propose'],
      }),
    ).toThrow('Evidence');
    expect(() => s.send('a', [])).toThrow('external:send');
  });
});
