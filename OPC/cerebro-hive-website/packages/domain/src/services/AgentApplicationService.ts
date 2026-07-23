import { AgentRepository, RequestContext } from '@cerebro/database';
import { UnitOfWork } from '../transactions/UnitOfWork';
import { OutboxPublisher } from '../events/OutboxPublisher';
import { AuditLogger } from '../audit/AuditLogger';
import { PolicyEngine } from '../policies/PolicyEngine';
import { AgentValidator } from '../validators/AgentValidator';
import { DomainEvent } from '../events/DomainEvent';

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
    private readonly validator: AgentValidator
  ) {}

  async publishVersion(
    agentId: string, 
    input: { modelId: string; instructions: string; tools: any[]; config?: any },
    context: RequestContext
  ) {
    // 1. Policy check
    const decision = await this.policyEngine.evaluate('CanPublishAgent', context, { agentId });
    if (!decision.allowed) {
      throw new Error(`Access Denied: ${decision.reason}`);
    }

    // 2. Validation
    this.validator.validatePublish(agentId, input.modelId, input.instructions, input.tools);

    // 3. Execute Transaction
    return this.uow.execute(async (tx) => {
      // 3a. Save entity
      const newVersion = await this.agentRepo.publishVersion(agentId, input, { context, tx: tx as any });

      // 3b. Save audit log
      await this.auditLogger.logAction(
        'publish_version', 
        'Agent', 
        agentId, 
        { version: newVersion.version }, 
        context, 
        tx
      );

      // 3c. Save outbox event
      const event = new AgentPublishedEvent(
        agentId, 
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
