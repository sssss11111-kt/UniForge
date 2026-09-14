import { describe, expect, it } from 'vitest';
import { NewsSourceService } from './news-source-service.js';

const capturedAt = '2026-09-06T00:00:00Z';
describe('NewsSourceService', () => {
  it('normalizes duplicate source content into one NewsEvent with provenance', () => {
    const s = new NewsSourceService();
    const base = {
      sourceType: 'RSS' as const,
      sourceUrl: 'https://example.com/a',
      capturedAt,
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

  it('retains publication and update times, source quality, lifecycle and provenance', () => {
    const s = new NewsSourceService();
    const event = s.import({
      event: {
        id: 'official-1',
        sourceType: 'WEB',
        sourceUrl: 'https://example.com/release',
        capturedAt,
        publishedAt: '2026-09-05T12:00:00Z',
        updatedAt: '2026-09-06T01:00:00Z',
        sourceQuality: 'OFFICIAL',
        lifecycle: 'ACTIVE',
        title: 'Release',
        body: 'Details',
        contentHash: 'release-hash',
      },
      permissions: ['news:write'],
    });

    expect(event.dedupeIdentity).toBe('content-hash:release-hash');
    expect(event.publishedAt).toBe('2026-09-05T12:00:00Z');
    expect(event.updatedAt).toBe('2026-09-06T01:00:00Z');
    expect(event.lifecycle).toBe('ACTIVE');
    expect(event.provenanceRecords[0]).toMatchObject({
      sourceEventId: 'official-1',
      capturedAt,
      sourceQuality: 'OFFICIAL',
    });
  });

  it('keeps failed source fetches visible without creating feed truth', () => {
    const s = new NewsSourceService();
    const source = s.recordFetchFailure({
      event: {
        id: 'failed-1',
        sourceType: 'CONNECTOR',
        sourceUrl: 'https://example.com/feed',
        capturedAt,
        title: '',
        body: '',
        contentHash: 'unavailable',
        fetchStatus: 'FAILED',
        fetchFailure: { code: 'TIMEOUT', message: 'feed timed out' },
      },
      permissions: ['news:write'],
    });

    expect(source.fetchStatus).toBe('FAILED');
    expect(source.fetchFailure?.code).toBe('TIMEOUT');
    expect(s.get('news-content-hash:unavailable', ['news:read'])).toBeNull();
    expect(s.getSource('failed-1', ['news:read'])?.fetchFailure?.message).toBe('feed timed out');
  });

  it('rejects invalid lifecycle and dedupe input at the permission boundary', () => {
    const s = new NewsSourceService();
    expect(() =>
      s.import({
        event: {
          id: 'invalid',
          sourceType: 'RSS',
          sourceUrl: 'https://example.com/a',
          capturedAt,
          title: 't',
          body: 'b',
          contentHash: 'h',
          lifecycle: 'DELETED',
        },
        permissions: ['news:write'],
      }),
    ).toThrow('lifecycle');
    expect(() =>
      s.import({
        event: {
          id: 'denied',
          sourceType: 'RSS',
          sourceUrl: 'https://example.com/a',
          capturedAt,
          title: 't',
          body: 'b',
          contentHash: 'h',
        },
        permissions: [],
      }),
    ).toThrow('news:write');
  });
});
