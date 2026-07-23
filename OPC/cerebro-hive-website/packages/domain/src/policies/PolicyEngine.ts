import { RequestContext } from '@cerebro/database';
import { Decision, IPermissionPolicy } from './Decision';

export class PolicyEngine {
  constructor(private policies: Record<string, IPermissionPolicy<RequestContext>>) {}

  async evaluate(policyName: string, context: RequestContext, resource?: any): Promise<Decision> {
    const policy = this.policies[policyName];
    if (!policy) {
      return {
        allowed: false,
        reason: `Policy ${policyName} not found.`,
      };
    }

    return policy.evaluate(context, resource);
  }
}
