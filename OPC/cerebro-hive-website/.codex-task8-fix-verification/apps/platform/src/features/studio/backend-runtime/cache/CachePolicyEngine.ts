
export type CacheStrategy = 'NoCache' | 'ExecutionCache' | 'WorkflowCache' | 'PersistentCache';

export interface CachePolicy {
  strategy: CacheStrategy;
  ttlSeconds: number;
  invalidationTags: string[];
  tenantIsolation: boolean;
}

export class CachePolicyEngine {
  static getPolicyForCapability(capabilityId: string): CachePolicy {
    return {
      strategy: 'PersistentCache',
      ttlSeconds: 86400,
      invalidationTags: [`cap:${capabilityId}`],
      tenantIsolation: true
    };
  }
}
