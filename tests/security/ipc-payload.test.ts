import { describe, expect, it } from 'vitest';
import { validateNoPayload } from '../../packages/contracts/ipc/schemas.js';
describe('IPC payload security', () => {
  it('rejects unexpected payloads', () =>
    expect(() => validateNoPayload({ actor: 'forged' })).toThrow('INVALID_PAYLOAD'));
});
