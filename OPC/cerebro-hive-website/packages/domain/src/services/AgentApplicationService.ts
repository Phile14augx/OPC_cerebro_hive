import { AgentRepository, RequestContext, IdempotencyRepository } from '@cerebro/db';
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
    const decision = await this.policyEngine.evaluate('CanPublishAgent', context, { agentId });
    if (!decision.allowed) {
      return Result.fail(new AuthorizationError(`Access Denied: ${decision.reason}`));
    }
    void input;
    void idempotencyKey;
    return Result.fail(new ValidationError('Legacy direct AgentVersion publication is disabled; publish the AgentDraft through /v1/agents/:id/publish'));
  }
}

