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

export async function loadProjectTaskFlow(api) {
  try {
    const tasks = await api?.project?.tasks?.getSnapshot?.();
    if (!tasks) return { state: 'roadmap', reason: '项目任务 IPC 尚未启用' };
    return {
      state: Array.isArray(tasks.tasks) && tasks.tasks.length ? 'ready' : 'empty',
      tasks: Array.isArray(tasks.tasks) ? tasks.tasks : [],
      decisions: Array.isArray(tasks.decisions) ? tasks.decisions : [],
      artifacts: Array.isArray(tasks.artifacts) ? tasks.artifacts : [],
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

export function renderSoftwareWorkspace({
  authorized = false,
  canonicalPath = null,
  files = [],
  git = {},
  test = {},
} = {}) {
  const root = globalThis.document.createElement('section');
  root.className = 'software-workspace';
  const title = globalThis.document.createElement('h2');
  title.textContent = '软件项目工作区';
  const guard = globalThis.document.createElement('p');
  guard.textContent =
    authorized && canonicalPath
      ? `授权根目录：${canonicalPath}`
      : '未授权项目工作区；文件、终端和 Git 操作均已禁用。';
  const fileList = globalThis.document.createElement('ul');
  for (const file of files) {
    const item = globalThis.document.createElement('li');
    item.textContent = String(file);
    fileList.append(item);
  }
  const evidence = globalThis.document.createElement('p');
  evidence.textContent = `Git：${git.status ?? '未连接'} · 测试：${test.status ?? '未运行'}`;
  root.append(title, guard, fileList, evidence);
  return root;
}

export function renderProjectAiInspector({
  status = 'unavailable',
  reason = '尚未配置 Project AI',
} = {}) {
  const root = globalThis.document.createElement('aside');
  root.className = 'project-ai-inspector';
  const title = globalThis.document.createElement('h2');
  title.textContent = 'Project AI';
  const state = globalThis.document.createElement('p');
  state.textContent = status === 'ready' ? '可提出建议，所有修改仍需授权与审批。' : reason;
  root.append(title, state);
  return root;
}

export function renderProjectTaskFlow({ tasks = [], decisions = [], artifacts = [] } = {}) {
  const root = globalThis.document.createElement('section');
  root.className = 'project-task-flow';
  const heading = globalThis.document.createElement('h2');
  heading.textContent = '任务与证据';
  const list = globalThis.document.createElement('ul');
  for (const task of tasks) {
    const item = globalThis.document.createElement('li');
    item.textContent = `${task.title ?? task.id} · ${task.status ?? 'UNKNOWN'} · 依赖 ${task.dependsOn?.length ?? 0}`;
    list.append(item);
  }
  const summary = globalThis.document.createElement('p');
  summary.textContent = `决策 ${decisions.length} 项 · 产物 ${artifacts.length} 项；正文仍由领域对象和来源证据持有。`;
  root.append(heading, list, summary);
  return root;
}
