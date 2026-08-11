import { Execution, ExecutionCancellationSignal, ExecutionProviderPort, ExecutionProviderResult } from '@cerebro/domain';
import type { AgentExecutionContext } from '@cerebro/domain';
import type { AgentRuntimeService } from '@cerebro/agent-builder-capability';
import type { AgentRepository } from '@cerebro/db';

/**
 * Phase 10.1 — the real bridge between Phase 9's `ExecutionOrchestrator`
 * (lifecycle coordination: transitions, persistence, events) and the
 * already-real `AgentRuntimeService` (the actual LLM-backed execution loop,
 * built in an earlier epic of this engagement). This class does no work of
 * its own — per `ExecutionOrchestrator`'s own governing invariant
 * ("providers execute, orchestrators coordinate"), it only translates a
 * generic `Execution` into the specific `AgentExecutionContext` shape
 * `AgentRuntimeService.execute()` expects, and translates that call's
 * result back into the generic `ExecutionProviderResult` shape the
 * orchestrator understands.
 *
 * Scope: handles `execution.kind === 'Agent'` only — the one kind this
 * engagement has a real execution loop for. Any other kind ('Workflow',
 * 'Tool', 'Evaluation', 'Scheduler') fails immediately with a clear reason
 * rather than silently pretending to execute — there is no real provider
 * for those kinds yet, and claiming otherwise would misrepresent what this
 * phase built. Adding them is future work, one provider class at a time,
 * the same pattern this file establishes.
 *
 * `execution.metadata` is expected to carry `{ agentId: string; message:
 * string }` — set by `ExecutionRuntimeService.startAgentExecution()`, the
 * one call site that constructs an 'Agent'-kind Execution today.
 */
export class AgentExecutionProvider implements ExecutionProviderPort {
  constructor(
    private readonly agentRuntimeService: AgentRuntimeService,
    private readonly agentRepository: AgentRepository
  ) {}

  async execute(
    execution: Execution,
    _opts?: { cancellationSignal?: ExecutionCancellationSignal }
  ): Promise<ExecutionProviderResult> {
    if (execution.kind !== 'Agent') {
      return {
        outcome: 'failed',
        reason: `AgentExecutionProvider only supports execution.kind === 'Agent' — got '${execution.kind}'. No real provider exists yet for this kind (see TECHNICAL-DEBT.md).`,
      };
    }

    const { agentId, message } = (execution.metadata ?? {}) as { agentId?: string; message?: string };
    if (!agentId || !message) {
      return {
        outcome: 'failed',
        reason: `Execution ${execution.id.toString()} is missing required metadata (agentId/message) for an Agent execution.`,
      };
    }

    const requestContext = {
      tenantId: execution.tenantId,
      workspaceId: execution.workspaceId,
      userId: execution.userId,
      traceId: execution.traceId,
      correlationId: execution.correlationId,
      timestamp: new Date(),
    };

    const legacyFallbackEnabled = process.env.AGENT_REGISTRY_LEGACY_VERSION_FALLBACK !== 'false';
    const resolved = await this.agentRepository.getActiveVersion(agentId, {
      context: requestContext,
      allowLegacyFallback: legacyFallbackEnabled,
    });
    if (!resolved) {
      return { outcome: 'failed', reason: `Agent ${agentId} was not found in this workspace.` };
    }
    const lifecycle = resolved.agent.lifecycleStatus;
    const legacyLifecycleAllowed = lifecycle === null && legacyFallbackEnabled;
    if (lifecycle !== 'PRODUCTION' && !legacyLifecycleAllowed) {
      return {
        outcome: 'failed',
        reason: `Agent ${agentId} is not executable while lifecycle is ${lifecycle ?? 'UNCLASSIFIED'}.`,
      };
    }
    if (resolved.fallbackUsed) {
      // Temporary and intentionally observable: remove only after backfill
      // verification proves production reads no longer depend on it.
      console.warn('agent_registry_legacy_version_fallback', { agentId, workspaceId: execution.workspaceId });
    }
    const version = resolved.version;
    if (!version) {
      return {
        outcome: 'failed',
        reason: `No published version found for agent ${agentId}.`,
      };
    }

    const executionContext: AgentExecutionContext = {
      conversationId: `exec-${execution.id.toString()}`,
      tenantId: execution.tenantId,
      // workspaceId is optional on Execution (not every execution kind is
      // workspace-scoped); fall back consistently with userId below rather
      // than asserting a guarantee that doesn't hold at the domain level.
      workspaceId: execution.workspaceId ?? '',
      userId: execution.userId ?? 'anonymous',
      traceId: execution.traceId,
      correlationId: execution.correlationId,
      agentVersionId: version.id,
      promptVersionId: version.id,
      modelId: version.modelId,
      memory: { workingMemory: {}, conversationHistory: [] },
      availableTools: [],
      tokenBudget: { maxTokens: 4096, tokensUsed: 0 },
      executionMode: 'sync',
    };

    try {
      const result = await this.agentRuntimeService.execute(executionContext, message, version.instructions);
      if (result?.status === 'suspended') {
        return { outcome: 'waiting', reason: result.reason ?? 'suspended pending an async tool call' };
      }
      return { outcome: 'completed', result };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return { outcome: 'failed', reason };
    }
  }
}
