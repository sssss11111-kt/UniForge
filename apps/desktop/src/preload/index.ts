import { contextBridge } from 'electron';
const testArgument = process.argv.find((value) => value.startsWith('--uniforge-test-preferences='));
const testPreferences = testArgument
  ? JSON.parse(testArgument.slice('--uniforge-test-preferences='.length))
  : undefined;
contextBridge.exposeInMainWorld(
  'uniforge',
  Object.freeze({ version: '0.0.0', ...(testPreferences ? { testPreferences } : {}) }),
);
