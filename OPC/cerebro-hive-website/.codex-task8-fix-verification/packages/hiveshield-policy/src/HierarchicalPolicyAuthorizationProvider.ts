import { AuthorizationProvider, IdentityContext, TenancyScope } from '@cerebro/identity-core';
import { PolicyEngine } from '@cerebro/policy-core';
import { HierarchicalPolicyEngine } from './HierarchicalPolicyEngine';
import { PolicyHierarchy } from './HierarchyTypes';

/**
 * Resolves which Policy bundle applies at each of the four ADR-038
 * hierarchy levels for a given identity's tenancy scope. Injected rather
 * than hardcoded so this provider stays decoupled from any specific
 * storage mechanism (matching PolicyAuthorizationProvider's own
 * PolicyCache-injection pattern in packages/policy-core).
 *
 * Known gap, not resolved by this interface: `TenancyScope`
 * (@cerebro/identity-core) has organizationId/workspaceId/projectId/
 * environmentId — no explicit tenantId. A real implementation of this
 * resolver has to derive the Tenant level some other way (e.g. a
 * lookup keyed by organizationId, since ADR-038's domain model still
 * requires a Tenant level between Organization and Project). That
 * resolution mechanism is out of scope here — flagged, not invented.
 */
export interface PolicyHierarchyResolver {
  resolve(tenancy: TenancyScope): Promise<PolicyHierarchy> | PolicyHierarchy;
}

/**
 * The concrete integration point: implements identity-core's
 * AuthorizationProvider (the same contract PolicyAuthorizationProvider
 * implements) but backs `checkPermission` with the four-outcome,
 * hierarchy-aware HierarchicalPolicyEngine instead of a single flat
 * bundle. A caller (e.g. a future HiveGateway PolicyEvaluationClient,
 * per hiveforge/03-CONTROL-PLANE.md) that needs to branch on Step-up MFA
 * or Human Approval rather than a collapsed boolean should call
 * `evaluate()` directly instead of `checkPermission()` — the boolean
 * method exists only to satisfy the existing AuthorizationProvider
 * contract for callers that only need a yes/no answer.
 */
export class HierarchicalPolicyAuthorizationProvider implements AuthorizationProvider {
  private readonly engine: HierarchicalPolicyEngine;

  constructor(private readonly hierarchyResolver: PolicyHierarchyResolver) {
    this.engine = new HierarchicalPolicyEngine(new PolicyEngine());
  }

  /**
   * Full decision, including Step-up MFA / Human Approval outcomes —
   * use this when the caller can actually act on those outcomes (e.g.
   * routing to a re-authentication flow or an approval workflow), not
   * just checking yes/no.
   */
  async evaluate(context: IdentityContext, capability: string, _resourceUrn?: string) {
    const hierarchy = await this.hierarchyResolver.resolve(context.tenancy);
    // Matches PolicyAuthorizationProvider's existing pattern: a resource
    // URN string alone can't construct a real ResourceDescriptor
    // (classification/tags/visibility/riskLevel aren't derivable from a
    // URN), so resource-scoped evaluation is passed through as
    // undefined here too — real URN-to-ResourceDescriptor resolution is
    // a pre-existing, not-yet-solved gap, not one this provider invents
    // a fake answer for.
    return this.engine.evaluate(hierarchy, context, capability, undefined);
  }

  /**
   * AuthorizationProvider's required boolean contract. Per ADR-028's own
   * consequence note ("every caller of PolicyEngine must handle Step-up
   * MFA and Human Approval as real control-flow branches, not edge
   * cases") — collapsing to boolean here is a deliberate simplification
   * for callers using the generic AuthorizationProvider interface, not
   * a claim that Step-up MFA/Human Approval don't matter. Only an
   * explicit Permit returns true; everything else (Deny, Step-up MFA,
   * Human Approval, Indeterminate) fails closed, matching
   * PolicyAuthorizationProvider's existing "Indeterminate or
   * NotApplicable result in a Deny behavior at the PEP" precedent.
   */
  async checkPermission(context: IdentityContext, capability: string, resourceUrn?: string): Promise<boolean> {
    const decision = await this.evaluate(context, capability, resourceUrn);
    return decision.decision === 'Permit';
  }

  async getGrantedCapabilities(_context: IdentityContext): Promise<string[]> {
    // Matches PolicyAuthorizationProvider's existing stub — enumerating
    // granted capabilities across a four-level hierarchy (as opposed to
    // checking one specific capability) needs its own traversal design,
    // not implied by anything ADR-028/ADR-038 already fixed. Left as a
    // stub, not silently invented.
    return [];
  }
}
