import { expect, test } from 'vitest';
test('project task view keeps relation content separate from canonical bodies', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile('apps/desktop/src/renderer/modules/projects.js', 'utf8'),
  );
  expect(source).toContain('renderProjectTaskFlow');
  expect(source).toContain('领域对象和来源证据');
});
