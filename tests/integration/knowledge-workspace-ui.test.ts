import { describe, expect, it } from 'vitest';

describe('knowledge workspace adapter', () => {
  it('maps a typed snapshot and keeps provenance/source state visible', async () => {
    const { loadKnowledgeWorkspace } = await import(
      '../../apps/desktop/src/renderer/modules/knowledge.js'
    );
    const result = await loadKnowledgeWorkspace({
      knowledge: {
        getSnapshot: async () => ({
          status: 'READ_ONLY',
          readOnly: true,
          inbox: [
            {
              id: 'content-1',
              title: 'Source note',
              sourceName: 'Local file',
              capturedAt: '2026-09-08T00:00:00Z',
              lifecycle: 'ACTIVE',
              provenance: {
                sourceEventId: 'source-1',
                capturedAt: '2026-09-08T00:00:00Z',
                locator: 'file:///authorized/note.md',
              },
            },
          ],
          topics: [],
          memories: [],
          actions: [{
            id: 'action-1',
            title: 'Review',
            status: 'WAITING_APPROVAL',
            requiresApproval: true,
            provenance: {
              sourceEventId: 'source-1',
              capturedAt: '2026-09-08T00:00:00Z',
              locator: 'file:///authorized/note.md',
            },
          }],
          sourceHealth: [{ id: 'local', name: 'Local file', status: 'HEALTHY', lastCheckedAt: null }],
          selectedContentId: 'content-1',
          pendingApprovals: 1,
        }),
      },
    });
    expect(result.state).toBe('read_only');
    expect(result.selectedContentId).toBe('content-1');
    expect(result.pendingApprovals).toBe(1);
    expect(result.inbox).toHaveLength(1);
    expect(result.sourceHealth[0].status).toBe('HEALTHY');
  });

  it('surfaces IPC failure instead of fabricating success', async () => {
    const { loadKnowledgeWorkspace } = await import(
      '../../apps/desktop/src/renderer/modules/knowledge.js'
    );
    const result = await loadKnowledgeWorkspace({
      knowledge: { getSnapshot: async () => { throw new Error('DB_OFFLINE'); } },
    });
    expect(result.state).toBe('error');
    expect(result.error.message).toBe('DB_OFFLINE');
  });
});
