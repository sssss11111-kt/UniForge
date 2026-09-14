import { describe, expect, it } from 'vitest';
import { SettingsCenter } from './settings-center.js';

describe('SettingsCenter', () => {
  it('returns provider-neutral settings without exposing secrets', async () => {
    const center = new SettingsCenter();
    const snapshot = await center.getSnapshot();

    expect(snapshot.workspace.status).toBe('ACTIVE');
    expect(snapshot.workspace.rootHandle).toBe('workspace:default');
    expect(snapshot.models).toEqual([
      expect.objectContaining({ id: 'local-default', provider: 'local', model: 'unconfigured' }),
    ]);
    expect(snapshot.models[0]).not.toHaveProperty('apiKey');
    expect(snapshot.permissions).toEqual(
      expect.objectContaining({ externalNetwork: 'OFF', modelEgress: 'DENIED' }),
    );
  });

  it('rejects invalid model route updates and accepts a credential reference only', async () => {
    const center = new SettingsCenter();
    await expect(center.updateModel({ id: '', credentialRef: 'secret' })).rejects.toThrow(
      'INVALID_INPUT',
    );
    const snapshot = await center.updateModel({
      id: 'local-default',
      credentialRef: 'os:uniforge/provider/local',
    });
    expect(snapshot.models[0]?.credentialConfigured).toBe(true);
    expect(snapshot.models[0]).not.toHaveProperty('credentialRef');
  });
});
