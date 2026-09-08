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
  const make = (tag: string) => ({
    tagName: tag,
    children: [] as any[],
    className: '',
    dataset: {},
    textContent: '',
    disabled: false,
    type: '',
    append(...nodes: any[]) {
      this.children.push(...nodes);
    },
    setAttribute() {},
  });
  (globalThis as any).document = { createElement: make };
  const root = renderEnglishStudy({
    state: 'empty',
    dimensions: ['Recognition'],
    ieltsTabs: ['Overview', 'Plan', 'Speaking'],
  });
  const buttons = (root as any).children.find((child: any) => child.tagName === 'nav').children;
  expect(buttons).toHaveLength(3);
  expect(buttons.filter((button: any) => button.disabled)).toHaveLength(2);
});
