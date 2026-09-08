export function roadmapModule({
  id = 'knowledge',
  label = '知识与情报',
  secondaryItems = [],
} = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}
