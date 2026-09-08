import { describe, expect, it } from 'vitest';
import { NewsWorkspaceService } from './news-workspace-service.js';

const event = {
  event: {
    id: 'news-1',
    dedupeIdentity: 'content-hash:a',
    sourceEventIds: ['source-1'],
    canonicalTitle: 'AI update',
    canonicalBody: 'body',
    status: 'CONFLICTING' as const,
    lifecycle: 'ACTIVE' as const,
    sourceQuality: 'OFFICIAL' as const,
    provenance: ['source-1'],
    provenanceRecords: [
      {
        sourceEventId: 'source-1',
        sourceUrl: 'https://example.com/a',
        capturedAt: '2026-09-08T00:00:00Z',
        contentHash: 'a',
        sourceQuality: 'OFFICIAL' as const,
      },
    ],
  },
  sourceObservations: [
    {
      id: 'source-1',
      sourceType: 'WEB' as const,
      sourceUrl: 'https://example.com/a',
      capturedAt: '2026-09-08T00:00:00Z',
      title: 'AI update',
      body: 'body',
      contentHash: 'a',
    },
  ],
  claims: [
    {
      id: 'claim-1',
      newsEventId: 'news-1',
      text: 'A claim',
      evidence: [{ id: 'e-1', quote: 'quote' }],
      confidence: 0.5,
      status: 'PENDING' as const,
      provenance: {
        origin: 'AI' as const,
        recordedAt: '2026-09-08T00:00:00Z',
        sourceEventIds: ['source-1'],
      },
    },
  ],
  verification: [
    {
      claimId: 'claim-1',
      status: 'CONFLICTING' as const,
      supportingSourceIds: ['source-1'],
      conflictingSourceIds: ['source-2'],
    },
  ],
  corrections: [],
  provenance: [],
};

describe('NewsWorkspaceService', () => {
  it('projects pending claims and conflicts without claiming verification success', () => {
    const snapshot = new NewsWorkspaceService({ events: [event] }).getSnapshot(['news:read']);
    expect(snapshot.status).toBe('READY');
    expect(snapshot.readOnly).toBe(true);
    expect(snapshot.pendingClaims).toHaveLength(1);
    expect(snapshot.conflicts).toHaveLength(1);
    expect(snapshot.events[0]?.event.status).toBe('CONFLICTING');
  });

  it('fails closed without read permission', () => {
    expect(() => new NewsWorkspaceService().getSnapshot([])).toThrow('news:read');
  });
});
