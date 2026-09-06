import { IELTS_SECTIONS, type IeltsWorkspaceInput, type IeltsWorkspaceSnapshot } from '@uniforge/contracts';
export class IeltsWorkspaceService {
  getSnapshot(input: IeltsWorkspaceInput): IeltsWorkspaceSnapshot {
    if (!input.permissions.includes('english:read')) throw new Error('Missing permission: english:read');
    return { status: 'ready', sections: IELTS_SECTIONS, restrictedContentIncluded: false };
  }
}
