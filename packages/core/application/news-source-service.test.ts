import { describe, expect, it } from 'vitest';
import { NewsSourceService } from './news-source-service.js';
describe('NewsSourceService', () => {
  it('normalizes duplicate source content into one NewsEvent with provenance', () => {
    const s = new NewsSourceService();
    const base = {
      sourceType: 'RSS' as const,
      sourceUrl: 'https://example.com/a',
      capturedAt: '2026-09-06T00:00:00Z',
      title: 'Title',
      body: 'Body',
      contentHash: 'h',
    };
    const first = s.import({ event: { ...base, id: 's1' }, permissions: ['news:write'] });
    const merged = s.import({
      event: { ...base, id: 's2', sourceUrl: 'https://example.com/b' },
      permissions: ['news:write'],
    });
    expect(first.id).toBe(merged.id);
    expect(merged.sourceEventIds).toHaveLength(2);
  });
  it('fails closed and validates source URL', () => {
    const s = new NewsSourceService();
    expect(() =>
      s.import({
        event: {
          id: 's',
          sourceType: 'WEB',
          sourceUrl: 'file:x',
          capturedAt: 'x',
          title: 't',
          body: 'b',
          contentHash: 'h',
        },
        permissions: ['news:write'],
      }),
    ).toThrow('URL');
    expect(() => s.get('x', [])).toThrow('news:read');
  });
});
