import { expect, test } from 'vitest';

test('project overview renderer exposes protected workspace state', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile('apps/desktop/src/renderer/modules/projects.js', 'utf8'),
  );
  expect(source).toContain('renderProjectOverview');
  expect(source).toContain('尚未授权项目工作区');
});
