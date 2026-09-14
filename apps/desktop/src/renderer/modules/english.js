export function roadmapModule({ id = 'english', label = '英语备考', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}

export async function loadEnglishOverview(api) {
  try {
    const exam = await api?.english?.getSnapshot?.();
    const vocabulary = await api?.english?.vocabulary?.getSnapshot?.();
    if (!exam || !vocabulary) return { state: 'roadmap', reason: '英语模块 IPC 尚未启用' };
    const spaces = Array.isArray(exam.spaces) ? exam.spaces : [];
    const entries = Array.isArray(vocabulary.entries) ? vocabulary.entries : [];
    return {
      state: spaces.length || entries.length ? 'ready' : 'empty',
      spaces,
      entries,
      reviewDue: entries.filter((entry) => entry.state?.nextReviewAt).length,
      weakDimensions: [],
      nextAction: spaces.length ? '开始今日复习' : '创建考试空间',
      reason: spaces.length ? '根据当前考试空间与复习记录' : '尚未设置考试空间',
    };
  } catch (error) {
    return {
      state: 'error',
      error: { message: error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR') },
    };
  }
}

export async function loadEnglishStudy(api) {
  try {
    const vocabulary = await api?.english?.vocabulary?.getSnapshot?.();
    if (!vocabulary) return { state: 'roadmap', reason: '词汇 IPC 尚未启用' };
    const entries = Array.isArray(vocabulary.entries) ? vocabulary.entries : [];
    return {
      state: entries.length ? 'ready' : 'empty',
      entries,
      dimensions: [
        'Recognition',
        'Spelling',
        'Listening',
        'Pronunciation',
        'Grammar',
        'Morphology',
        'Collocation',
        'Context',
        'Polysemy',
      ],
      ieltsTabs: [
        'Overview',
        'Plan',
        'Vocabulary',
        'Listening',
        'Reading',
        'Writing',
        'Speaking',
        'Mock Exam',
        'Materials',
        'AI Coach',
      ],
    };
  } catch (error) {
    return {
      state: 'error',
      error: { message: error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR') },
    };
  }
}

export function renderEnglishOverview(viewModel) {
  const root = globalThis.document.createElement('section');
  root.className = 'english-overview';
  root.dataset.state = viewModel.state;
  const title = globalThis.document.createElement('h2');
  title.textContent = '英语备考';
  root.append(title);
  const summary = globalThis.document.createElement('p');
  summary.textContent =
    viewModel.state === 'error'
      ? (viewModel.error?.message ?? '加载失败')
      : (viewModel.reason ?? '本地学习进度');
  root.append(summary);
  if (viewModel.state === 'empty') {
    const empty = globalThis.document.createElement('p');
    empty.textContent = '尚未创建考试空间或词汇记录。';
    root.append(empty);
    return root;
  }
  const grid = globalThis.document.createElement('div');
  grid.className = 'english-overview-grid';
  for (const [label, value] of [
    ['考试空间', viewModel.spaces?.length ?? 0],
    ['待复习', viewModel.reviewDue ?? 0],
    ['下一行动', viewModel.nextAction ?? '暂无'],
  ]) {
    const panel = globalThis.document.createElement('article');
    panel.className = 'english-overview-panel';
    const heading = globalThis.document.createElement('h3');
    heading.textContent = label;
    const content = globalThis.document.createElement('p');
    content.textContent = String(value);
    panel.append(heading, content);
    grid.append(panel);
  }
  root.append(grid);
  return root;
}

export function renderEnglishStudy(viewModel) {
  const root = globalThis.document.createElement('section');
  root.className = 'english-study';
  root.dataset.state = viewModel.state;
  const title = globalThis.document.createElement('h2');
  title.textContent = '词汇与 IELTS 工作区';
  root.append(title);
  const dimensions = globalThis.document.createElement('p');
  dimensions.textContent = `学习维度：${(viewModel.dimensions ?? []).join(' · ')}`;
  root.append(dimensions);
  const tabs = globalThis.document.createElement('nav');
  tabs.setAttribute('aria-label', 'IELTS sections');
  for (const tab of viewModel.ieltsTabs ?? []) {
    const item = globalThis.document.createElement('button');
    item.type = 'button';
    item.textContent = tab;
    item.disabled = tab !== 'Overview';
    tabs.append(item);
  }
  root.append(tabs);
  return root;
}
