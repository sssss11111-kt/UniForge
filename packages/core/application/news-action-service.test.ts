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

  it('creates typed action proposals with provenance and keeps them pending approval', () => {
    const s = new NewsActionService();
    const action = s.create({
      action: {
        id: 'task-1',
        newsEventId: 'event-1',
        type: 'TASK',
        description: 'Review the paper',
        evidenceIds: ['claim-1'],
        provenance: {
          sourceEventIds: ['source-1'],
          evidenceIds: ['claim-1'],
          recordedAt: '2026-09-08T00:00:00.000Z',
        },
        status: 'PROPOSED',
      },
      permissions: ['news:propose'],
    });

    expect(action.status).toBe('WAITING_APPROVAL');
    expect(action.type).toBe('TASK');
    expect(action.provenance?.sourceEventIds).toEqual(['source-1']);
  });

  it('requires approval before executing a typed external action and retains rejection', () => {
    const s = new NewsActionService();
    const action = s.create({
      action: {
        id: 'send-1',
        newsEventId: 'event-1',
        type: 'EXTERNAL_SEND',
        description: 'Share article',
        destination: 'team@example.test',
        evidenceIds: ['source-1'],
        provenance: {
          sourceEventIds: ['source-1'],
          evidenceIds: ['source-1'],
          recordedAt: '2026-09-08T00:00:00.000Z',
        },
        status: 'PROPOSED',
      },
      permissions: ['news:propose'],
    });

    expect(() => s.send(action.id, ['external:send'])).toThrow('approval');
    const rejected = s.reject({
      id: action.id,
      permissions: ['external:send'],
      reason: 'Destination is not authorized',
    });
    expect(rejected.status).toBe('REJECTED');
    expect(s.get(action.id, ['news:read'])).toMatchObject({
      status: 'REJECTED',
      rejectionReason: 'Destination is not authorized',
    });
  });

  it('records cancellation and execution failures without losing evidence', () => {
    const s = new NewsActionService();
    const action = s.create({
      action: {
        id: 'save-1',
        newsEventId: 'event-1',
        type: 'SAVE',
        description: 'Save for later',
        evidenceIds: ['source-1'],
        provenance: {
          sourceEventIds: ['source-1'],
          evidenceIds: ['source-1'],
          recordedAt: '2026-09-08T00:00:00.000Z',
        },
        status: 'PROPOSED',
      },
      permissions: ['news:propose'],
    });
    const cancelled = s.cancel(action.id, ['news:write'], 'No longer relevant');
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.evidenceIds).toEqual(['source-1']);

    const second = s.create({
      action: {
        ...action,
        id: 'save-2',
      },
      permissions: ['news:propose'],
    });
    const failed = s.fail(second.id, 'storage offline', ['news:write']);
    expect(failed).toMatchObject({ status: 'FAILED', error: 'storage offline' });
    expect(s.get(second.id, ['news:read'])?.provenance?.sourceEventIds).toEqual(['source-1']);
  });
});
