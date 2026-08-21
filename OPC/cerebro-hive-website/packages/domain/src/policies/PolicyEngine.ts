import { RequestContext } from '@cerebro/db';
import { Decision, IPermissionPolicy } from './Decision';

export class PolicyEngine {
  constructor(private policies: Record<string, IPermissionPolicy<RequestContext>>) {}

  async evaluate(policyName: string, context: RequestContext, resource?: unknown): Promise<Decision> {
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
