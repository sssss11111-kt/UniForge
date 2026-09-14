import { describe, expect, it } from 'vitest';
import { ContentService } from './content-service.js';
describe('ContentService', () => {
  it('imports canonical content with source provenance', () => {
    const s = new ContentService();
    const c = s.import({
      contentId: 'c1',
      sourceEvent: {
        id: 'src1',
        sourceType: 'FILE',
        capturedAt: '2026-09-06T00:00:00Z',
        locator: 'a.txt',
      },
      body: 'hello',
      mimeType: 'text/plain',
      permissions: ['knowledge:write'],
    });
    expect(c.provenance).toEqual(['src1']);
    expect(s.get('c1', ['knowledge:read'])?.body).toBe('hello');
  });
  it('fails closed and rejects empty or duplicate content', () => {
    const s = new ContentService();
    const base = {
      contentId: 'c',
      sourceEvent: { id: 's', sourceType: 'USER' as const, capturedAt: 'x', locator: 'u' },
      body: 'x',
      mimeType: 'text/plain',
      permissions: ['knowledge:write'],
    };
    expect(() => s.import({ ...base, permissions: [] })).toThrow('knowledge:write');
    s.import(base);
    expect(() => s.import({ ...base, contentId: 'c2', body: ' ' })).toThrow('body');
    expect(() => s.import(base)).toThrow('already exists');
  });
});
