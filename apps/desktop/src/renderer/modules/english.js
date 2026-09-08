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
