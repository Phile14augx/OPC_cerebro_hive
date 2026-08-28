import { AuditRepository, RequestContext, PrismaTransactionClient } from '@cerebro/db';
import { ITransactionContext } from '../transactions/UnitOfWork';

export class AuditLogger {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logAction(
    action: string,
    resource: string,
    resourceId: string | undefined,
    metadata: unknown,
    context: RequestContext,
    tx?: ITransactionContext
  ): Promise<void> {
    await this.auditRepository.log(
      { action, resource, resourceId, metadata },
      { context, tx: tx as unknown as PrismaTransactionClient }
    );
  }
}
