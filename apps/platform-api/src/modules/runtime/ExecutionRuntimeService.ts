import {
  Execution,
  ExecutionId,
  ExecutionOrchestrator,
  ExecutionStatus,
  InMemoryExecutionRepository,
  NotFoundError,
} from '@cerebro/domain';

export interface StartAgentExecutionInput {
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly agentId: string;
  readonly message: string;
}

/**
 * Phase 10.1/10.2 — the first real, live caller of Phase 9's execution
 * runtime. This is an application-level facade (lives in `apps/platform-api`,
 * not `packages/domain`) whose only job is translating REST-shaped requests
 * (`runtime.routes.ts`) into calls against the real `ExecutionOrchestrator`,
 * and translating results back — the same "thin adapter, no business logic
 * of its own" discipline `AgentExecutionProvider.ts` follows on the other
 * side of the orchestrator.
 *
 * Constructed once in `bootstrap.ts` with a single, process-lifetime
 * `InMemoryExecutionRepository` (Phase 9d) and `ExecutionOrchestrator`
 * (Phase 9c) instance — there is no database-backed `ExecutionRepository`
 * yet (see `TECHNICAL-DEBT.md` §2), so every Execution created through this
 * service is lost on process restart. That is a genuine, disclosed
 * limitation of this integration, not something this class works around.
 *
 * `pauseExecution()` is deliberately NOT implemented as a real pause: Phase
 * 9's `ExecutionTransitions.ts` graph has no user-requested RUNNING ->
 * WAITING edge (WAITING is only ever reached because a *provider* reports
 * `'waiting'`, e.g. an async tool call in flight) — there is no domain
 * concept of an externally-requested pause today. Rather than silently
 * treating "pause" as "cancel" (semantically wrong) or returning a fake
 * `{ success: true }` (the previous mock's behavior), this method throws a
 * clear, typed error so the route can return an honest 501. Adding a real
 * pause capability is future work requiring a new `ExecutionOrchestrator`
 * method and a new transition-graph edge — a `packages/domain` change, not
 * something this application-level facade should invent on its own.
 */
export class ExecutionRuntimeService {
  constructor(
    private readonly orchestrator: ExecutionOrchestrator,
    private readonly repository: InMemoryExecutionRepository
  ) {}

  async startAgentExecution(input: StartAgentExecutionInput): Promise<Execution> {
    return this.orchestrator.run({
      kind: 'Agent',
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      traceId: input.traceId,
      correlationId: input.correlationId,
      metadata: { agentId: input.agentId, message: input.message },
    });
  }

  async pauseExecution(_executionId: string): Promise<never> {
    throw new PauseNotSupportedError();
  }

  async resumeExecution(executionId: string): Promise<Execution> {
    const execution = await this.loadOrThrow(executionId);
    return this.orchestrator.resume(execution);
  }

  async cancelExecution(executionId: string, opts: { actor?: string; reason?: string } = {}): Promise<Execution> {
    const execution = await this.loadOrThrow(executionId);
    return this.orchestrator.requestCancellation(execution, opts);
  }

  async getExecution(executionId: string): Promise<Execution> {
    return this.loadOrThrow(executionId);
  }

  async listExecutions(
    tenantId: string,
    opts: { status?: ExecutionStatus; limit?: number } = {}
  ): Promise<readonly Execution[]> {
    return this.repository.listByTenant(tenantId, opts);
  }

  private async loadOrThrow(executionId: string): Promise<Execution> {
    const execution = await this.repository.load(ExecutionId.of(executionId));
    if (!execution) {
      throw new NotFoundError(`Execution ${executionId} not found.`);
    }
    return execution;
  }
}

/** A real, named error (not a generic `Error`) so `runtime.routes.ts` can
 * map it to a specific, honest HTTP status (501 Not Implemented) rather than
 * a generic 500 — the same "typed errors carry the caller's mapping
 * decision" discipline `DomainError.ts`'s own hierarchy already
 * establishes, extended here at the application layer since this isn't a
 * domain invariant violation, it's a capability gap. */
export class PauseNotSupportedError extends Error {
  constructor() {
    super(
      "Pausing a running Execution is not supported by the current domain model — ExecutionTransitions.ts has no user-requested RUNNING -> WAITING edge. See TECHNICAL-DEBT.md for what a real implementation would require."
    );
    this.name = 'PauseNotSupportedError';
  }
}
