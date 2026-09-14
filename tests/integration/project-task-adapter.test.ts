import { expect, test } from 'vitest';

test('project task adapter preserves roadmap when task IPC is unavailable', async () => {
  const { loadProjectTaskFlow } =
    await import('../../apps/desktop/src/renderer/modules/projects.js');
  const result = await loadProjectTaskFlow({ project: {} });
  expect(result.state).toBe('roadmap');
});

test('project task adapter maps the domain snapshot to ready task flow data', async () => {
  const { loadProjectTaskFlow } =
    await import('../../apps/desktop/src/renderer/modules/projects.js');
  const result = await loadProjectTaskFlow({
    project: {
      tasks: {
        getSnapshot: async () => ({
          tasks: [{ id: 'task-1', title: 'Define scope', status: 'TODO' }],
          decisions: [{ id: 'decision-1' }],
          artifacts: [{ id: 'artifact-1' }],
        }),
      },
    },
  });

  expect(result).toMatchObject({
    state: 'ready',
    tasks: [{ id: 'task-1', status: 'TODO' }],
    decisions: [{ id: 'decision-1' }],
    artifacts: [{ id: 'artifact-1' }],
  });
});

test('project task adapter exposes snapshot failures as an error state', async () => {
  const { loadProjectTaskFlow } =
    await import('../../apps/desktop/src/renderer/modules/projects.js');
  const result = await loadProjectTaskFlow({
    project: {
      tasks: {
        getSnapshot: async () => {
          throw new Error('permission denied');
        },
      },
    },
  });

  expect(result).toEqual({ state: 'error', error: { message: 'permission denied' } });
});
