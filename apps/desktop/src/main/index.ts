import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const testPreferences =
  process.env.UF_TEST_MODE === '1'
    ? JSON.stringify({ nodeIntegration: false, contextIsolation: true, sandbox: true })
    : undefined;

const createWindow = (): void => {
  const window = new BrowserWindow({
    width: 900,
    height: 600,
    show: true,
    webPreferences: {
      preload: path.join(currentDir, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      ...(testPreferences
        ? { additionalArguments: [`--uniforge-test-preferences=${testPreferences}`] }
        : {}),
    },
  });
  void window.loadFile(path.join(currentDir, '../renderer/index.html'));
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
