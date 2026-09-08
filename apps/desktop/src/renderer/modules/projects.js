export function roadmapModule({ id = 'projects', label = '项目实践', secondaryItems = [] } = {}) {
  return { id, label, secondaryItems: [...secondaryItems], state: 'roadmap' };
}

export async function loadProjectOverview(api) {
  try {
    const snapshot = await api?.project?.getSnapshot?.();
    if (!snapshot) return { state: 'roadmap', reason: '项目 IPC 尚未启用' };
    const projectCount = Number(snapshot.projectCount ?? 0);
    return {
      state: projectCount ? 'ready' : 'empty',
      projectCount,
      taskCount: Number(snapshot.taskCount ?? 0),
      runningExecutions: Number(snapshot.runningExecutions ?? 0),
      reviewArtifacts: Number(snapshot.reviewArtifacts ?? 0),
      failedOperations: Number(snapshot.failedOperations ?? 0),
      capabilityBlocks: ['Tasks', 'Files', 'Project AI', 'Decisions', 'Artifacts'],
      workspace: { authorized: false, canonicalPath: null },
    };
  } catch (error) {
    return {
      state: 'error',
      error: { message: error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR') },
    };
  }
}
