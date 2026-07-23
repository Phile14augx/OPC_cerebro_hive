import { AuditRepository, RequestContext } from '@cerebro/database';
import { ITransactionContext } from '../transactions/UnitOfWork';

export class AuditLogger {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logAction(
    action: string,
    resource: string,
    resourceId: string | undefined,
    metadata: any,
    context: RequestContext,
    tx?: ITransactionContext
  ): Promise<void> {
    await this.auditRepository.log(
      { action, resource, resourceId, metadata },
      { context, tx: tx as any }
    );
  }
}
