export function roadmapModule({ id = 'projects', label = '项目实践', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}

export async function loadProjectOverview(api) {
  try {
    const snapshot = await api?.project?.getSnapshot?.();
    if (!snapshot) return { state: 'roadmap', reason: '项目 IPC 尚未启用' };
    const projectCount = Number(snapshot.projectCount ?? 0);
    return {
      state: projectCount ? 'ready' : 'empty',
      projectCount,
      taskCount: Number(snapshot.taskCount ?? 0),
      runningExecutions: Number(snapshot.runningExecutions ?? 0),
      reviewArtifacts: Number(snapshot.reviewArtifacts ?? 0),
      failedOperations: Number(snapshot.failedOperations ?? 0),
      capabilityBlocks: ['Tasks', 'Files', 'Project AI', 'Decisions', 'Artifacts'],
      workspace: { authorized: false, canonicalPath: null },
    };
  } catch (error) {
    return {
      state: 'error',
      error: { message: error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR') },
    };
  }
}

export function renderProjectOverview(viewModel) {
  const root = globalThis.document.createElement('section');
  root.className = 'project-overview';
  root.dataset.state = viewModel.state;
  const title = globalThis.document.createElement('h2');
  title.textContent = '项目实践';
  root.append(title);
  const state = globalThis.document.createElement('p');
  state.textContent =
    viewModel.state === 'empty'
      ? '尚未创建项目。'
      : viewModel.state === 'error'
        ? (viewModel.error?.message ?? '加载失败')
        : '项目数据来自本地领域快照。';
  root.append(state);
  const grid = globalThis.document.createElement('div');
  grid.className = 'project-overview-grid';
  for (const [label, value] of [
    ['项目', viewModel.projectCount ?? 0],
    ['任务', viewModel.taskCount ?? 0],
    ['运行中', viewModel.runningExecutions ?? 0],
    ['待审核产物', viewModel.reviewArtifacts ?? 0],
  ]) {
    const panel = globalThis.document.createElement('article');
    panel.className = 'project-overview-panel';
    const heading = globalThis.document.createElement('h3');
    heading.textContent = label;
    const content = globalThis.document.createElement('p');
    content.textContent = String(value);
    panel.append(heading, content);
    grid.append(panel);
  }
  const workspace = globalThis.document.createElement('p');
  workspace.className = 'project-workspace-guard';
  workspace.textContent = viewModel.workspace?.authorized
    ? `已授权工作区：${viewModel.workspace.canonicalPath}`
    : '尚未授权项目工作区；文件操作保持禁用。';
  root.append(grid, workspace);
  return root;
}
