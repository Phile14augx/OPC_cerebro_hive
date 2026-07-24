import { AuthorizationProvider, IdentityContext } from '@cerebro/identity-core';
import { PolicyEngine } from '../engine/PolicyEngine';
import { PolicyCache } from '../distribution/PolicyCache';

export class PolicyAuthorizationProvider implements AuthorizationProvider {
  private engine: PolicyEngine;
  private cache: PolicyCache;

  constructor(cache: PolicyCache) {
    this.engine = new PolicyEngine();
    this.cache = cache;
  }

  async checkPermission(context: IdentityContext, capability: string, resourceUrn?: string): Promise<boolean> {
    const activeBundle = this.cache.getActiveBundle();
    
    if (!activeBundle) {
      console.error('[PolicyAuthorizationProvider] No active policy bundle loaded in cache! Failing closed.');
      return false; // Fail closed if no policies are distributed yet.
    }

    const decision = this.engine.evaluate(activeBundle, context, capability, undefined); // We would resolve URN to ResourceDescriptor here
    
    // We only permit if the policy explicitly evaluates to Permit.
    // Indeterminate or NotApplicable result in a Deny behavior at the PEP.
    return decision.decision === 'Permit';
  }

  async getGrantedCapabilities(context: IdentityContext): Promise<string[]> {
    return [];
  }
}
