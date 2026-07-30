import { describe, it, expect } from 'vitest';
import { PolicyEngine, PolicyRule } from '@cerebro/policy-core';
import { IdentityContext } from '@cerebro/identity-core';
import { OrganizationId, TenantId, ProjectId, WorkspaceId } from '@cerebro/domain-model';
import { HierarchicalPolicyEngine } from './HierarchicalPolicyEngine';
import { PolicyHierarchy, HierarchyLevelPolicies, HierarchyLevelName } from './HierarchyTypes';

function rule(overrides: Partial<PolicyRule> & Pick<PolicyRule, 'effect'>): PolicyRule {
  return {
    id: overrides.id ?? `rule-${Math.random().toString(36).slice(2)}`,
    name: overrides.name ?? 'test rule',
    description: '',
    version: '1.0.0',
    lifecycleState: 'Active',
    priority: overrides.priority ?? 0,
    enabled: true,
    actions: overrides.actions ?? ['workflows:execute'],
    resources: overrides.resources ?? ['*'],
    conditions: overrides.conditions ?? [],
    createdBy: 'test',
    ...overrides,
  };
}

// Generic over the specific level literal `L`, not just the union, so the
// discriminated union in HierarchyTypes.ts narrows correctly at each call
// site (e.g. `emptyLevel('Organization')` returns exactly the
// `{ level: 'Organization'; ... }` member, not the full four-member union) —
// required for typed-per-level `id` fields to type-check when this helper
// is mixed with literal `{ level: 'Tenant', id: ..., bundle: ... }` entries
// in the same PolicyHierarchy tuple.
function emptyLevel<L extends HierarchyLevelName>(level: L): Extract<HierarchyLevelPolicies, { level: L }> {
  return { level, bundle: [] } as unknown as Extract<HierarchyLevelPolicies, { level: L }>;
}

function identityContext(): IdentityContext {
  return {
    currentPrincipal: { id: 'user-1', type: 'Human', status: 'Active', trustLevel: 100, displayName: 'Test User', metadata: {} },
    originalPrincipal: { id: 'user-1', type: 'Human', status: 'Active', trustLevel: 100, displayName: 'Test User', metadata: {} },
    delegationChain: [],
    tenancy: { organizationId: 'org-1' },
    claims: {},
    correlationId: 'test-correlation-id',
  };
}

const ACTION = 'workflows:execute';

