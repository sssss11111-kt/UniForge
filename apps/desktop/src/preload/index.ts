import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('uniforge', Object.freeze({ version: '0.0.0' }));
