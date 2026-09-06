import { describe, expect, it } from 'vitest';
import { IeltsWorkspaceService } from './ielts-workspace-service.js';
describe('IeltsWorkspaceService', () => {
  it('returns the complete navigation without bundled restricted content', () => {
    const snapshot = new IeltsWorkspaceService().getSnapshot({ actor: 'user', permissions: ['english:read'] });
    expect(snapshot.sections).toHaveLength(10);
    expect(snapshot.restrictedContentIncluded).toBe(false);
  });
  it('fails closed without permission', () => {
    expect(() => new IeltsWorkspaceService().getSnapshot({ actor: 'user', permissions: [] })).toThrow('english:read');
  });
});
