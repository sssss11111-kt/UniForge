export type ArtifactStatus='DRAFT'|'REVIEW'|'ACCEPTED'|'REJECTED'; export interface ProjectArtifact { id:string; projectId:string; taskId:string; path:string; kind:'BUILD'|'TEST_REPORT'|'PATCH'|'DOCUMENT'; status:ArtifactStatus; evidenceIds:readonly string[]; }
export interface ProjectDecision { id:string; projectId:string; title:string; rationale:string; artifactIds:readonly string[]; status:'PROPOSED'|'ACCEPTED'|'REJECTED'; }
export interface CreateArtifactInput { artifact:ProjectArtifact; permissions:readonly string[]; }
