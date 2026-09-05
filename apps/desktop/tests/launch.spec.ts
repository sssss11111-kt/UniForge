import path from 'node:path';
import { test, expect, _electron as electron } from '@playwright/test';
test('blank technical window launches with secure web preferences', async () => {
  const app = await electron.launch({
    cwd: path.resolve('apps/desktop'),
    args: ['.'],
    env: { ...process.env, UF_TEST_MODE: '1' },
  });
  try {
    const page = await app.firstWindow();
    await expect(page.getByRole('heading', { name: 'UniForge' })).toBeVisible();
    const prefs = await page.evaluate(
      () =>
        (window as unknown as { uniforge?: { testPreferences?: unknown } }).uniforge
          ?.testPreferences,
    );
    expect(prefs).toEqual({ nodeIntegration: false, contextIsolation: true, sandbox: true });
    expect(
      await page.evaluate(() => typeof (window as unknown as { uniforge?: unknown }).uniforge),
    ).toBe('object');
  } finally {
    await app.close();
  }
});
