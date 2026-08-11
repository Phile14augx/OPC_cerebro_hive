import type { CreateTwinCommand, IndustryModelProposal, Scope } from '@cerebro/twin-contracts';
type Twin = { id:string; tenantId:string; workspaceId:string; name:string; status:string; activeVersionId:string|null };
type ProposalRecord = { id:string; twinId:string; tenantId:string; workspaceId:string; model:unknown; status:string; createdAt:Date; appliedAt:Date|null; appliedVersion?:VersionRecord|null };
type VersionRecord = { id:string; twinId:string; versionNumber:number; status:string; definition:unknown; sourceProposalId?:string|null; createdAt:Date };
export interface TwinPersistenceClient {
  digitalTwin:{ findFirst(a:any):Promise<Twin|null>; create(a:any):Promise<Twin>; update(a:any):Promise<Twin> };
  twinVersion:{ findFirst(a:any):Promise<VersionRecord|null>; findMany(a:any):Promise<VersionRecord[]>; create(a:any):Promise<VersionRecord>; updateMany(a:any):Promise<{count:number}> };
  twinVersionProposal:{ create(a:any):Promise<ProposalRecord>; findFirst(a:any):Promise<ProposalRecord|null>; update(a:any):Promise<ProposalRecord> };
  $transaction<T>(fn:(tx:TwinPersistenceClient)=>Promise<T>):Promise<T>;
}

function jsonSnapshot<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T; }

export class TwinRepository {
  constructor(private readonly db:TwinPersistenceClient) {}
  getById(scope:Scope,id:string){ return this.db.digitalTwin.findFirst({where:{id,tenantId:scope.tenantId,workspaceId:scope.workspaceId}}); }
  create(command:CreateTwinCommand){ return this.db.$transaction(async tx=>{ const twin=await tx.digitalTwin.create({data:{tenantId:command.tenantId,workspaceId:command.workspaceId,name:command.name}}); const version=await tx.twinVersion.create({data:{twinId:twin.id,versionNumber:1,status:'PUBLISHED',definition:command.definition}}); return tx.digitalTwin.update({where:{id:twin.id},data:{status:'LIVE',activeVersionId:version.id}}); }); }
  publishVersion(scope:Scope,twinId:string,versionId:string){ return this.db.$transaction(async tx=>{ const twin=await tx.digitalTwin.findFirst({where:{id:twinId,tenantId:scope.tenantId,workspaceId:scope.workspaceId}}); if(!twin) throw new Error('TWIN_NOT_FOUND'); await tx.twinVersion.updateMany({where:{twinId,status:'PUBLISHED'},data:{status:'ARCHIVED'}}); await tx.twinVersion.updateMany({where:{id:versionId,twinId},data:{status:'PUBLISHED'}}); return tx.digitalTwin.update({where:{id:twinId},data:{activeVersionId:versionId,status:'LIVE'}}); }); }
  async createVersionProposal(scope:Scope,twinId:string,model:IndustryModelProposal){
    const twin=await this.getById(scope,twinId); if(!twin) throw new Error('TWIN_NOT_FOUND');
    return this.db.twinVersionProposal.create({data:{twinId,tenantId:scope.tenantId,workspaceId:scope.workspaceId,model:jsonSnapshot(model)}});
  }
  applyVersionProposal(scope:Scope,twinId:string,proposalId:string){ return this.db.$transaction(async tx=>{
    const twin=await tx.digitalTwin.findFirst({where:{id:twinId,tenantId:scope.tenantId,workspaceId:scope.workspaceId}}); if(!twin) throw new Error('TWIN_NOT_FOUND');
    // A no-op UPDATE acquires a PostgreSQL row lock for this twin, serializing
    // proposal applications before version-number and active-version reads.
    await tx.digitalTwin.update({where:{id:twin.id},data:{status:twin.status}});
    const proposal=await tx.twinVersionProposal.findFirst({where:{id:proposalId,twinId,tenantId:scope.tenantId,workspaceId:scope.workspaceId},include:{appliedVersion:true}}); if(!proposal) throw new Error('PROPOSAL_NOT_FOUND');
    if(proposal.appliedVersion) return jsonSnapshot(proposal.appliedVersion);
    const model=proposal.model as IndustryModelProposal;
    const latest=await tx.twinVersion.findFirst({where:{twinId},orderBy:{versionNumber:'desc'}});
    await tx.twinVersion.updateMany({where:{twinId,status:'PUBLISHED'},data:{status:'ARCHIVED'}});
    const version=await tx.twinVersion.create({data:{twinId,versionNumber:(latest?.versionNumber??0)+1,status:'PUBLISHED',definition:jsonSnapshot(model.definition),sourceProposalId:proposal.id}});
    await tx.digitalTwin.update({where:{id:twinId},data:{activeVersionId:version.id,status:'LIVE'}});
    await tx.twinVersionProposal.update({where:{id:proposal.id},data:{status:'APPLIED',appliedAt:new Date()}});
    return jsonSnapshot(version);
  }); }
  async listTwinVersions(scope:Scope,twinId:string){ const twin=await this.getById(scope,twinId); if(!twin) throw new Error('TWIN_NOT_FOUND'); return jsonSnapshot(await this.db.twinVersion.findMany({where:{twinId},orderBy:{versionNumber:'asc'}})); }
}
