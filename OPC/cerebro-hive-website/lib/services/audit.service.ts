import { prisma } from '@/lib/prisma';

export class AuditService {
  /**
   * Log an immutable audit event to the database.
   */
  static async log(
    action: string,
    resource: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      await prisma.auditEvent.create({
        data: {
          action,
          resource,
          userId,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // We purposefully do not throw here to prevent audit logging failures
      // from breaking core application flows, but in a strict enterprise setup
      // you might want to forward this to a dead-letter queue or alerting system.
    }
  }
}
