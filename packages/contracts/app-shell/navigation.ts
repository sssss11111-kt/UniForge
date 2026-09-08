export type AppShellModuleId =
  'overview' | 'agent-center' | 'course' | 'english' | 'projects' | 'knowledge' | 'news';

export type AppShellModuleStatus = 'available' | 'roadmap';

export interface AppShellModuleDto {
  readonly id: AppShellModuleId;
  readonly label: string;
  readonly status: AppShellModuleStatus;
}

export interface AppShellDto {
  readonly activeModule: AppShellModuleId;
  readonly modules: readonly AppShellModuleDto[];
}

export const APP_SHELL_MODULES: readonly AppShellModuleDto[] = Object.freeze([
  { id: 'overview', label: '00 总览', status: 'available' },
  { id: 'agent-center', label: '01 Agent 执行中心', status: 'available' },
  { id: 'course', label: '02 课内学习', status: 'available' },
  { id: 'english', label: '03 英语备考', status: 'available' },
  { id: 'projects', label: '04 项目实践', status: 'available' },
  { id: 'knowledge', label: '05 知识与情报', status: 'roadmap' },
  { id: 'news', label: '06 AI 新闻', status: 'available' },
]);

export const DEFAULT_APP_SHELL: AppShellDto = Object.freeze({
  activeModule: 'overview',
  modules: APP_SHELL_MODULES,
});
