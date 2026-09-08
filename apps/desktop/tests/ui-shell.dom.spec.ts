import path from 'node:path';
import { test, expect, _electron as electron } from '@playwright/test';

test('shell regions, disabled routes, inspector and text rendering work in Electron', async () => {
  const app = await electron.launch({ cwd: path.resolve('apps/desktop'), args: ['.'] });
  try {
    const page = await app.firstWindow();
    await page.evaluate(async () => {
      const base = new URL('./ui/', globalThis.location.href);
      const { createAppShell } = await import(new URL('layout.js', base).href);
      const { navigationRegistry } = await import(new URL('navigation.js', base).href);
      const { statusBadge } = await import(new URL('components.js', base).href);
      const shell = createAppShell({
        registry: navigationRegistry,
        activeRoute: 'overview',
        onNavigate: (id: string) => {
          globalThis.document.body.dataset.route = id;
        },
      });
      globalThis.document.body.replaceChildren(shell);
      shell
        .querySelector('[data-region="main"]')
        .append(statusBadge({ label: '<img src=x onerror=alert(1)>', state: 'running' }));
    });
    for (const region of ['primary', 'secondary', 'main', 'inspector', 'command']) {
      await expect(page.locator(`[data-region="${region}"]`)).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /03 英语备考/ })).toBeEnabled();
    await expect(page.getByRole('button', { name: /执行命令/ })).toBeDisabled();
    await expect(page.locator('img')).toHaveCount(0);
    await page.getByRole('button', { name: '02 课内学习', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-route', 'course');
    await page.getByRole('button', { name: '收起状态侧栏' }).click();
    await expect(page.locator('[data-region="inspector"]')).toBeHidden();
    await page.getByRole('button', { name: '展开状态侧栏' }).click();
    await expect(page.locator('[data-region="inspector"]')).toBeVisible();
  } finally {
    await app.close();
  }
});
