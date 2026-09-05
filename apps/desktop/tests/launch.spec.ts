import path from 'node:path';
import { test, expect, _electron as electron } from '@playwright/test';
test('app shell exposes primary navigation and roadmap states', async () => {
  const app = await electron.launch({
    cwd: path.resolve('apps/desktop'),
    args: ['.'],
    env: { ...process.env, UF_TEST_MODE: '1' },
  });
  try {
    const page = await app.firstWindow();
    await expect(page.getByRole('heading', { name: 'UniForge' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
    await expect(page.getByRole('button', { name: '00 总览' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('button', { name: '01 Agent 执行中心' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '02 课内学习' })).toBeEnabled();
    await expect(page.getByRole('button', { name: /03 英语备考/ })).toBeDisabled();
    await expect(page.getByText('路线图').first()).toBeVisible();
    const bridge = await page.evaluate(() => {
      const exposed = (
        window as unknown as {
          uniforge?: { version?: unknown; testPreferences?: unknown; health?: unknown };
          require?: unknown;
          process?: unknown;
          electron?: unknown;
        }
      ).uniforge;
      return {
        keys: Object.keys(exposed ?? {}).sort(),
        preferences: exposed?.testPreferences,
        version: exposed?.version,
        requireType: typeof (window as unknown as { require?: unknown }).require,
        processType: typeof (window as unknown as { process?: unknown }).process,
        electronType: typeof (window as unknown as { electron?: unknown }).electron,
      };
    });
    expect(bridge.keys).toEqual(['appShell', 'health', 'settings', 'testPreferences', 'version']);
    expect(bridge.preferences).toEqual({
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    });
    expect(bridge.version).toBe('0.0.0');
    expect(bridge.requireType).toBe('undefined');
    expect(bridge.processType).toBe('undefined');
    expect(bridge.electronType).toBe('undefined');
    await expect(page.getByRole('heading', { name: '运行状态' })).toBeVisible();
    await expect(page.getByText(/默认工作区/)).toBeVisible();
  } finally {
    await app.close();
  }
});
