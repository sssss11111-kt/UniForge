import { errorState } from '../ui/state.js';
import { snapshotViewModel } from '../ui/view-models.js';

export async function loadCourse(api) {
  try {
    if (typeof api?.course?.getSnapshot !== 'function') {
      return errorState(new Error('SNAPSHOT_UNAVAILABLE'));
    }
    const snapshot = await api.course.getSnapshot();
    const viewModel = snapshotViewModel(snapshot, false);
    if (viewModel.state === 'error') return viewModel;
    const course = snapshot?.course;
    const empty = !course || !course.name;
    return { ...snapshotViewModel(snapshot, empty), course };
  } catch (error) {
    return errorState(error);
  }
}
