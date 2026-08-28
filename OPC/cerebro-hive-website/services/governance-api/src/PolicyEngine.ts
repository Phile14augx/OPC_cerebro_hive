
import { PolicyDecision } from '@cerebro/governance-sdk';
import { PlatformEventBus } from '@cerebro/events';

interface PolicyEvaluationContext {
  tenantId: string;
  budgetRemaining: number;
}

function isTokenUsageRecordedEvent(event: unknown): event is { type: 'TOKEN_USAGE_RECORDED' } {
  return typeof event === 'object' && event !== null && 'type' in event && event.type === 'TOKEN_USAGE_RECORDED';
}

export class PolicyEngine {
  
  // Synchronous Preventive Control (e.g. called by LLM Gateway)
  evaluateSynchronous(context: PolicyEvaluationContext): PolicyDecision {
    console.log('[PolicyEngine] Evaluating synchronous policies (Budget, Auth, Models)...');
    
    if (context.tenantId === 'blocked-tenant') {
      const decision: PolicyDecision = { type: 'DENY', reason: 'Tenant suspended', policyId: 'identity-01' };
      this.publishDeniedPolicyDecision(decision);
      return decision;
    }

    if (context.budgetRemaining <= 0) {
      const decision: PolicyDecision = { type: 'DENY', reason: 'Budget exceeded', policyId: 'budget-01' };
      this.publishDeniedPolicyDecision(decision);
      return decision;
    }

    return { type: 'ALLOW', reason: 'All synchronous policies passed', policyId: 'default' };
  }

  // Asynchronous Detective Control (e.g. subscribed to EventBus)
  evaluateAsynchronous(event: unknown): void {
    if (isTokenUsageRecordedEvent(event)) {
      console.log('[PolicyEngine] Async Audit: Tracking usage anomalies...');
    }
  }

  private publishDeniedPolicyDecision(decision: PolicyDecision): void {
    PlatformEventBus.publish('telemetry:event', {
      type: 'POLICY_DENIED',
      details: decision,
      source: 'governance-api',
      severity: 'warning',
      timestamp: new Date(),
    });
  }
}
