import { PolicyRule } from '../models/PolicyRule';
import { PolicyBundle } from '../models/PolicyBundle';

export interface OptimizedPolicyBundle {
  id: string;
  version: string;
  createdAt: Date;
  operatorRegistryVersion: string;
  
  // O(1) Lookups
  actionIndex: Record<string, string[]>; // Action -> PolicyRule IDs
  resourceIndex: Record<string, string[]>; // ResourceType -> PolicyRule IDs
  
  // Flat Execution Profiles (Strip governance metadata)
  compiledRules: Record<string, Omit<PolicyRule, 'description' | 'lifecycleState' | 'createdBy' | 'updatedBy' | 'exceptions' | 'metadata'>>;
  
  // Intentionally omitting 'signature' and 'keyId' here, they will be attached by the Signer
}

export class PolicyCompiler {
  private operatorRegistryVersion = '1.0.0';

  compile(bundle: PolicyBundle, resolvedPolicies: PolicyRule[]): OptimizedPolicyBundle {
    const actionIndex: Record<string, string[]> = {};
    const resourceIndex: Record<string, string[]> = {};
    const compiledRules: any = {};

    // Sort by priority descending before indexing so engine encounters highest priority first
    const sortedPolicies = [...resolvedPolicies].sort((a, b) => b.priority - a.priority);

    for (const policy of sortedPolicies) {
      if (!policy.enabled || policy.lifecycleState !== 'Active') continue;

      compiledRules[policy.id] = {
        id: policy.id,
        name: policy.name,
        version: policy.version,
        effect: policy.effect,
        priority: policy.priority,
        enabled: policy.enabled,
        actions: policy.actions,
        resources: policy.resources,
        conditions: policy.conditions,
        obligations: policy.obligations,
        advice: policy.advice,
      };

      for (const action of policy.actions) {
        if (!actionIndex[action]) actionIndex[action] = [];
        actionIndex[action].push(policy.id);
      }

      for (const res of policy.resources) {
        if (!resourceIndex[res]) resourceIndex[res] = [];
        resourceIndex[res].push(policy.id);
      }
    }

    return {
      id: bundle.id,
      version: bundle.version,
      createdAt: new Date(),
      operatorRegistryVersion: this.operatorRegistryVersion,
      actionIndex,
      resourceIndex,
      compiledRules
    };
  }
}
