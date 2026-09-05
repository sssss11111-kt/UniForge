import { describe, expect, it } from 'vitest';
import { isSidecarResponse, SIDECAR_PROTOCOL_VERSION } from '@uniforge/platform-sidecar';

describe('sidecar protocol', () => {
  it('accepts versioned success and rejects malformed messages', () => {
    expect(
      isSidecarResponse({
        protocolVersion: SIDECAR_PROTOCOL_VERSION,
        requestId: 'r1',
        ok: true,
        result: { status: 'ready' },
      }),
    ).toBe(true);
    expect(isSidecarResponse({ protocolVersion: 2, requestId: 'r1', ok: true })).toBe(false);
    expect(isSidecarResponse({ protocolVersion: 1, requestId: 'r1', ok: false })).toBe(false);
  });
});
