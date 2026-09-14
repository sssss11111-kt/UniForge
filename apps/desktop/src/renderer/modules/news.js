export function roadmapModule({ id = 'news', label = 'AI 新闻', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}

const stateText = {
  READY: '新闻快照来自本地领域服务；核验状态和来源证据保持可见。',
  EMPTY: '暂无新闻快照。配置并授权来源后，抓取结果才会进入领域服务。',
  OFFLINE: '新闻来源离线；当前仅显示已保存快照，未把离线状态当作同步成功。',
  ERROR: '新闻工作区加载失败，请检查应用诊断。',
  READ_ONLY: '只读新闻快照；提取、核验、纠正和外部操作需要 typed command 与权限审批。',
  APPROVAL: '存在等待审批的新闻提案；审批完成前不会改变 canonical state。',
};

export async function loadNewsWorkspace(api) {
  try {
    const snapshot = await api?.news?.getSnapshot?.();
    if (!snapshot) return { state: 'error', error: { message: 'NEWS_IPC_UNAVAILABLE' } };
    const status = typeof snapshot.status === 'string' ? snapshot.status : 'ERROR';
    return {
      state: status.toLowerCase().replace('_', '-'),
      snapshot,
      events: Array.isArray(snapshot.events) ? snapshot.events : [],
      sourceHealth: Array.isArray(snapshot.sourceHealth) ? snapshot.sourceHealth : [],
      savedViews: Array.isArray(snapshot.savedViews) ? snapshot.savedViews : [],
      todaySections: Array.isArray(snapshot.todaySections) ? snapshot.todaySections : [],
      pendingClaims: Array.isArray(snapshot.pendingClaims) ? snapshot.pendingClaims : [],
      pendingCorrections: Array.isArray(snapshot.pendingCorrections)
        ? snapshot.pendingCorrections
        : [],
      conflicts: Array.isArray(snapshot.conflicts) ? snapshot.conflicts : [],
      selectedEventId: snapshot.selectedEventId ?? null,
      readOnly: snapshot.readOnly !== false,
      error: snapshot.error ? { message: snapshot.error } : undefined,
    };
  } catch (error) {
    return {
      state: 'error',
      error: { message: error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR') },
    };
  }
}

export function renderNewsWorkspace(viewModel) {
  const root = globalThis.document.createElement('section');
  root.className = 'news-workspace';
  root.dataset.state = viewModel.state;
  const title = globalThis.document.createElement('h2');
  title.textContent = 'AI 新闻';
  root.append(title);
  const status = globalThis.document.createElement('p');
  const snapshotStatus =
    viewModel.snapshot?.status ?? (viewModel.state === 'error' ? 'ERROR' : 'EMPTY');
  status.textContent = viewModel.error?.message ?? stateText[snapshotStatus] ?? stateText.ERROR;
  root.append(status);

  const counts = globalThis.document.createElement('div');
  counts.className = 'news-workspace-summary';
  for (const [label, value] of [
    ['事件', viewModel.events?.length ?? 0],
    ['待核验声明', viewModel.pendingClaims?.length ?? 0],
    ['待审批纠正', viewModel.pendingCorrections?.length ?? 0],
    ['冲突', viewModel.conflicts?.length ?? 0],
  ]) {
    const item = globalThis.document.createElement('span');
    item.textContent = `${label} ${value}`;
    counts.append(item);
  }
  root.append(counts);

  const health = globalThis.document.createElement('section');
  health.className = 'news-source-health';
  const healthTitle = globalThis.document.createElement('h3');
  healthTitle.textContent = '来源健康';
  health.append(healthTitle);
  const healthList = globalThis.document.createElement('ul');
  for (const source of viewModel.sourceHealth ?? []) {
    const row = globalThis.document.createElement('li');
    row.textContent = `${source.name} · ${source.status}${source.message ? ` · ${source.message}` : ''}`;
    healthList.append(row);
  }
  if (!viewModel.sourceHealth?.length) {
    const row = globalThis.document.createElement('li');
    row.textContent = '暂无来源健康记录。';
    healthList.append(row);
  }
  health.append(healthList);
  root.append(health);

  const events = globalThis.document.createElement('ul');
  events.className = 'news-events';
  for (const item of viewModel.events ?? []) {
    const row = globalThis.document.createElement('li');
    row.dataset.eventId = item.event?.id ?? '';
    const titleText = item.event?.canonicalTitle ?? '未命名新闻事件';
    const verification = item.verification?.[0]?.status ?? item.event?.status ?? 'UNVERIFIED';
    row.textContent = `${titleText} · ${verification} · 来源 ${item.provenance?.length ?? item.event?.provenanceRecords?.length ?? 0}`;
    events.append(row);
  }
  if (!viewModel.events?.length) {
    const row = globalThis.document.createElement('li');
    row.textContent = '暂无事件；抓取失败不会被显示为成功事件。';
    events.append(row);
  }
  root.append(events);

  const evidence = globalThis.document.createElement('p');
  evidence.className = 'news-provenance';
  evidence.textContent = viewModel.selectedEventId
    ? `当前事件 ${viewModel.selectedEventId} 保留声明、来源、捕获时间和纠正历史。`
    : '选择事件后显示声明、核验、纠正和来源证据。';
  root.append(evidence);
  return root;
}
