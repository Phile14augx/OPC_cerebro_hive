import { WorkflowRepository, RequestContext, IdempotencyRepository } from '@cerebro/database';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { OutboxPublisher } from '../events/OutboxPublisher';
import { AuditLogger } from '../audit/AuditLogger';
import { PolicyEngine } from '../policies/PolicyEngine';
import { WorkflowValidator } from '../validators/WorkflowValidator';
import { DomainEvent } from '../events/DomainEvent';
import { Result } from '../dto/Result';
import { AuthorizationError, ValidationError, DuplicateCommandError } from '../errors/DomainError';

export class WorkflowPublishedEvent extends DomainEvent {
  constructor(
    public readonly workflowId: string,
    public readonly version: number,
    tenantId: string,
    workspaceId: string,
    userId?: string
  ) {
    super('Workflow', workflowId, tenantId, workspaceId, userId);
  }
}

export class WorkflowApplicationService {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly uow: UnitOfWork,
    private readonly outboxPublisher: OutboxPublisher,
    private readonly auditLogger: AuditLogger,
    private readonly policyEngine: PolicyEngine,
    private readonly validator: WorkflowValidator,
    private readonly idempotencyRepo: IdempotencyRepository
  ) {}

  async publishVersion(
    workflowId: string, 
    input: { nodes: any[]; edges: any[] },
    context: RequestContext,
    idempotencyKey?: string
  ): Promise<Result<any>> {
    // 1. Policy check
    const decision = await this.policyEngine.evaluate('CanPublishWorkflow', context, { workflowId });
    if (!decision.allowed) {
      return Result.fail(new AuthorizationError(`Access Denied: ${decision.reason}`));
    }

    // 2. Validation
    try {
      this.validator.validatePublish(input.nodes, input.edges);
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
        await this.idempotencyRepo.createRecord({ operation: 'publishWorkflowVersion', requestHash: idempotencyKey }, { context, tx: tx as any });
      }

      // 3b. Save entity
      const newVersion = await this.workflowRepo.publishVersion(workflowId, input, { context, tx: tx as any });

      // 3c. Save audit log
      await this.auditLogger.logAction(
        'publish_version', 
        'Workflow', 
        workflowId, 
        { version: newVersion.version }, 
        context, 
        tx
      );

      // 3d. Save outbox event
      const event = new WorkflowPublishedEvent(
        workflowId, 
        newVersion.version, 
        context.tenantId, 
        context.workspaceId!, 
        context.userId
      );
      await this.outboxPublisher.publish(event, context, tx);

      return Result.ok(newVersion);
    });
  }
}

