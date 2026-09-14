import { expect, test } from 'vitest';

test('project overview adapter preserves empty state and protected workspace default', async () => {
  const { loadProjectOverview } =
    await import('../../apps/desktop/src/renderer/modules/projects.js');
  const result = await loadProjectOverview({
    project: { getSnapshot: async () => ({ projectCount: 0, taskCount: 0 }) },
  });
  expect(result.state).toBe('empty');
  expect(result.workspace.authorized).toBe(false);
  expect(result.capabilityBlocks).toContain('Decisions');
});
