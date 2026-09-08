export function roadmapModule({ id = 'english', label = '英语备考', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}
