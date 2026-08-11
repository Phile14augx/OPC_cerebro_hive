import { IdentityContext } from '@cerebro/identity-core';
import {
  PolicyEngine,
  PolicyDecision,
  PolicyDecisionType,
  EngineExecutionMode,
  ResourceDescriptor,
} from '@cerebro/policy-core';
import { PolicyHierarchy, HIERARCHY_LEVELS } from './HierarchyTypes';

// ADR-038 rule 4's outcome precedence, duplicated from policy-core's
// internal (unexported) OUTCOME_PRECEDENCE rather than importing it —
// policy-core's engine already resolves NotApplicable to Deny before
// returning (see its "Default Deny if NotApplicable" step), so every
// per-level PolicyDecision this engine receives is always one of these
// four ranked outcomes, never NotApplicable itself.
const OUTCOME_RANK: Record<'Deny' | 'HumanApproval' | 'StepUpMfa' | 'Permit', number> = {
  Deny: 3,
  HumanApproval: 2,
  StepUpMfa: 1,
  Permit: 0,
};

function rank(decision: PolicyDecisionType): number {
  if (decision === 'Indeterminate') return Number.POSITIVE_INFINITY; // an error anywhere fails the whole chain closed
  if (decision === 'NotApplicable') return -1; // defensive; policy-core's engine should never actually return this
  return OUTCOME_RANK[decision];
}

/**
 * Implements ADR-038 (Policy inheritance precedence and conflict
 * resolution): evaluates a Policy at each of the four
 * Organization/Tenant/Project/Workspace levels via the underlying
 * @cerebro/policy-core PolicyEngine, then combines the four per-level
 * decisions into one overall decision.
 *
 * Design note on rules 2 and 3 (child-narrows-never-widens; top-down,
 * accumulating evaluation): rather than threading each level's result
 * into the next level's evaluation context (a literal "accumulating"
 * implementation), this evaluates all four levels independently against
 * the same identity/action/resource, then takes the single most
 * restrictive (highest-ranked, per rule 4) outcome across all four.
 * These are equivalent for a rank-based combining algorithm — because
 * policy-core's engine already defaults every level to Deny unless that
 * level explicitly Permits (its own implicit-deny-by-default step), a
 * level that says nothing about an action can never "widen" what another
 * level decided, which is exactly rule 2's requirement. This is a
 * documented equivalence, not a deviation from the ADR.
 */
export class HierarchicalPolicyEngine {
  constructor(private readonly coreEngine: PolicyEngine) {}

  evaluate(
    hierarchy: PolicyHierarchy,
    identityContext: IdentityContext,
    action: string,
    resourceContext?: ResourceDescriptor,
    mode: EngineExecutionMode = 'Enforce'
  ): PolicyDecision {
    const start = performance.now();

    // Defensive: hierarchy must be supplied in the fixed ADR-038 rule 3
    // order. This is a caller contract, not something silently corrected
    // here — a caller passing levels out of order has a real bug worth
    // surfacing, not one this engine should mask by re-sorting.
    hierarchy.forEach((entry, i) => {
      if (entry.level !== HIERARCHY_LEVELS[i]) {
        throw new Error(
          `HierarchicalPolicyEngine.evaluate: hierarchy[${i}] is level '${entry.level}', expected '${HIERARCHY_LEVELS[i]}' — levels must be supplied Organization, Tenant, Project, Workspace, in that order (ADR-038 rule 3).`
        );
      }
    });

    let mostRestrictive: PolicyDecision | null = null;
    const perLevelDecisions: Record<string, PolicyDecision> = {};

    for (const { level, bundle } of hierarchy) {
      const levelDecision = this.coreEngine.evaluate(bundle, identityContext, action, resourceContext, mode);
      perLevelDecisions[level] = levelDecision;

      // Indeterminate (an evaluation error at this level) fails the whole
      // chain closed immediately — an error at any level is not
      // "outranked" by a clean Deny/Permit elsewhere, it invalidates the
      // decision entirely, consistent with policy-core's own
      // fail-closed posture on evaluation errors.
      if (levelDecision.decision === 'Indeterminate') {
        return this.buildResult(levelDecision, perLevelDecisions, hierarchy, action, resourceContext, mode, start,
          `Indeterminate at ${level} level: ${levelDecision.reason}`);
      }

      if (!mostRestrictive || rank(levelDecision.decision) > rank(mostRestrictive.decision)) {
        mostRestrictive = levelDecision;
      }
    }

    // hierarchy always has 4 entries (PolicyHierarchy is a fixed-length
    // tuple), so mostRestrictive is always assigned by this point.
    const winner = mostRestrictive as PolicyDecision;
    const winningLevel = hierarchy.find(h => perLevelDecisions[h.level] === winner)!.level;

    return this.buildResult(
      winner,
      perLevelDecisions,
      hierarchy,
      action,
      resourceContext,
      mode,
      start,
      `${winner.decision} — most restrictive outcome across the hierarchy, from ${winningLevel} level: ${winner.reason}`
    );
  }

  private buildResult(
    winner: PolicyDecision,
    perLevelDecisions: Record<string, PolicyDecision>,
    hierarchy: PolicyHierarchy,
    action: string,
    resourceContext: ResourceDescriptor | undefined,
    mode: EngineExecutionMode,
    start: number,
    reason: string
  ): PolicyDecision {
    return {
      decisionId: `hier-dec-${Date.now()}`,
      traceId: winner.traceId,
      enforcementMode: mode,
      decision: winner.decision,
      matchedPolicies: hierarchy.flatMap(h => perLevelDecisions[h.level]?.matchedPolicies ?? []),
      skippedPolicies: hierarchy.flatMap(h => perLevelDecisions[h.level]?.skippedPolicies ?? []),
      obligations: hierarchy.flatMap(h => perLevelDecisions[h.level]?.obligations ?? []),
      advice: hierarchy.flatMap(h => perLevelDecisions[h.level]?.advice ?? []),
      evaluationTimeMs: performance.now() - start,
      // `id` (typed per level, per HierarchyTypes.ts's typed-ID
      // reconciliation) is included here when supplied — purely additive
      // to the trace string, no behavior depends on it.
      evaluationPath: hierarchy.map(h => `${h.level}${h.id ? `(${h.id})` : ''}: ${perLevelDecisions[h.level]?.decision ?? 'not evaluated'}`),
      identity: winner.identity,
      resource: resourceContext?.id,
      action,
      reason,
      timestamp: new Date(),
      engineVersion: winner.engineVersion,
    };
  }
}
