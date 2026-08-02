import { Decision, IPermissionPolicy } from '../policies/Decision';
import { Execution } from './Execution';
import { ExecutionStatus } from './ExecutionStatus';

/**
 * Phase 9f-1 — authorization contracts for "who may trigger a transition,"
 * the question `ADR-039`/`ADR-040`/`ADR-041` each explicitly named and
 * deferred ("this class never decides who is authorized... Phase 9f").
 *
 * Deliberately reuses `packages/domain/src/policies/Decision.ts`'s existing
 * `Decision`/`IPermissionPolicy<TContext, TResource>` shapes rather than
 * inventing a parallel authorization vocabulary — "reuse before invention,"
 * the same discipline already applied to `ExecutionEvents.ts` reusing
 * `DomainEvent`, and to `DomainError.ts` already having a real
 * `AuthorizationError` this file's callers throw. This is a same-package
 * reuse (`Decision.ts` already lives in `packages/domain`), not a
 * cross-bounded-context import — unlike `PolicyEngine.ts`, which this file
 * does NOT import, since that class couples to `@cerebro/database`'s
 * `RequestContext` (a cross-package dependency this aggregate has
 * deliberately stayed off of throughout Phase 9, per `ExecutionId` and
 * `ExecutionProviderPort`'s own precedent).
 */
export type ExecutionAuthorizationAction = 'transition' | 'cancel' | 'retry' | 'resume';

export interface ExecutionAuthorizationContext {
  readonly actor?: string;
  readonly action: ExecutionAuthorizationAction;
  readonly toStatus?: ExecutionStatus;
}

export type ExecutionAuthorizationPolicy = IPermissionPolicy<ExecutionAuthorizationContext, Execution>;

/**
 * The real, explicit default `ExecutionOrchestrator` uses when no policy is
 * supplied — permissive by design (matches every existing caller's current,
 * unchanged behavior), not a silently-incomplete stub. Named "AllowAll," not
 * left as an implicit `undefined` check inside the orchestrator, so that
 * "no authorization enforcement" is a chosen, visible policy object rather
 * than an unstated absence of one.
 */
export class AllowAllExecutionAuthorizationPolicy implements ExecutionAuthorizationPolicy {
  async evaluate(): Promise<Decision> {
    return { allowed: true };
  }
}
