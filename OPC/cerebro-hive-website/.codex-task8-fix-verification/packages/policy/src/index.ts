export interface EvaluationContext {
  subject: {
    id: string;
    roles: string[];
    attributes: Record<string, any>;
  };
  resource: {
    type: string;
    id?: string;
    tenantId?: string;
    attributes: Record<string, any>;
  };
  action: string;
  environment?: Record<string, any>;
}

export interface PolicyRule {
  id: string;
  description: string;
  effect: 'allow' | 'deny';
  condition: (context: EvaluationContext) => boolean;
}

export class PolicyEngine {
  private rules: PolicyRule[] = [];

  registerRule(rule: PolicyRule) {
    this.rules.push(rule);
  }

  evaluate(context: EvaluationContext): { allowed: boolean; reason?: string } {
    let allowed = false;
    let reason = 'Default deny';

    // In a real OPA-style engine, this would parse Rego.
    // For now, it's a programmatic evaluator using defined rules.
    for (const rule of this.rules) {
      try {
        if (rule.condition(context)) {
          if (rule.effect === 'deny') {
            return { allowed: false, reason: `Denied by rule: ${rule.id}` };
          }
          if (rule.effect === 'allow') {
            allowed = true;
            reason = `Allowed by rule: ${rule.id}`;
          }
        }
      } catch (e) {
        // Log error in condition evaluation
        console.error(`Error evaluating rule ${rule.id}:`, e);
      }
    }

    return { allowed, reason: allowed ? reason : 'No matching allow rule found' };
  }
}
