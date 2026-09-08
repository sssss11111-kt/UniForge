export const navigationRegistry = Object.freeze([
  { id: 'overview', label: '00 总览', status: 'available' },
  { id: 'agent-center', label: '01 Agent 执行中心', status: 'available' },
  { id: 'course', label: '02 课内学习', status: 'available' },
  { id: 'english', label: '03 英语备考', status: 'available' },
  { id: 'projects', label: '04 项目实践', status: 'roadmap' },
  { id: 'knowledge', label: '05 知识与情报', status: 'roadmap' },
  { id: 'news', label: '06 AI 新闻', status: 'roadmap' },
]);
export function selectRoute(registry, id) {
  return registry.find((route) => route.id === id && route.status === 'available') ?? null;
}
