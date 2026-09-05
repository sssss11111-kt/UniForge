/* global document, window */
(() => {
  const navigation = document.getElementById('primary-navigation');
  const description = document.getElementById('module-description');
  const availableDescription = '从这里开始管理你的学习、Agent 任务和工作空间。';
  const settingsSummary = document.getElementById('settings-summary');
  const dashboardItems = document.getElementById('dashboard-items');
  const dashboardWorkspaceState = document.getElementById('dashboard-workspace-state');
  const courseState = document.getElementById('course-state');
  const courseForm = document.getElementById('course-form');
  const courseError = document.getElementById('course-error');
  const renderCourse = (snapshot) => {
    const course = snapshot.course;
    courseState.textContent = course.name
      ? `${course.name} · ${course.term.name} · ${course.type}`
      : '尚未创建课程。创建后课程将成为本地领域对象。';
  };
  const renderDashboard = (snapshot) => {
    dashboardWorkspaceState.textContent = `${snapshot.workspaceName} · ${snapshot.workspaceStatus}`;
    dashboardItems.replaceChildren();
    snapshot.items.forEach((item) => {
      const card = document.createElement('article');
      card.className = `dashboard-item dashboard-item-${item.state.toLowerCase()}`;
      const heading = document.createElement('div');
      heading.className = 'dashboard-item-heading';
      const title = document.createElement('h3');
      title.textContent = item.title;
      heading.append(title);
      if (item.priority) {
        const priority = document.createElement('span');
        priority.className = 'priority-badge';
        priority.textContent = item.priority;
        heading.append(priority);
      }
      const descriptionText = document.createElement('p');
      descriptionText.textContent = item.description;
      card.append(heading, descriptionText);
      if (item.reason) {
        const reason = document.createElement('small');
        reason.textContent = `依据：${item.reason}`;
        card.append(reason);
      }
      dashboardItems.append(card);
    });
  };
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
      const snapshot = await window.uniforge.settings.getSnapshot();
      const model = snapshot.models[0];
      settingsSummary.textContent = `${snapshot.workspace.name} · ${snapshot.workspace.status} · 模型 ${model?.model ?? '未配置'} · 外网 ${snapshot.permissions.externalNetwork}`;
      renderDashboard(await window.uniforge.dashboard.getSnapshot());
      renderCourse(await window.uniforge.course.getSnapshot());
      courseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        courseError.textContent = '';
        try {
          renderCourse(
            await window.uniforge.course.create({
              commandId: `command-${Date.now()}`,
              name: document.getElementById('course-name').value,
              termName: document.getElementById('course-term').value,
              type: 'CUSTOM',
            }),
          );
        } catch {
          courseError.textContent = '课程创建失败，请检查输入或应用诊断。';
        }
      });
    } catch {
      description.textContent = '工作台加载失败，请检查应用诊断。';
      settingsSummary.textContent = '设置加载失败，请检查应用诊断。';
      dashboardWorkspaceState.textContent = '加载失败';
      dashboardItems.replaceChildren();
      courseState.textContent = '课程状态加载失败。';
      const error = document.createElement('p');
      error.className = 'dashboard-placeholder';
      error.textContent = '概览加载失败，请检查应用诊断。';
      dashboardItems.append(error);
    }
  };
  void start();
})();
