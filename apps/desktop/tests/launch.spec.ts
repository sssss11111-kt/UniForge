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
    expect(bridge.keys).toEqual(['health', 'testPreferences', 'version']);
    expect(bridge.preferences).toEqual({
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    });
    expect(bridge.version).toBe('0.0.0');
    expect(bridge.requireType).toBe('undefined');
    expect(bridge.processType).toBe('undefined');
    expect(bridge.electronType).toBe('undefined');
  } finally {
    await app.close();
  }
});
