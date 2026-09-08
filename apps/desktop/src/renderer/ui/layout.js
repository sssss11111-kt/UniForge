import { el } from './components.js';
import { selectRoute } from './navigation.js';

export function createAppShell({ registry, activeRoute, onNavigate, inspectorOpen = true }) {
  const active = selectRoute(registry, activeRoute);
  if (!active) throw new Error('INVALID_ROUTE');
  const main = el('main', { 'data-region': 'main', id: 'uf-main', tabindex: '-1' });
  const inspector = el(
    'aside',
    { 'data-region': 'inspector', id: 'uf-inspector', 'aria-label': '状态侧栏' },
    ['选择对象后查看上下文、来源与权限。'],
  );
  const toggle = el('button', { type: 'button', 'aria-controls': 'uf-inspector' });
  const update = () => {
    inspector.hidden = !inspectorOpen;
    toggle.textContent = inspectorOpen ? '收起状态侧栏' : '展开状态侧栏';
    toggle.setAttribute('aria-expanded', String(inspectorOpen));
    shell.dataset.inspectorOpen = String(inspectorOpen);
  };
  toggle.addEventListener('click', () => {
    inspectorOpen = !inspectorOpen;
    update();
  });
  const primary = el(
    'nav',
    { 'data-region': 'primary', 'aria-label': '主导航' },
    registry.map((route) =>
      el(
        'button',
        {
          type: 'button',
          disabled: route.status !== 'available',
          'aria-current': route.id === activeRoute ? 'page' : undefined,
          onClick: () => {
            if (selectRoute(registry, route.id)) onNavigate(route.id);
          },
        },
        [route.label, route.status === 'roadmap' ? ' · 路线图' : ''],
      ),
    ),
  );
  const secondary = el('nav', { 'data-region': 'secondary', 'aria-label': '模块导航' }, [
    el('h2', {}, [active.label]),
    toggle,
  ]);
  const command = el('form', { 'data-region': 'command', 'aria-label': '命令栏' }, [
    el('input', { disabled: true, 'aria-label': '命令输入', placeholder: '命令执行尚未连接' }),
    el('button', { type: 'button', disabled: true }, ['执行命令']),
  ]);
  const shell = el('div', { className: 'uf-app-shell', 'data-testid': 'app-shell' }, [
    primary,
    secondary,
    main,
    inspector,
    command,
  ]);
  update();
  return shell;
}
