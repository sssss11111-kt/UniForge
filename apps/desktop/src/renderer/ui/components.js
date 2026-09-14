const appendChildren = (node, children) => {
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child === null || child === undefined || child === false) continue;
    node.append(
      child && typeof child === 'object' && 'nodeType' in child
        ? child
        : globalThis.document.createTextNode(String(child)),
    );
  }
  return node;
};

export function el(tag, attributes = {}, children = []) {
  const node = globalThis.document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'className') node.className = String(value);
    else if (key === 'textContent') node.textContent = String(value);
    else if (key.startsWith('on') && typeof value === 'function')
      node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, String(value));
  }
  return appendChildren(node, children);
}

export function statusBadge({ label, tone = 'neutral', state }) {
  return el(
    'span',
    { className: `uf-status-badge uf-tone-${tone}`, role: 'status', 'data-state': state },
    [label],
  );
}

export function emptyState({ title, description, action }) {
  const node = el('section', { className: 'uf-state uf-state-empty' }, [
    el('h2', {}, [title]),
    el('p', {}, [description]),
  ]);
  if (action) node.append(action);
  return node;
}

export function errorState({ title, message, diagnosticRef, retry }) {
  const node = el('section', { className: 'uf-state uf-state-error', role: 'alert' }, [
    el('h2', {}, [title]),
    el('p', {}, [message]),
  ]);
  if (diagnosticRef) node.append(el('small', {}, [`诊断编号：${diagnosticRef}`]));
  if (retry) node.append(el('button', { type: 'button', onClick: retry }, ['重试']));
  return node;
}

export function permissionNotice({ operation, scope, reason, approvalRequired = false }) {
  return el('aside', { className: 'uf-permission-notice' }, [
    el('strong', {}, [approvalRequired ? '需要审批' : '权限范围']),
    el('p', {}, [`操作：${operation}`]),
    el('p', {}, [`范围：${scope}`]),
    el('p', {}, [`原因：${reason}`]),
  ]);
}

export function approvalCard({ id, operation, scope, reason, expiresAt, onApprove, onDeny }) {
  return el('article', { className: 'uf-approval-card', 'data-approval-id': id }, [
    el('h3', {}, ['审批请求']),
    permissionNotice({ operation, scope, reason, approvalRequired: true }),
    el('small', {}, [`有效期至：${expiresAt}`]),
    el('div', { className: 'uf-action-row' }, [
      el('button', { type: 'button', 'data-action': 'approve', onClick: onApprove }, ['允许一次']),
      el('button', { type: 'button', 'data-action': 'deny', onClick: onDeny }, ['拒绝']),
    ]),
  ]);
}

export function sourceBadge({ kind, verified = false }) {
  return el('span', { className: 'uf-source-badge', 'data-verified': String(verified) }, [
    `${kind}${verified ? ' · 已核验' : ' · 未核验'}`,
  ]);
}

export function taskRow({ title, status, owner, deadline, evidenceCount = 0 }) {
  return el('article', { className: 'uf-task-row' }, [
    el('strong', {}, [title]),
    statusBadge({ label: status, state: status, tone: 'neutral' }),
    el('small', {}, [`负责人：${owner} · 截止：${deadline} · 证据：${evidenceCount}`]),
  ]);
}

export function agentRunTimeline({ run, events = [] }) {
  return el(
    'ol',
    { className: 'uf-agent-timeline', 'aria-label': `Agent 运行 ${run?.id ?? ''}` },
    events.map((event) =>
      el('li', { className: `uf-event uf-event-${event.status ?? 'neutral'}` }, [
        el('strong', {}, [event.title ?? event.type ?? '步骤']),
        el('small', {}, [event.status ?? 'unknown']),
      ]),
    ),
  );
}

export function inspectorPanel({ title, content, open = true }) {
  return el(
    'aside',
    { className: `uf-inspector ${open ? 'is-open' : 'is-collapsed'}`, 'data-open': String(open) },
    [el('h2', {}, [title]), content],
  );
}
