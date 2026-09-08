import { readFile } from 'node:fs/promises';
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

test('English overview is wired into the enabled primary route and module page', async () => {
  const navigation = await readFile('packages/contracts/app-shell/navigation.ts', 'utf8');
  const app = await readFile('apps/desktop/src/renderer/app.js', 'utf8');
  const html = await readFile('apps/desktop/src/renderer/index.html', 'utf8');

  expect(navigation).toMatch(/id: 'english', label: '03 英语备考', status: 'available'/);
  expect(app).toContain("import('./modules/english.js')");
  expect(app).toContain('loadEnglishOverview(window.uniforge)');
  expect(app).toContain('renderEnglishOverview(viewModel)');
  expect(html).toContain('href="./modules/english-overview.css"');
});
