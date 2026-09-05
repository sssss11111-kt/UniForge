import { describe, expect, it } from 'vitest';
import { NativeRuntimeService } from './runtime.js';
describe('native runtime', () =>
  it('rejects cancelled execution', async () => {
    const n = new NativeRuntimeService({
      generate: async () => {
        throw new Error('called');
      },
    } as never);
    await expect(n.execute({} as never, AbortSignal.abort())).rejects.toThrow('CANCELLED');
  }));
