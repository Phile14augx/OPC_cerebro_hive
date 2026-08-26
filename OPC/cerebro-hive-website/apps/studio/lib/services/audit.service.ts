import type { Prisma } from '@cerebro/db';
import { prisma } from '@/lib/prisma';

type AuditLogClient = Pick<Prisma.TransactionClient, 'auditLog'>;

export interface AuditLogWrite {
  workspaceId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
}

export class AuditService {
  /**
   * Persist an audit record against an explicit, already-authorized workspace.
   * Errors intentionally propagate so callers can include the write in their transaction.
   */
  static async write(entry: AuditLogWrite, client: AuditLogClient = prisma) {
    return client.auditLog.create({
      data: {
        workspaceId: entry.workspaceId,
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        metadata: entry.metadata,
      },
    });
  }
}
