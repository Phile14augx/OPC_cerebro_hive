import type { CreateTwinCommand, Scope } from '@cerebro/twin-contracts';
type Twin = { id:string; tenantId:string; workspaceId:string; name:string; status:string; activeVersionId:string|null };
export interface TwinPersistenceClient { digitalTwin:{ findFirst(a:unknown):Promise<Twin|null>; create(a:unknown):Promise<Twin>; update(a:unknown):Promise<Twin> }; twinVersion:{ create(a:unknown):Promise<{id:string}>; updateMany(a:unknown):Promise<{count:number}> }; $transaction<T>(fn:(tx:TwinPersistenceClient)=>Promise<T>):Promise<T> }
export class TwinRepository {
  constructor(private readonly db:TwinPersistenceClient) {}
  getById(scope:Scope,id:string){ return this.db.digitalTwin.findFirst({where:{id,tenantId:scope.tenantId,workspaceId:scope.workspaceId}}); }
  create(command:CreateTwinCommand){ return this.db.$transaction(async tx=>{ const twin=await tx.digitalTwin.create({data:{tenantId:command.tenantId,workspaceId:command.workspaceId,name:command.name}}); const version=await tx.twinVersion.create({data:{twinId:twin.id,versionNumber:1,status:'PUBLISHED',definition:command.definition}}); return tx.digitalTwin.update({where:{id:twin.id},data:{status:'LIVE',activeVersionId:version.id}}); }); }
  publishVersion(scope:Scope,twinId:string,versionId:string){ return this.db.$transaction(async tx=>{ const twin=await tx.digitalTwin.findFirst({where:{id:twinId,tenantId:scope.tenantId,workspaceId:scope.workspaceId}}); if(!twin) throw new Error('TWIN_NOT_FOUND'); await tx.twinVersion.updateMany({where:{twinId,status:'PUBLISHED'},data:{status:'ARCHIVED'}}); await tx.twinVersion.updateMany({where:{id:versionId,twinId},data:{status:'PUBLISHED'}}); return tx.digitalTwin.update({where:{id:twinId},data:{activeVersionId:versionId,status:'LIVE'}}); }); }
}
