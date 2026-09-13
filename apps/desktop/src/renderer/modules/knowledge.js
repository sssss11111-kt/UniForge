export function roadmapModule({
  id = 'knowledge',
  label = '知识与情报',
  secondaryItems = [],
} = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}

export async function loadKnowledgeWorkspace(api) {
  try {
    const snapshot = await api?.knowledge?.getSnapshot?.();
    if (!snapshot) return { state: 'error', error: { message: 'KNOWLEDGE_IPC_UNAVAILABLE' } };
    const state = snapshot.status ?? 'ERROR';
    return {
      state: state.toLowerCase(),
      snapshot,
      inbox: Array.isArray(snapshot.inbox) ? snapshot.inbox : [],
      topics: Array.isArray(snapshot.topics) ? snapshot.topics : [],
      memories: Array.isArray(snapshot.memories) ? snapshot.memories : [],
      actions: Array.isArray(snapshot.actions) ? snapshot.actions : [],
      sourceHealth: Array.isArray(snapshot.sourceHealth) ? snapshot.sourceHealth : [],
      selectedContentId: snapshot.selectedContentId ?? null,
      readOnly: snapshot.readOnly !== false,
      pendingApprovals: Number(snapshot.pendingApprovals ?? 0),
      error: snapshot.error ? { message: snapshot.error } : undefined,
    };
  } catch (error) {
    return {
      state: 'error',
      error: { message: error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR') },
    };
  }
}

export function renderKnowledgeWorkspace(viewModel) {
  const root = globalThis.document.createElement('section');
  root.className = 'knowledge-workspace';
  root.dataset.state = viewModel.state;
  const title = globalThis.document.createElement('h2');
  title.textContent = '知识与情报';
  root.append(title);
  const state = globalThis.document.createElement('p');
  state.textContent =
    viewModel.state === 'error'
      ? (viewModel.error?.message ?? '知识工作区加载失败')
      : viewModel.state === 'offline'
        ? '知识服务离线；当前仅显示已保存快照。'
        : viewModel.state === 'empty'
          ? '暂无知识内容；导入内容后会在来源证据保留的前提下显示。'
          : viewModel.readOnly
            ? '只读快照；写入、删除和外部操作需要 typed command 与权限审批。'
            : '知识数据来自本地领域快照。';
  root.append(state);
  const summary = globalThis.document.createElement('div');
  summary.className = 'knowledge-workspace-summary';
  for (const [label, value] of [
    ['收件箱', viewModel.inbox?.length ?? 0],
    ['主题', viewModel.topics?.length ?? 0],
    ['记忆', viewModel.memories?.length ?? 0],
    ['待审批', viewModel.pendingApprovals ?? 0],
  ]) {
    const item = globalThis.document.createElement('span');
    item.textContent = `${label} ${value}`;
    summary.append(item);
  }
  root.append(summary);
  const inbox = globalThis.document.createElement('ul');
  inbox.className = 'knowledge-inbox';
  for (const item of viewModel.inbox ?? []) {
    const row = globalThis.document.createElement('li');
    row.textContent = `${item.title} · ${item.sourceName} · ${item.lifecycle}`;
    row.dataset.contentId = item.id;
    inbox.append(row);
  }
  root.append(inbox);
  const provenance = globalThis.document.createElement('p');
  provenance.className = 'knowledge-provenance';
  provenance.textContent = viewModel.selectedContentId
    ? `当前内容 ${viewModel.selectedContentId} 保留来源、捕获时间与定位信息。`
    : '选择内容后显示来源证据与溯源信息。';
  root.append(provenance);
  const health = globalThis.document.createElement('p');
  health.className = 'knowledge-source-health';
  health.textContent = viewModel.sourceHealth?.length
    ? `来源健康：${viewModel.sourceHealth.map((source) => `${source.name} ${source.status}`).join(' · ')}`
    : '来源健康状态：暂无已连接来源。';
  root.append(health);
  return root;
}
