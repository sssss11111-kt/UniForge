import { describe, expect, it } from 'vitest';
import { redactSecrets, SecretHandle } from '@uniforge/infrastructure';
describe('model secret boundary', () => {
  it('redacts secret-shaped fields and refuses serialization', () => {
    expect(redactSecrets({ apiKey: 'sk-live-secret', nested: { token: 'secret' } })).toEqual({
      apiKey: '[REDACTED]',
      nested: { token: '[REDACTED]' },
    });
    expect(() => String(new SecretHandle('private'))).toThrow();
    expect(() => JSON.stringify(new SecretHandle('private'))).toThrow();
  });
});
