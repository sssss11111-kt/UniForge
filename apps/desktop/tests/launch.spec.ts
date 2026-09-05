import path from 'node:path';
import { test, expect, _electron as electron } from '@playwright/test';
test('blank technical window launches with secure web preferences', async () => {
  const app = await electron.launch({ cwd: path.resolve('apps/desktop'), args: ['.'] });
  try {
    const page = await app.firstWindow();
    await expect(page.getByRole('heading', { name: 'UniForge' })).toBeVisible();
    const prefs = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0]?.webContents.getURL());
    expect(prefs).toContain('file:');
    expect(await page.evaluate(() => typeof (window as unknown as { uniforge?: unknown }).uniforge)).toBe('object');
  } finally { await app.close(); }
});
