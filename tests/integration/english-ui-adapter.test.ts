import { expect, test } from 'vitest';

test('English overview adapter preserves empty and error states', async () => {
  const { loadEnglishOverview } =
    await import('../../apps/desktop/src/renderer/modules/english.js');
  expect(
    (
      await loadEnglishOverview({
        english: {
          getSnapshot: async () => ({ spaces: [] }),
          vocabulary: { getSnapshot: async () => ({ entries: [] }) },
        },
      })
    ).state,
  ).toBe('empty');
  expect(
    (
      await loadEnglishOverview({
        english: {
          getSnapshot: async () => {
            throw new Error('OFFLINE');
          },
        },
      })
    ).state,
  ).toBe('error');
});

test('English overview renderer is exported as a view function', async () => {
  const module = await import('../../apps/desktop/src/renderer/modules/english.js');
  expect(typeof module.renderEnglishOverview).toBe('function');
});
