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
  const courseMaterialState = document.getElementById('course-material-state');
  const courseMaterialImport = document.getElementById('course-material-import');
  const courseMaterialError = document.getElementById('course-material-error');
  const courseRecognitionState = document.getElementById('course-recognition-state');
  const courseAiForm = document.getElementById('course-ai-form');
  const courseAiQuestion = document.getElementById('course-ai-question');
  const courseAiState = document.getElementById('course-ai-state');
  const courseAiError = document.getElementById('course-ai-error');
  const assignmentForm = document.getElementById('assignment-form');
  const assignmentMode = document.getElementById('assignment-mode');
  const assignmentPrompt = document.getElementById('assignment-prompt');
  const assignmentState = document.getElementById('assignment-state');
  const assignmentError = document.getElementById('assignment-error');
  const renderAssignments = (snapshot) => {
    const latest = snapshot.sessions.at(-1);
    if (!latest) {
      assignmentState.textContent = '作业模式尚未启动。';
      return;
    }
    assignmentState.textContent =
      latest.status === 'WAITING_APPROVAL'
        ? '任务执行等待审批。不会自动提交作业。'
        : latest.status === 'FAILED'
          ? `作业模式失败：${latest.error}`
          : latest.status === 'UNAVAILABLE'
            ? '任务执行能力当前不可用。'
            : `${latest.mode} 正在运行。代码执行、源码写入和提交权限彼此独立。`;
  };
  const renderCourseAi = (snapshot) => {
    const latest = snapshot.proposals.at(-1);
    if (!latest) {
      courseAiState.textContent = 'Course AI 尚未运行。';
      return;
    }
    courseAiState.textContent =
      latest.status === 'COMPLETED'
        ? `${latest.answer} 来源：${latest.sourceCategories.join('、')}`
        : latest.status === 'WAITING_APPROVAL'
          ? '等待审批后调用模型。'
          : latest.status === 'FAILED'
            ? `Course AI 失败：${latest.error}`
            : 'Course AI 正在运行…';
  };
  const renderRecognition = (snapshot) => {
    const pending = snapshot.proposals.filter(
      (proposal) => proposal.status === 'PENDING_CONFIRMATION',
    );
    courseRecognitionState.textContent = pending.length
      ? `有 ${pending.length} 个识别提案待确认（已保留来源与置信度）。`
      : '尚未产生识别提案。导入资料后，识别结果将在用户确认前显示证据。';
  };
  const renderMaterials = (snapshot) => {
    courseMaterialState.textContent = snapshot.materials.length
      ? `已导入 ${snapshot.materials.length} 份课程资料：${snapshot.materials.map((material) => material.originalFileName).join('、')}`
      : '课程资料尚未导入。';
  };
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
      renderRecognition(await window.uniforge.course.recognition.getSnapshot());
      renderCourseAi(await window.uniforge.course.ai.getSnapshot());
      renderAssignments(await window.uniforge.course.assignments.getSnapshot());
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
      courseMaterialImport.addEventListener('click', async () => {
        courseMaterialError.textContent = '';
        try {
          renderMaterials(await window.uniforge.course.materials.chooseAndImport());
        } catch (error) {
          courseMaterialError.textContent =
            error?.message === 'CANCELLED' ? '' : '课程资料导入失败，请检查应用诊断。';
        }
      });
      courseAiForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        courseAiError.textContent = '';
        courseAiState.textContent = 'Course AI 正在运行…';
        try {
          renderCourseAi(
            await window.uniforge.course.ai.ask({
              proposalId: `course-ai-${Date.now()}`,
              question: courseAiQuestion.value,
            }),
          );
        } catch {
          courseAiError.textContent = 'Course AI 请求失败，请检查应用诊断。';
        }
      });
      assignmentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        assignmentError.textContent = '';
        try {
          renderAssignments(
            await window.uniforge.course.assignments.start({
              assignmentId: 'assessment-current',
              mode: assignmentMode.value,
              prompt: assignmentPrompt.value,
            }),
          );
        } catch {
          assignmentError.textContent = '作业模式启动失败，请检查权限或应用诊断。';
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
