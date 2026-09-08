export function roadmapModule({ id = 'projects', label = '项目实践', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}
