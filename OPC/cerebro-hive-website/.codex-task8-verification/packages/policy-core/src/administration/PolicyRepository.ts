import { PolicyRule } from '../models/PolicyRule';
import { PolicyBundle } from '../models/PolicyBundle';

export interface PolicyRepository {
  // Policy Methods
  savePolicyVersion(policy: PolicyRule): Promise<void>;
  getPolicyVersion(policyId: string, version: string): Promise<PolicyRule | undefined>;
  getLatestActivePolicy(policyId: string): Promise<PolicyRule | undefined>;
  updatePolicyState(policyId: string, version: string, newState: string): Promise<void>;
  
  // Bundle Methods
  saveBundleVersion(bundle: PolicyBundle): Promise<void>;
  getBundleVersion(bundleId: string, version: string): Promise<PolicyBundle | undefined>;
  resolveBundlePolicies(bundle: PolicyBundle): Promise<PolicyRule[]>;
}

export class MemoryPolicyRepository implements PolicyRepository {
  private policies = new Map<string, PolicyRule>();
  private bundles = new Map<string, PolicyBundle>();

  private makeKey(id: string, version: string) {
    return `${id}@${version}`;
  }

  async savePolicyVersion(policy: PolicyRule): Promise<void> {
    this.policies.set(this.makeKey(policy.id, policy.version), { ...policy });
  }

  async getPolicyVersion(policyId: string, version: string): Promise<PolicyRule | undefined> {
    return this.policies.get(this.makeKey(policyId, version));
  }

  async getLatestActivePolicy(policyId: string): Promise<PolicyRule | undefined> {
    const matches = Array.from(this.policies.values()).filter(p => p.id === policyId && p.lifecycleState === 'Active');
    // Simplified: in reality, parse semver to find highest
    return matches.sort((a, b) => b.version.localeCompare(a.version))[0];
  }

  async updatePolicyState(policyId: string, version: string, newState: any): Promise<void> {
    const policy = await this.getPolicyVersion(policyId, version);
    if (policy) {
      policy.lifecycleState = newState;
    }
  }

  async saveBundleVersion(bundle: PolicyBundle): Promise<void> {
    this.bundles.set(this.makeKey(bundle.id, bundle.version), { ...bundle });
  }

  async getBundleVersion(bundleId: string, version: string): Promise<PolicyBundle | undefined> {
    return this.bundles.get(this.makeKey(bundleId, version));
  }

  async resolveBundlePolicies(bundle: PolicyBundle): Promise<PolicyRule[]> {
    const resolved: PolicyRule[] = [];
    for (const ref of bundle.manifest.policies) {
      // Simplified: ignores version constraint logic and just gets latest active for this POC
      const policy = await this.getLatestActivePolicy(ref.policyId);
      if (policy) {
        resolved.push(policy);
      }
    }
    return resolved;
  }
}
