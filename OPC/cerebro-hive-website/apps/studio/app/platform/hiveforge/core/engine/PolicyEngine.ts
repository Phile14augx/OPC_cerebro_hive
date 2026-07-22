/**
 * Tiered Policy Engine
 */

import { ExecutionGraph } from "./planner/graph";

export type PolicyLevel = "Global" | "Organization" | "Workspace" | "Project" | "Blueprint" | "Provider";

export interface PolicyRule {
  id: string;
  level: PolicyLevel;
  name: string;
  description: string;
  evaluate: (graph: ExecutionGraph) => Promise<{ allowed: boolean; reason?: string }>;
}

export class PolicyEngine {
  private policies: PolicyRule[] = [];

  registerPolicy(policy: PolicyRule) {
    this.policies.push(policy);
    // Sort by level priority (Global first)
    const levelScores = { "Global": 1, "Organization": 2, "Workspace": 3, "Project": 4, "Blueprint": 5, "Provider": 6 };
    this.policies.sort((a, b) => levelScores[a.level] - levelScores[b.level]);
  }

  async evaluate(graph: ExecutionGraph): Promise<{ allowed: boolean; violations: string[] }> {
    const violations: string[] = [];

    for (const policy of this.policies) {
      const result = await policy.evaluate(graph);
      if (!result.allowed) {
        violations.push(`[${policy.level}] ${policy.name}: ${result.reason || "Policy violation"}`);
      }
    }

    return {
      allowed: violations.length === 0,
      violations
    };
  }
}

export const policyEngine = new PolicyEngine();
