import { errorState } from '../ui/state.js';
import { snapshotViewModel } from '../ui/view-models.js';

export async function loadOverview(api) {
  try {
    const snapshot = await api.dashboard.getSnapshot();
    const viewModel = snapshotViewModel(snapshot, false);
    if (viewModel.state === 'error') return viewModel;
    const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
    const approvals =
      typeof snapshot?.pendingApprovalCount === 'number' && snapshot.pendingApprovalCount >= 0
        ? snapshot.pendingApprovalCount
        : 0;
    const empty = items.length === 0 || items.every((item) => item?.state === 'EMPTY');
    return {
      ...snapshotViewModel(snapshot, empty),
      workspace: {
        name: snapshot.workspaceName,
        status: snapshot.workspaceStatus,
      },
      items,
      approvals,
    };
  } catch (error) {
    return errorState(error);
  }
}
