import { AgentDraftDocumentV1Schema } from '@cerebro/agent-registry-contracts';
import type { AgentDraftDocumentV1 } from '@cerebro/agent-registry-contracts';
import type { AgentRepository } from '@cerebro/db';
import { Result } from '../dto/Result';
import { AgentRegistryActorContext, AgentRegistryError, normalizeAgentRegistryError, requireAgentCapability } from './AgentRegistryErrors';

export class AgentDraftService {
  constructor(private readonly repository: AgentRepository) {}

  async get(agentId: string, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.read');
    if (denied) return Result.fail(denied);
    try {
      const draft = await this.repository.getDraft(agentId, { context });
      if (!draft) return Result.fail(new AgentRegistryError('AGENT_NOT_FOUND', 'Agent draft not found'));
      if (!context.permissions.includes('agent.draft.edit')) {
        const { definition: _definition, validationErrors: _errors, ...metadata } = draft;
        return Result.ok(metadata);
      }
      return Result.ok(draft);
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }

  async update(agentId: string, input: { expectedRevision: number; definition: AgentDraftDocumentV1 }, context: AgentRegistryActorContext): Promise<Result<unknown>> {
    const denied = requireAgentCapability(context, 'agent.draft.edit');
    if (denied) return Result.fail(denied);
    const parsed = AgentDraftDocumentV1Schema.safeParse(input.definition);
    if (!parsed.success) return Result.fail(new AgentRegistryError('AGENT_DRAFT_INVALID', 'Draft structure is invalid', { issues: parsed.error.issues }));
    try {
      return Result.ok(await this.repository.updateDraft(agentId, {
        expectedRevision: input.expectedRevision,
        definition: parsed.data,
        updatedBy: context.userId ?? null,
      }, { context }));
    } catch (error) { return Result.fail(normalizeAgentRegistryError(error)); }
  }
}
