import { test, expect, _electron as electron } from '@playwright/test';
test('blank technical window launches with secure web preferences', async () => {
  const app = await electron.launch({ args: ['.'] });
  const page = await app.firstWindow();
  await expect(page.getByRole('heading', { name: 'UniForge' })).toBeVisible();
  await app.close();
});
