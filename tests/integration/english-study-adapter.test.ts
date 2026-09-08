import { expect, test } from 'vitest';

test('English study adapter exposes shared dimensions and IELTS tabs', async () => {
  const { loadEnglishStudy } = await import('../../apps/desktop/src/renderer/modules/english.js');
  const result = await loadEnglishStudy({
    english: { vocabulary: { getSnapshot: async () => ({ entries: [] }) } },
  });
  expect(result.state).toBe('empty');
  expect(result.dimensions).toContain('Recognition');
  expect(result.ieltsTabs).toContain('Speaking');
});

test('English study renderer keeps non-ready IELTS sections visibly unavailable', async () => {
  const { renderEnglishStudy } = await import('../../apps/desktop/src/renderer/modules/english.js');
  const root = renderEnglishStudy({
    state: 'empty',
    dimensions: ['Recognition'],
    ieltsTabs: ['Overview', 'Plan', 'Speaking'],
  });
  expect(root.querySelectorAll('button')).toHaveLength(3);
  expect(root.querySelectorAll('button:disabled')).toHaveLength(2);
});
