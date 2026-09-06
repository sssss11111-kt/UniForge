import type { MemoryClaim } from '@uniforge/contracts';
interface AdmitMemoryInput { claim: MemoryClaim; permissions: readonly string[]; }
export class MemoryService {
 private readonly claims=new Map<string,MemoryClaim>();
 admit(input:AdmitMemoryInput):MemoryClaim { if(!input.permissions.includes('memory:write')) throw new Error('Missing permission: memory:write'); if(!input.claim.evidenceIds.length) throw new Error('Provenance required'); if(input.claim.outcome!=='ADMITTED') throw new Error('Admission outcome required'); this.claims.set(input.claim.claimId,{...input.claim,evidenceIds:[...input.claim.evidenceIds]}); return {...input.claim,evidenceIds:[...input.claim.evidenceIds]}; }
 forget(id:string,permissions:readonly string[]):MemoryClaim { if(!permissions.includes('memory:forget')) throw new Error('Missing permission: memory:forget'); const c=this.claims.get(id); if(!c) throw new Error('Memory claim not found'); const forgotten={...c,outcome:'FORGOTTEN' as const}; this.claims.set(id,forgotten); return {...forgotten,evidenceIds:[...forgotten.evidenceIds]}; }
 get(id:string,permissions:readonly string[]):MemoryClaim|null { if(!permissions.includes('memory:read')) throw new Error('Missing permission: memory:read'); const c=this.claims.get(id); return c?{...c,evidenceIds:[...c.evidenceIds]}:null; }
}
