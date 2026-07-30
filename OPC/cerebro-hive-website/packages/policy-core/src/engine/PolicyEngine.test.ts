import { describe, it, expect } from 'vitest';
import { IdentityContext } from '@cerebro/identity-core';
import { PolicyEngine } from './PolicyEngine';
import { PolicyRule } from '../models/PolicyRule';

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

describe('PolicyEngine — pre-existing behavior, preserved', () => {
  const engine = new PolicyEngine();

  it('implicit-denies when no rule matches (NotApplicable resolves to Deny)', () => {
    const decision = engine.evaluate([], identityContext(), ACTION);
    expect(decision.decision).toBe('Deny');
  });

  it('permits when a Permit rule matches and nothing denies', () => {
    const decision = engine.evaluate([rule({ effect: 'Permit', priority: 1 })], identityContext(), ACTION);
    expect(decision.decision).toBe('Permit');
  });

  it('deny-overrides: an explicit Deny wins over a higher-priority Permit', () => {
    const decision = engine.evaluate(
      [rule({ effect: 'Permit', priority: 10 }), rule({ effect: 'Deny', priority: 1 })],
      identityContext(),
      ACTION
    );
    expect(decision.decision).toBe('Deny');
  });

  it('Shadow mode reports what would have been Deny but returns Permit', () => {
    const decision = engine.evaluate([rule({ effect: 'Deny', priority: 1 })], identityContext(), ACTION, undefined, 'Shadow');
    expect(decision.decision).toBe('Permit');
    expect(decision.reason).toContain('SHADOW MODE');
  });
});

describe('PolicyEngine — ADR-028 outcomes (StepUpMfa / HumanApproval)', () => {
  const engine = new PolicyEngine();

  it('a StepUpMfa rule outranks a Permit rule regardless of priority', () => {
    const decision = engine.evaluate(
      [rule({ effect: 'Permit', priority: 100 }), rule({ effect: 'StepUpMfa', priority: 1 })],
      identityContext(),
      ACTION
    );
    expect(decision.decision).toBe('StepUpMfa');
  });

  it('a HumanApproval rule outranks a StepUpMfa rule', () => {
    const decision = engine.evaluate(
      [rule({ effect: 'StepUpMfa', priority: 100 }), rule({ effect: 'HumanApproval', priority: 1 })],
      identityContext(),
      ACTION
    );
    expect(decision.decision).toBe('HumanApproval');
  });

  it('full ADR-038 rule-4 precedence order: Deny > HumanApproval > StepUpMfa > Permit, regardless of match order', () => {
    const decision = engine.evaluate(
      [
        rule({ effect: 'Permit', priority: 4 }),
        rule({ effect: 'StepUpMfa', priority: 3 }),
        rule({ effect: 'HumanApproval', priority: 2 }),
        rule({ effect: 'Deny', priority: 1 }),
      ],
      identityContext(),
      ACTION
    );
    expect(decision.decision).toBe('Deny');
  });

  it('a later-evaluated lower-ranked match never downgrades an already-matched stricter outcome', () => {
    // HumanApproval is matched first (higher priority); a later Permit
    // rule must not overwrite it.
    const decision = engine.evaluate(
      [rule({ effect: 'HumanApproval', priority: 10 }), rule({ effect: 'Permit', priority: 1 })],
      identityContext(),
      ACTION
    );
    expect(decision.decision).toBe('HumanApproval');
  });
});
