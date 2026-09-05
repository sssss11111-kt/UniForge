/* global document, window */
(() => {
  const navigation = document.getElementById('primary-navigation');
  const description = document.getElementById('module-description');
  const availableDescription = '从这里开始管理你的学习、Agent 任务和工作空间。';
  const render = (shell) => {
    navigation.replaceChildren();
    shell.modules.forEach((module) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'nav-item';
      item.textContent = module.status === 'roadmap' ? `${module.label} · 路线图` : module.label;
      item.dataset.moduleId = module.id;
      item.disabled = module.status === 'roadmap';
      item.title = item.disabled ? '路线图功能，尚未开放' : module.label;
      if (module.id === shell.activeModule) {
        item.setAttribute('aria-current', 'page');
        description.textContent = availableDescription;
      }
      if (!item.disabled) {
        item.addEventListener('click', () => {
          navigation.querySelector('[aria-current="page"]')?.removeAttribute('aria-current');
          item.setAttribute('aria-current', 'page');
          description.textContent =
            module.id === 'overview' ? availableDescription : '该模块已进入 Stage 1 开发范围。';
        });
      } else {
        item.setAttribute('aria-label', `${module.label}（路线图）`);
      }
      navigation.append(item);
    });
  };

  const start = async () => {
    try {
      render(await window.uniforge.appShell());
    } catch {
      description.textContent = '工作台加载失败，请检查应用诊断。';
    }
  };
  void start();
})();
