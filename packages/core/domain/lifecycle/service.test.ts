import { describe, expect, it } from 'vitest';
import { ExitCoordinator, type ShutdownParticipant } from './service.js';

describe('ExitCoordinator', () => {
  it('asks for confirmation when unsaved state exists', () => {
    const coordinator = new ExitCoordinator([]);
    expect(coordinator.decide({ hasUnsavedChanges: true })).toEqual({
      action: 'CONFIRM_UNSAVED',
    });
  });

  it('closes to tray without stopping services when requested', async () => {
    const stopped: string[] = [];
    const participants: ShutdownParticipant[] = [
      {
        name: 'agent',
        stop: async () => {
          stopped.push('agent');
        },
      },
    ];
    const coordinator = new ExitCoordinator(participants);
    expect(coordinator.decide({ hasUnsavedChanges: false, closeToTray: true })).toEqual({
      action: 'CLOSE_TO_TRAY',
    });
    await coordinator.shutdown();
    expect(stopped).toEqual([]);
  });

  it('stops every participant on full exit and records failures', async () => {
    const stopped: string[] = [];
    const coordinator = new ExitCoordinator([
      {
        name: 'agent',
        stop: async () => {
          stopped.push('agent');
        },
      },
      {
        name: 'connector',
        stop: async () => {
          throw new Error('offline');
        },
      },
      {
        name: 'news',
        stop: async () => {
          stopped.push('news');
        },
      },
      {
        name: 'cloud-request',
        stop: async () => {
          stopped.push('cloud-request');
        },
      },
      {
        name: 'background-collection',
        stop: async () => {
          stopped.push('background-collection');
        },
      },
    ]);
    expect(coordinator.decide({ hasUnsavedChanges: true, confirmUnsaved: true })).toEqual({
      action: 'EXIT',
    });
    const result = await coordinator.shutdown();
    expect(stopped).toEqual(['agent', 'news', 'cloud-request', 'background-collection']);
    expect(result.failures).toEqual([{ participant: 'connector', message: 'offline' }]);
  });
});
