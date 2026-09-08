import path from 'node:path';
import { test, expect, _electron as electron } from '@playwright/test';

test('warm shell meets desktop layout and responsive constraints', async () => {
  const app = await electron.launch({ cwd: path.resolve('apps/desktop'), args: ['.'] });
  try {
    const page = await app.firstWindow();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('[data-region="inspector"]')).toBeVisible();
    await expect(page.locator('[data-region="command"]')).toBeVisible();
    expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgb(244, 239, 231)',
    );
    expect(
      await page.locator('.command-bar').evaluate((el) => el.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(64);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      1440,
    );
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(page.locator('[data-region="inspector"]')).toBeHidden();
  } finally {
    await app.close();
  }
});

test('shell controls are keyboard reachable and roadmap actions remain disabled', async () => {
  const app = await electron.launch({ cwd: path.resolve('apps/desktop'), args: ['.'] });
  try {
    const page = await app.firstWindow();
    await page.locator('button').first().focus();
    await expect(page.locator(':focus-visible')).toBeVisible();
    await expect(page.getByRole('button', { name: /03 英语备考/ })).toBeEnabled();
    await expect(page.getByRole('button', { name: /04 项目实践/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /05 知识与情报/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /06 AI 新闻/ })).toBeDisabled();
  } finally {
    await app.close();
  }
});
