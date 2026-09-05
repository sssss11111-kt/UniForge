import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: 'apps/desktop/tests', timeout: 30_000 });
