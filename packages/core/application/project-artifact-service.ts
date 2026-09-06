import type { CreateArtifactInput, ProjectArtifact, ProjectDecision } from '@uniforge/contracts';
export class ProjectArtifactService {
  private readonly artifacts = new Map<string, ProjectArtifact>();
  private readonly decisions = new Map<string, ProjectDecision>();
  create(input: CreateArtifactInput): ProjectArtifact {
    if (!input.permissions.includes('project:write'))
      throw new Error('Missing permission: project:write');
    if (!input.artifact.evidenceIds.length) throw new Error('Evidence required');
    if (this.artifacts.has(input.artifact.id)) throw new Error('Artifact already exists');
    const a = {
      ...input.artifact,
      evidenceIds: [...input.artifact.evidenceIds],
      status: 'DRAFT' as const,
    };
    this.artifacts.set(a.id, a);
    return { ...a, evidenceIds: [...a.evidenceIds] };
  }
  review(id: string, permissions: readonly string[]): ProjectArtifact {
    if (!permissions.includes('project:write'))
      throw new Error('Missing permission: project:write');
    const a = this.artifacts.get(id);
    if (!a) throw new Error('Artifact not found');
    const r = { ...a, status: 'REVIEW' as const };
    this.artifacts.set(id, r);
    return { ...r, evidenceIds: [...r.evidenceIds] };
  }
  decide(input: { decision: ProjectDecision; permissions: readonly string[] }): ProjectDecision {
    if (!input.permissions.includes('project:write'))
      throw new Error('Missing permission: project:write');
    if (!input.decision.artifactIds.length) throw new Error('Artifact evidence required');
    const d = {
      ...input.decision,
      artifactIds: [...input.decision.artifactIds],
      status: 'PROPOSED' as const,
    };
    this.decisions.set(d.id, d);
    return { ...d, artifactIds: [...d.artifactIds] };
  }
}
