import { describe, expect, it } from 'vitest';
import { NewsClaimService } from './news-claim-service.js';
describe('NewsClaimService', () => {
  it('labels AI claims and gates approval', () => {
    const s = new NewsClaimService();
    const c = s.create({
      claim: {
        id: 'c',
        newsEventId: 'n',
        text: 'claim',
        citations: [{ newsEventId: 'n', quote: 'q' }],
        generatedBy: 'AI',
        label: 'AI Generated',
        status: 'APPROVED',
      },
      permissions: ['news:propose'],
    });
    expect(c.status).toBe('PENDING');
    expect(s.approve(c.id, ['news:write']).status).toBe('APPROVED');
  });
  it('requires citations and permissions', () => {
    const s = new NewsClaimService();
    expect(() =>
      s.create({
        claim: {
          id: 'c',
          newsEventId: 'n',
          text: 'x',
          citations: [],
          generatedBy: 'AI',
          label: 'AI Generated',
          status: 'PENDING',
        },
        permissions: ['news:propose'],
      }),
    ).toThrow('Citation');
  });
});
