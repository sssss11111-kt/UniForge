import { errorState } from '../ui/state.js';
import { snapshotViewModel } from '../ui/view-models.js';

export async function loadAgentCenter(api) {
  try {
    const snapshot = await api.agentCenter.getSnapshot();
    const viewModel = snapshotViewModel(snapshot, false);
    if (viewModel.state === 'error') return viewModel;
    const runs = Array.isArray(snapshot?.runs) ? snapshot.runs : [];
    const approvals = Array.isArray(snapshot?.approvals) ? snapshot.approvals : [];
    return {
      ...snapshotViewModel(snapshot, runs.length === 0 && approvals.length === 0),
      runs,
      approvals,
    };
  } catch (error) {
    return errorState(error);
  }
}
