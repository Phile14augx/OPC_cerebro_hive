import { WorkflowRepository, RequestContext } from '@cerebro/database';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { OutboxPublisher } from '../events/OutboxPublisher';
import { AuditLogger } from '../audit/AuditLogger';
import { PolicyEngine } from '../policies/PolicyEngine';
import { WorkflowValidator } from '../validators/WorkflowValidator';
import { DomainEvent } from '../events/DomainEvent';

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
    private readonly validator: WorkflowValidator
  ) {}

  async publishVersion(
    workflowId: string, 
    input: { nodes: any[]; edges: any[] },
    context: RequestContext
  ) {
    // 1. Policy check
    const decision = await this.policyEngine.evaluate('CanPublishWorkflow', context, { workflowId });
    if (!decision.allowed) {
      throw new Error(`Access Denied: ${decision.reason}`);
    }

    // 2. Validation
    this.validator.validatePublish(input.nodes, input.edges);

    // 3. Execute Transaction
    return this.uow.execute(async (tx) => {
      // 3a. Save entity
      const newVersion = await this.workflowRepo.publishVersion(workflowId, input, { context, tx: tx as any });

      // 3b. Save audit log
      await this.auditLogger.logAction(
        'publish_version', 
        'Workflow', 
        workflowId, 
        { version: newVersion.version }, 
        context, 
        tx
      );

      // 3c. Save outbox event
      const event = new WorkflowPublishedEvent(
        workflowId, 
        newVersion.version, 
        context.tenantId, 
        context.workspaceId!, 
        context.userId
      );
      await this.outboxPublisher.publish(event, context, tx);

      return newVersion;
    });
  }
}
