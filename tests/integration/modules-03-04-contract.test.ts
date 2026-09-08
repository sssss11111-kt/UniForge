import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';

test('modules 03-04 expose typed read snapshots and no arbitrary renderer bridge', async () => {
  const dto = await readFile('packages/contracts/ipc/dto.ts', 'utf8');
  const api = await readFile('packages/contracts/ipc/api.ts', 'utf8');
  const preload = await readFile('apps/desktop/src/preload/index.ts', 'utf8');
  expect(dto).toContain('projectWorkspaceSnapshot');
  expect(dto).toContain('ProjectWorkspaceResponseDto');
  expect(api).toContain('readonly project:');
  expect(api).toContain('ProjectWorkspaceSnapshot');
  expect(preload).toContain('projectWorkspaceSnapshotChannel');
  expect(dto).toContain('englishSnapshot');
  expect(dto).toContain('projectTaskSnapshot');
  expect(api).toContain('readonly english:');
  expect(api).toContain('readonly tasks:');
  expect(preload).toContain('englishVocabularySnapshotChannel');
  expect(preload).toContain('projectTaskSnapshotChannel');
  expect(preload).not.toContain('contextBridge.exposeInMainWorld("fs"');
});

test('English is enabled while project remains a roadmap route', async () => {
  const nav = await readFile('packages/contracts/app-shell/navigation.ts', 'utf8');
  expect(nav).toMatch(/id: 'english',[\s\S]*status: 'available'/);
  expect(nav).toMatch(/id: 'projects',[\s\S]*status: 'roadmap'/);
  expect(nav).not.toContain('development');
});

test('renderer contains a module page mount for future 03-04 vertical slices', async () => {
  const html = await readFile('apps/desktop/src/renderer/index.html', 'utf8');
  const app = await readFile('apps/desktop/src/renderer/app.js', 'utf8');
  expect(html).toContain('id="module-page"');
  expect(app).toContain('该模块的业务快照尚未接入');
});
