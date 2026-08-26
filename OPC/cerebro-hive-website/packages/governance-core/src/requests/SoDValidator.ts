

export interface SoDRule {
  id: string;
  name: string;
  description: string;
  conflictingEntitlements: string[]; // List of entitlement IDs that cannot be held together
}

export class SoDValidator {
  private rules: Map<string, SoDRule> = new Map();

  addRule(rule: SoDRule) {
    this.rules.set(rule.id, rule);
  }

  /**
   * Validates if a principal can hold a new entitlement given their current ones.
   */
  validate(principalEntitlements: string[], requestedEntitlement: string): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    const proposedSet = new Set([...principalEntitlements, requestedEntitlement]);

    for (const rule of this.rules.values()) {
      // Check if the proposed set contains more than one conflicting entitlement from this rule
      let conflictCount = 0;
      for (const conflictingId of rule.conflictingEntitlements) {
        if (proposedSet.has(conflictingId)) {
          conflictCount++;
        }
      }

      if (conflictCount > 1) {
        violations.push(`SoD Violation: ${rule.name} - ${rule.description}`);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }
}
