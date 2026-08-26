import { AgentRepository, RequestContext, IdempotencyRepository, PrismaTransactionClient } from '@cerebro/db';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { OutboxPublisher } from '../events/OutboxPublisher';
import { AuditLogger } from '../audit/AuditLogger';
import { PolicyEngine } from '../policies/PolicyEngine';
import { AgentValidator } from '../validators/AgentValidator';
import { DomainEvent } from '../events/DomainEvent';
import { Result } from '../dto/Result';
import { AuthorizationError, ValidationError, DuplicateCommandError } from '../errors/DomainError';

export class AgentPublishedEvent extends DomainEvent<undefined> {
  constructor(
    public readonly agentId: string,
    public readonly version: number,
    tenantId: string,
    workspaceId: string,
    userId?: string
  ) {
    super('Agent', agentId, tenantId, workspaceId, userId, undefined, undefined, undefined);
  }
}

export class AgentApplicationService {
  constructor(
    private readonly agentRepo: AgentRepository,
    private readonly uow: UnitOfWork,
    private readonly outboxPublisher: OutboxPublisher,
    private readonly auditLogger: AuditLogger,
    private readonly policyEngine: PolicyEngine,
    private readonly validator: AgentValidator,
    private readonly idempotencyRepo: IdempotencyRepository
  ) {}

  async publishVersion(
    agentId: string, 
    input: { modelId: string; instructions: string; tools: unknown[]; config?: unknown },
    context: RequestContext,
    idempotencyKey?: string
  ): Promise<Result<unknown>> {
    // 1. Policy check
    const decision = await this.policyEngine.evaluate('CanPublishAgent', context, { agentId });
    if (!decision.allowed) {
      return Result.fail(new AuthorizationError(`Access Denied: ${decision.reason}`));
    }

    // 2. Validation
    try {
      this.validator.validatePublish(agentId, input.modelId, input.instructions, input.tools);
    } catch (error: unknown) {
      return Result.fail(new ValidationError(error instanceof Error ? error.message : String(error)));
    }

    // 3. Execute Transaction
    return this.uow.execute(async (tx) => {
      // 3a. Idempotency Check
      if (idempotencyKey) {
        const dbTx = tx as unknown as PrismaTransactionClient;
        const existing = await this.idempotencyRepo.findRecord(idempotencyKey, { context, tx: dbTx });
        if (existing) {
          if (existing.status === 'completed') {
            return Result.ok(existing.responseHash ? JSON.parse(existing.responseHash) : null);
          }
          return Result.fail(new DuplicateCommandError('Operation is currently in progress or failed.'));
        }
        await this.idempotencyRepo.createRecord({ operation: 'publishAgentVersion', requestHash: idempotencyKey }, { context, tx: dbTx });
      }

      // 3b. Save entity
      const newVersion = await this.agentRepo.publishVersion(agentId, input, {
        context,
        tx: tx as unknown as PrismaTransactionClient,
      });

      // 3c. Save audit log
      await this.auditLogger.logAction(
        'publish_version', 
        'Agent', 
        agentId, 
        { version: newVersion.version }, 
        context, 
        tx
      );

      // 3d. Save outbox event
      const workspaceId = context.workspaceId;
      if (!workspaceId) {
        throw new Error('RequestContext must provide a workspaceId to access this repository.');
      }
      const event = new AgentPublishedEvent(
        agentId, 
        newVersion.version, 
        context.tenantId, 
        workspaceId,
        context.userId
      );
      await this.outboxPublisher.publish(event, context, tx);

      // If we had a mechanism to update the idempotency record, we'd do it here. 
      // But we just created it in this transaction, so it will commit with the rest.

      return Result.ok(newVersion);
    });
  }
}

