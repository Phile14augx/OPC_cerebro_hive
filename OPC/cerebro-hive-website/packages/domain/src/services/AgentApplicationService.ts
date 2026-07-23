import { AgentRepository, RequestContext, IdempotencyRepository } from '@cerebro/database';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { OutboxPublisher } from '../events/OutboxPublisher';
import { AuditLogger } from '../audit/AuditLogger';
import { PolicyEngine } from '../policies/PolicyEngine';
import { AgentValidator } from '../validators/AgentValidator';
import { DomainEvent } from '../events/DomainEvent';
import { Result } from '../dto/Result';
import { AuthorizationError, ValidationError, DuplicateCommandError } from '../errors/DomainError';

export class AgentPublishedEvent extends DomainEvent {
  constructor(
    public readonly agentId: string,
    public readonly version: number,
    tenantId: string,
    workspaceId: string,
    userId?: string
  ) {
    super('Agent', agentId, tenantId, workspaceId, userId);
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
    input: { modelId: string; instructions: string; tools: any[]; config?: any },
    context: RequestContext,
    idempotencyKey?: string
  ): Promise<Result<any>> {
    // 1. Policy check
    const decision = await this.policyEngine.evaluate('CanPublishAgent', context, { agentId });
    if (!decision.allowed) {
      return Result.fail(new AuthorizationError(`Access Denied: ${decision.reason}`));
    }

    // 2. Validation
    try {
      this.validator.validatePublish(agentId, input.modelId, input.instructions, input.tools);
    } catch (e: any) {
      return Result.fail(new ValidationError(e.message));
    }

    // 3. Execute Transaction
    return this.uow.execute(async (tx) => {
      // 3a. Idempotency Check
      if (idempotencyKey) {
        const existing = await this.idempotencyRepo.findRecord(idempotencyKey, { context, tx: tx as any });
        if (existing) {
          if (existing.status === 'completed') {
            return Result.ok(existing.responseHash ? JSON.parse(existing.responseHash) : null);
          }
          return Result.fail(new DuplicateCommandError('Operation is currently in progress or failed.'));
        }
        await this.idempotencyRepo.createRecord({ operation: 'publishAgentVersion', requestHash: idempotencyKey }, { context, tx: tx as any });
      }

      // 3b. Save entity
      const newVersion = await this.agentRepo.publishVersion(agentId, input, { context, tx: tx as any });

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
      const event = new AgentPublishedEvent(
        agentId, 
        newVersion.version, 
        context.tenantId, 
        context.workspaceId!, 
        context.userId
      );
      await this.outboxPublisher.publish(event, context, tx);

      // If we had a mechanism to update the idempotency record, we'd do it here. 
      // But we just created it in this transaction, so it will commit with the rest.

      return Result.ok(newVersion);
    });
  }
}

