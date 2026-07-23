import { AuditLog } from '@prisma/client';
import { BaseRepository, IRepositoryOptions } from './BaseRepository';

export interface CreateAuditLogInput {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
}

export class AuditRepository extends BaseRepository {
  async log(input: CreateAuditLogInput, options: IRepositoryOptions): Promise<AuditLog> {
    const db = this.getClient(options);
    const { workspaceId, userId } = options.context;

    if (!workspaceId) {
      throw new Error('Audit logging requires a workspace context.');
    }

    return db.auditLog.create({
      data: {
        workspaceId,
        userId: userId || null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
      }
    });
  }
}
