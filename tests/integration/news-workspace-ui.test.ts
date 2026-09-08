import { describe, expect, it } from 'vitest';

describe('news workspace renderer adapter', () => {
  it('keeps offline and pending verification visible', async () => {
    const { loadNewsWorkspace } = await import('../../apps/desktop/src/renderer/modules/news.js');
    const result = await loadNewsWorkspace({
      news: {
        getSnapshot: async () => ({
          status: 'OFFLINE',
          readOnly: true,
          events: [],
          sourceHealth: [{ id: 'feed', name: 'Feed', status: 'OFFLINE', lastCheckedAt: null }],
          pendingClaims: [{ id: 'claim-1' }],
          pendingCorrections: [],
          conflicts: [],
          savedViews: [],
          todaySections: [],
        }),
      },
    });
    expect(result.state).toBe('offline');
    expect(result.readOnly).toBe(true);
    expect(result.pendingClaims).toHaveLength(1);
    expect((result.sourceHealth[0] as { status?: string } | undefined)?.status).toBe('OFFLINE');
  });

  it('surfaces IPC failure instead of fabricating a news snapshot', async () => {
    const { loadNewsWorkspace } = await import('../../apps/desktop/src/renderer/modules/news.js');
    const result = await loadNewsWorkspace({
      news: {
        getSnapshot: async () => {
          throw new Error('NEWS_DB_OFFLINE');
        },
      },
    });
    expect(result.state).toBe('error');
    expect(result.error?.message).toBe('NEWS_DB_OFFLINE');
  });
});
