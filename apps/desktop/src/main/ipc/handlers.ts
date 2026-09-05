import { registerIpcHandlers } from './register.js';
export const registerHandlers = (version: string): void => registerIpcHandlers(version);