describe('HierarchicalPolicyEngine (ADR-038)', () => {
  const engine = new HierarchicalPolicyEngine(new PolicyEngine());

  it('permits when every level explicitly permits', () => {
    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Project', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    const decision = engine.evaluate(hierarchy, identityContext(), ACTION);
    expect(decision.decision).toBe('Permit');
  });

  it('rule 1: an explicit Deny at any level overrides Permits everywhere else', () => {
    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', bundle: [rule({ effect: 'Deny', priority: 1 })] },
      { level: 'Project', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    const decision = engine.evaluate(hierarchy, identityContext(), ACTION);
    expect(decision.decision).toBe('Deny');
  });

  it('rule 2: a child cannot widen what a silent parent implies (implicit deny beats an explicit child Permit)', () => {
    // Organization has no rule at all for this action -> implicit Deny.
    // Every level below explicitly Permits. Per ADR-038 rule 2, the
    // Workspace-level Permit cannot grant what the Organization never
    // permitted in the first place.
    const hierarchy: PolicyHierarchy = [
      emptyLevel('Organization'),
      { level: 'Tenant', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Project', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    const decision = engine.evaluate(hierarchy, identityContext(), ACTION);
    expect(decision.decision).toBe('Deny');
  });

  it('rule 4: outcome precedence — Human Approval beats Permit elsewhere in the chain', () => {
    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Project', bundle: [rule({ effect: 'HumanApproval', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    const decision = engine.evaluate(hierarchy, identityContext(), ACTION);
    expect(decision.decision).toBe('HumanApproval');
  });

  it('rule 4: outcome precedence — Step-up MFA beats Permit elsewhere in the chain', () => {
    // Every level must explicitly Permit except the one under test —
    // an empty level implicitly Denies (per policy-core's own
    // implicit-deny-by-default), which would make this test pass for
    // the wrong reason (rule 2, not rule 4).
    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', bundle: [rule({ effect: 'StepUpMfa', priority: 1 })] },
      { level: 'Project', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    expect(engine.evaluate(hierarchy, identityContext(), ACTION).decision).toBe('StepUpMfa');
  });

  it('rejects a hierarchy supplied out of order rather than silently re-sorting it', () => {
    const outOfOrder = [
      { level: 'Tenant', bundle: [] },
      { level: 'Organization', bundle: [] },
      { level: 'Project', bundle: [] },
      { level: 'Workspace', bundle: [] },
    ] as unknown as PolicyHierarchy;

    expect(() => engine.evaluate(outOfOrder, identityContext(), ACTION)).toThrow(/expected 'Organization'/);
  });

  it('an unrecognized condition operator fails that rule safe (skipped, not matched) — the level then implicitly denies', () => {
    // ConditionEngine.evaluateCondition returns false (does not throw) for
    // an unknown operator, so this exercises rule 2 (implicit deny at
    // the Tenant level), not the Indeterminate/error path — documented
    // here so the distinction from a genuine evaluation exception (below)
    // is explicit, not assumed.
    const unrecognizedOperatorRule = rule({ effect: 'Permit', priority: 1, conditions: [{ field: 'x', operator: 'not-a-real-operator', value: 1 }] });
    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', bundle: [unrecognizedOperatorRule] },
      { level: 'Project', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    expect(engine.evaluate(hierarchy, identityContext(), ACTION).decision).toBe('Deny');
  });

  it('typed-ID reconciliation: typed hierarchy identifiers (OrganizationId/TenantId/ProjectId/WorkspaceId) flow through to the evaluation trace without changing the decision', () => {
    // Purely a typing/contract check: the same rules as the
    // "permits when every level explicitly permits" case above, but with
    // each level's optional `id` populated from @cerebro/domain-model's
    // branded ID factories. Confirms (a) the discriminated union in
    // HierarchyTypes.ts actually accepts each level's matching branded
    // type, (b) evaluation behavior is unchanged (still Permit), and
    // (c) each typed id is threaded into evaluationPath — the only place
    // `id` is consumed.
    const orgId = OrganizationId.of('org-1');
    const tenantId = TenantId.of('tenant-1');
    const projectId = ProjectId.of('project-1');
    const workspaceId = WorkspaceId.of('workspace-1');

    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', id: orgId, bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', id: tenantId, bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Project', id: projectId, bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', id: workspaceId, bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    const decision = engine.evaluate(hierarchy, identityContext(), ACTION);

    expect(decision.decision).toBe('Permit');
    expect(decision.evaluationPath).toEqual([
      `Organization(${orgId}): Permit`,
      `Tenant(${tenantId}): Permit`,
      `Project(${projectId}): Permit`,
      `Workspace(${workspaceId}): Permit`,
    ]);
  });

  it('fails closed (Indeterminate) if a level genuinely throws during evaluation, even if other levels would Permit', () => {
    // A malformed rule (conditions is not an array) makes policy-core's
    // engine's `for (const condition of policy.conditions)` throw for
    // real — this is the actual Indeterminate trigger, distinct from the
    // fail-safe-but-non-throwing unrecognized-operator case above.
    const malformedRule = rule({ effect: 'Permit', priority: 1 });
    (malformedRule as any).conditions = null;

    const hierarchy: PolicyHierarchy = [
      { level: 'Organization', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Tenant', bundle: [malformedRule] },
      { level: 'Project', bundle: [rule({ effect: 'Permit', priority: 1 })] },
      { level: 'Workspace', bundle: [rule({ effect: 'Permit', priority: 1 })] },
    ];

    expect(engine.evaluate(hierarchy, identityContext(), ACTION).decision).toBe('Indeterminate');
  });
});
