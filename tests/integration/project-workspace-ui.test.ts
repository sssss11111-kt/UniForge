import { expect, test } from 'vitest';

test('software workspace keeps unauthorized file operations visibly disabled', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile('apps/desktop/src/renderer/modules/projects.js', 'utf8'),
  );
  expect(source).toContain('文件、终端和 Git 操作均已禁用');
  expect(source).toContain('renderSoftwareWorkspace');
});
