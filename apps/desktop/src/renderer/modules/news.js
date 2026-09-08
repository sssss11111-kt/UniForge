export function roadmapModule({ id = 'news', label = 'AI 新闻', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}
