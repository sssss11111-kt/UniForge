import { app, BrowserWindow } from 'electron';
import path from 'node:path';

const createWindow = (): void => {
  const window = new BrowserWindow({
    width: 900,
    height: 600,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  void window.loadFile(path.join(__dirname, '../renderer/index.html'));
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
