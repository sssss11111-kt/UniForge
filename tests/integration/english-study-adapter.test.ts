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
