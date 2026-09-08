/* global document, window */
(() => {
  const inspector = document.querySelector('.inspector-sidebar');
  const inspectorToggle = document.getElementById('inspector-toggle');
  inspectorToggle?.addEventListener('click', () => {
    const collapsed = inspector?.classList.toggle('is-collapsed') ?? false;
    inspectorToggle.setAttribute('aria-expanded', String(!collapsed));
    inspectorToggle.textContent = collapsed ? '展开状态侧栏' : '收起状态侧栏';
  });
  const navigation = document.getElementById('primary-navigation');
  const description = document.getElementById('module-description');
  const modulePage = document.getElementById('module-page');
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
  const executionForm = document.getElementById('execution-form');
  const executionState = document.getElementById('execution-state');
  const courseNoteForm = document.getElementById('course-note-form');
  const courseNotesState = document.getElementById('course-notes-state');
  const courseNotesError = document.getElementById('course-notes-error');
  const courseMasteryState = document.getElementById('course-mastery-state');
  const courseReviewPlanState = document.getElementById('course-review-plan-state');
  const agentCenterState = document.getElementById('agent-center-state');
  const agentCenterRuns = document.getElementById('agent-center-runs');
  const voiceState = document.getElementById('voice-state');
  const voiceStart = document.getElementById('voice-start');
  const voiceCancel = document.getElementById('voice-cancel');
  const backupCreate = document.getElementById('backup-create');
  const recycleRefresh = document.getElementById('recycle-refresh');
  const appExit = document.getElementById('app-exit');
  const recoveryState = document.getElementById('recovery-state');
  const recycleItems = document.getElementById('recycle-items');
  let activeVoiceRequest;
  let englishOverviewAdapter;
  let projectsOverviewAdapter;
  const renderVoice = (snapshot) => {
    const latest = snapshot.sessions.at(-1);
    voiceState.textContent = latest
      ? `语音：${latest.status}${latest.error ? ` · ${latest.error}` : ''}${latest.text ? ` · ${latest.text}` : ''}`
      : snapshot.sidecar.status === 'unavailable'
        ? `语音不可用：${snapshot.sidecar.reason ?? '未配置语音运行时'}`
        : '语音尚未运行。';
    voiceCancel.disabled =
      !latest || ['COMPLETED', 'FAILED', 'CANCELLED', 'UNAVAILABLE'].includes(latest.status);
  };
  const renderAgentCenter = (snapshot) => {
    agentCenterRuns.replaceChildren();
    if (!snapshot.runs.length) {
      agentCenterState.textContent =
        '暂无 Agent 运行记录。创建任务后，运行、失败、取消和审批状态将在这里保留。';
      return;
    }
    agentCenterState.textContent = `${snapshot.runs.length} 个运行记录，${snapshot.approvals.length} 个等待审批。`;
    snapshot.runs.forEach((run) => {
      const card = document.createElement('article');
      card.className = `dashboard-item dashboard-item-${run.status.toLowerCase()}`;
      const title = document.createElement('h3');
      title.textContent = `${run.taskId} · ${run.status}`;
      const details = document.createElement('p');
      details.textContent = `${run.runtime} · ${run.eventCount} 条事件${run.error ? ` · 失败：${run.error}` : ''}`;
      card.append(title, details);
      agentCenterRuns.append(card);
    });
  };
  const renderReviewPlan = (snapshot) => {
    if (snapshot.state === 'EMPTY') {
      courseReviewPlanState.textContent = '尚未创建考试或复习计划。';
    } else if (snapshot.state === 'WAITING_APPROVAL') {
      courseReviewPlanState.textContent = '复习计划已生成提案，等待审批；尚未安排复习时段。';
    } else if (snapshot.state === 'FAILED') {
      courseReviewPlanState.textContent = `复习计划失败：${snapshot.error ?? 'UNKNOWN'}`;
    } else {
      const latest = snapshot.plans.at(-1);
      courseReviewPlanState.textContent = `复习计划已准备：${latest?.sessions.length ?? 0} 个复习时段，依据掌握度与考试范围。`;
    }
  };
  const renderMastery = (snapshot) => {
    if (snapshot.state === 'EMPTY') {
      courseMasteryState.textContent = '掌握度与错题尚无记录。';
      return;
    }
    if (snapshot.state === 'FAILED') {
      courseMasteryState.textContent = `掌握度加载失败：${snapshot.error ?? 'UNKNOWN'}`;
      return;
    }
    courseMasteryState.textContent = `已记录 ${snapshot.mastery.length} 个知识点掌握度、${snapshot.wrongProblems.length} 道错题；每项均保留来源证据。`;
  };
  const renderNotes = (snapshot) => {
    const latest = snapshot.notes.at(-1);
    if (!latest) {
      courseNotesState.textContent = '课程笔记尚未创建。';
      return;
    }
    courseNotesState.textContent =
      latest.status === 'WAITING_APPROVAL'
        ? 'AI Draft 等待审批，尚未成为正式课程笔记。'
        : latest.status === 'FAILED'
          ? `课程笔记失败：${latest.error}`
          : latest.kind === 'OFFICIAL_COURSE_NOTE'
            ? `Official Course Note 已发布，已展示 diff：${latest.diff ?? '（空）'}`
            : `${latest.kind} 已保存，来源 ${latest.citations.length} 条。`;
  };
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
        item.addEventListener('click', async () => {
          navigation.querySelector('[aria-current="page"]')?.removeAttribute('aria-current');
          item.setAttribute('aria-current', 'page');
          description.textContent =
            module.id === 'overview' ? availableDescription : '该模块已进入开发范围。';
          if (modulePage && module.id === 'english' && englishOverviewAdapter) {
            const viewModel = await englishOverviewAdapter.loadEnglishOverview(window.uniforge);
            const overview = englishOverviewAdapter.renderEnglishOverview(viewModel);
            const study = await englishOverviewAdapter.loadEnglishStudy(window.uniforge);
            modulePage.replaceChildren(overview, englishOverviewAdapter.renderEnglishStudy(study));
          } else if (modulePage && module.id === 'projects' && projectsOverviewAdapter) {
            const viewModel = await projectsOverviewAdapter.loadProjectOverview(window.uniforge);
            const overview = projectsOverviewAdapter.renderProjectOverview(viewModel);
            const flow = await projectsOverviewAdapter.loadProjectTaskFlow(window.uniforge);
            const flowView =
              flow.state === 'ready' || flow.state === 'empty'
                ? projectsOverviewAdapter.renderProjectTaskFlow(flow)
                : projectsOverviewAdapter.renderProjectTaskFlow({
                    tasks: [],
                    decisions: [],
                    artifacts: [],
                  });
            const workspaceView = projectsOverviewAdapter.renderSoftwareWorkspace(
              viewModel.workspace,
            );
            const aiView = projectsOverviewAdapter.renderProjectAiInspector({
              status: 'unavailable',
              reason: 'Project AI 尚未连接；不会伪造模型成功状态。',
            });
            modulePage.replaceChildren(overview, flowView, workspaceView, aiView);
          } else if (modulePage) {
            modulePage.replaceChildren();
            const heading = document.createElement('h2');
            heading.textContent = module.label;
            const body = document.createElement('p');
            body.textContent =
              module.id === 'agent-center'
                ? '查看 Agent 运行、审批、产物和回放。'
                : module.id === 'course'
                  ? '管理课程、资料、作业和复习。'
                  : '该模块的业务快照尚未接入，当前页面保持只读占位。';
            modulePage.append(heading, body);
          }
        });
      } else {
        item.setAttribute('aria-label', `${module.label}（路线图）`);
      }
      navigation.append(item);
    });
    if (modulePage) {
      const heading = document.createElement('h2');
      heading.textContent = '总览工作台';
      const body = document.createElement('p');
      body.textContent = availableDescription;
      modulePage.replaceChildren(heading, body);
    }
  };

  const start = async () => {
    try {
      englishOverviewAdapter = await import('./modules/english.js');
      projectsOverviewAdapter = await import('./modules/projects.js');
      render(await window.uniforge.appShell());
      const snapshot = await window.uniforge.settings.getSnapshot();
      const model = snapshot.models[0];
      settingsSummary.textContent = `${snapshot.workspace.name} · ${snapshot.workspace.status} · 模型 ${model?.model ?? '未配置'} · 外网 ${snapshot.permissions.externalNetwork}`;
      renderDashboard(await window.uniforge.dashboard.getSnapshot());
      renderCourse(await window.uniforge.course.getSnapshot());
      renderRecognition(await window.uniforge.course.recognition.getSnapshot());
      renderCourseAi(await window.uniforge.course.ai.getSnapshot());
      renderAssignments(await window.uniforge.course.assignments.getSnapshot());
      const renderExecution = (snapshot) => {
        const latest = snapshot.results.at(-1);
        executionState.textContent = latest
          ? `代码执行：${latest.status} · stdout: ${latest.stdout || '（空）'}${latest.stderr ? ` · stderr: ${latest.stderr}` : ''}`
          : '代码执行尚未运行。';
      };
      renderExecution(await window.uniforge.course.execution.getSnapshot());
      renderNotes(await window.uniforge.course.notes.getSnapshot());
      renderMastery(await window.uniforge.course.mastery.getSnapshot());
      renderReviewPlan(await window.uniforge.course.reviewPlan.getSnapshot());
      renderAgentCenter(await window.uniforge.agentCenter.getSnapshot());
      renderVoice(await window.uniforge.voice.getSnapshot());
      const renderRecycle = (snapshot) => {
        recycleItems.replaceChildren();
        recoveryState.textContent = `回收站 ${snapshot.entries.length} 项；删除内容在保留期内可恢复。`;
        snapshot.entries.forEach((entry) => {
          const item = document.createElement('button');
          item.type = 'button';
          item.textContent = `恢复 ${entry.entityType}/${entry.entityId}`;
          item.addEventListener('click', async () =>
            renderRecycle(await window.uniforge.recycle.restore(entry.id)),
          );
          recycleItems.append(item);
        });
      };
      renderRecycle(await window.uniforge.recycle.list());
      backupCreate.addEventListener('click', async () => {
        try {
          await window.uniforge.backup.create({ schemaVersion: 1, domainData: {} });
          recoveryState.textContent = '备份已创建并带有可验证清单。';
        } catch (error) {
          recoveryState.textContent =
            error?.message === 'CANCELLED' ? '已取消备份。' : '备份失败，请检查应用诊断。';
        }
      });
      recycleRefresh.addEventListener('click', async () =>
        renderRecycle(await window.uniforge.recycle.list()),
      );
      appExit.addEventListener('click', async () => {
        const decision = await window.uniforge.exit.request({ hasUnsavedChanges: false });
        if (decision.action === 'EXIT') await window.uniforge.exit.shutdown();
      });
      voiceStart.addEventListener('click', async () => {
        activeVoiceRequest = `voice-${Date.now()}`;
        renderVoice({
          sessions: [{ requestId: activeVoiceRequest, status: 'STARTING' }],
          sidecar: { status: 'ready' },
        });
        try {
          renderVoice(
            await window.uniforge.voice.execute({
              requestId: activeVoiceRequest,
              operation: 'STT',
              mode: 'GLOBAL',
              audio: { format: 'wav', base64: '' },
              incognito: true,
              continuous: false,
              wakeWordEnabled: false,
            }),
          );
        } catch (error) {
          voiceState.textContent = `语音请求失败：${error?.message ?? 'UNKNOWN'}`;
        }
      });
      voiceCancel.addEventListener('click', async () => {
        if (!activeVoiceRequest) return;
        try {
          renderVoice(await window.uniforge.voice.cancel(activeVoiceRequest));
        } catch {
          voiceState.textContent = '语音取消失败，请检查应用诊断。';
        }
      });
      executionForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        executionState.textContent = '代码执行等待审批或正在运行…';
        try {
          renderExecution(
            await window.uniforge.course.execution.start({
              executionId: `execution-${Date.now()}`,
              assignmentId: 'assessment-current',
              workspaceRoot: document.getElementById('execution-workspace').value,
              entrypoint: document.getElementById('execution-entrypoint').value,
              operation: document.getElementById('execution-operation').value,
              command: document.getElementById('execution-command').value.trim().split(/\s+/),
              timeoutMs: 10000,
              processLimit: 1,
            }),
          );
        } catch {
          executionState.textContent = '代码执行请求失败，请检查权限或应用诊断。';
        }
      });
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
      courseNoteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        courseNotesError.textContent = '';
        try {
          const payload = {
            commandId: `course-note-${Date.now()}`,
            contentEntityId: 'content-current',
            title: document.getElementById('course-note-title').value,
            body: document.getElementById('course-note-body').value,
            citations: [],
          };
          const kind = document.getElementById('course-note-kind').value;
          renderNotes(
            kind === 'AI_DRAFT'
              ? await window.uniforge.course.notes.createAiDraft(payload)
              : await window.uniforge.course.notes.createPersonal(payload),
          );
        } catch (error) {
          courseNotesError.textContent =
            error?.message === 'PERMISSION_DENIED'
              ? '没有课程笔记写入权限。'
              : '课程笔记保存失败，请检查应用诊断。';
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
