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
      // from breaking core application flows. Instead, we enqueue it to the background worker.
      try {
        const { auditQueue } = await import('@/lib/queue/client');
        await auditQueue.add('retryAuditLog', { action, resource, userId, metadata });
      } catch (queueError) {
        console.error('CRITICAL: Failed to enqueue audit log fallback:', queueError);
      }
    }
  }
}
