import type { IndustryModelProposal, Scope } from '@cerebro/twin-contracts';
import { getTwin } from './twin-service';
type VersionProposal={id:string;twinId:string;scope:Scope;model:IndustryModelProposal;status:'PREVIEW'|'APPLIED';createdAt:Date;appliedAt?:Date};
const proposals=new Map<string,VersionProposal>();
const versions=new Map<string,Array<{version:number;definition:IndustryModelProposal['definition'];sourceProposalId:string}>>();
export function createVersionProposal(scope:Scope,twinId:string,model:IndustryModelProposal){ if(!getTwin(scope,twinId)) throw new Error('TWIN_NOT_FOUND'); const proposal:VersionProposal={id:`version-proposal-${crypto.randomUUID()}`,twinId,scope,model,status:'PREVIEW',createdAt:new Date()}; proposals.set(proposal.id,proposal); return proposal; }
export function applyVersionProposal(scope:Scope,proposalId:string,approved:boolean){ const proposal=proposals.get(proposalId); if(!proposal||proposal.scope.tenantId!==scope.tenantId||proposal.scope.workspaceId!==scope.workspaceId) throw new Error('PROPOSAL_NOT_FOUND'); if(!approved) throw new Error('APPROVAL_REQUIRED'); if(proposal.status==='APPLIED') return proposal; const current=versions.get(proposal.twinId)??[]; current.push({version:current.length+2,definition:proposal.model.definition,sourceProposalId:proposal.id}); versions.set(proposal.twinId,current); proposal.status='APPLIED'; proposal.appliedAt=new Date(); return proposal; }
export function listAppliedVersions(scope:Scope,twinId:string){ if(!getTwin(scope,twinId)) throw new Error('TWIN_NOT_FOUND'); return versions.get(twinId)??[]; }
