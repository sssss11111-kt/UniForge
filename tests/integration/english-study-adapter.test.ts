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
  type Stub = {
    tagName: string;
    children: Stub[];
    className: string;
    dataset: Record<string, string>;
    textContent: string;
    disabled: boolean;
    type: string;
    append: (...nodes: Stub[]) => void;
    setAttribute: () => void;
  };
  const make = (tag: string): Stub => {
    const node = {} as Stub;
    node.tagName = tag;
    node.children = [];
    node.className = '';
    node.dataset = {};
    node.textContent = '';
    node.disabled = false;
    node.type = '';
    node.append = (...nodes: Stub[]) => node.children.push(...nodes);
    node.setAttribute = () => undefined;
    return node;
  };
  (globalThis as unknown as { document: { createElement: (tag: string) => Stub } }).document = {
    createElement: make,
  };
  const root = renderEnglishStudy({
    state: 'empty',
    dimensions: ['Recognition'],
    ieltsTabs: ['Overview', 'Plan', 'Speaking'],
  });
  const buttons =
    (root as unknown as Stub).children.find((child) => child.tagName === 'nav')?.children ?? [];
  expect(buttons).toHaveLength(3);
  expect(buttons.filter((button) => button.disabled)).toHaveLength(2);
});
