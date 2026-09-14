import { expect, test } from 'vitest';

test('project overview renderer exposes protected workspace state', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile('apps/desktop/src/renderer/modules/projects.js', 'utf8'),
  );
  expect(source).toContain('renderProjectOverview');
  expect(source).toContain('尚未授权项目工作区');
  expect(source).toContain('操作范围：仅限当前授权项目根目录');
  expect(source).toContain('renderProjectAiInspector');
});

test('projects route loads its typed snapshot and renders the project overview', async () => {
  const source = await import('node:fs/promises').then(({ readFile }) =>
    readFile('apps/desktop/src/renderer/app.js', 'utf8'),
  );
  expect(source).toContain("projectsOverviewAdapter = await import('./modules/projects.js')");
  expect(source).toContain('projectsOverviewAdapter.loadProjectOverview(window.uniforge)');
  expect(source).toContain('projectsOverviewAdapter.renderProjectOverview(viewModel)');
  expect(source).toContain('renderSoftwareWorkspace');
});
