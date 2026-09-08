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
  expect(preload).not.toContain('contextBridge.exposeInMainWorld(\"fs\"');
});

test('english and project route contracts remain roadmap until real module UI exists', async () => {
  const nav = await readFile('packages/contracts/app-shell/navigation.ts', 'utf8');
  expect(nav).toMatch(/id: 'english',[\s\S]*status: 'roadmap'/);
  expect(nav).toMatch(/id: 'projects',[\s\S]*status: 'roadmap'/);
  expect(nav).not.toContain('development');
});
