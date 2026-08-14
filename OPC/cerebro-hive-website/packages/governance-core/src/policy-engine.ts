// ============================================================
// governance-core/src/policy-engine.ts
// ============================================================

import {
  ActionContext,
  Policy,
  PolicyCondition,
  PolicyResult,
  ConditionOperator,
} from "./types";

// --------------- Condition evaluator ---------------

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateCondition(
  condition: PolicyCondition,
  context: ActionContext
): boolean {
  // Flatten context into a searchable object including metadata fields
  const flat: Record<string, unknown> = {
    agentId: context.agentId,
    instanceId: context.instanceId,
    tenantId: context.tenantId,
    workspaceId: context.workspaceId,
    action: context.action,
    resource: context.resource,
    agentType: context.agentType,
    financialImpact: context.financialImpact,
    toolCallsInWindow: context.toolCallsInWindow,
    policyViolationsToday: context.policyViolationsToday,
    permissionLevel: context.permissionLevel,
    dataClassification: context.dataClassification,
    isExternalSideEffect: context.isExternalSideEffect,
    ...(context.metadata ?? {}),
  };

  const actual = getNestedValue(flat, condition.field);
  const expected = condition.value;
  const op: ConditionOperator = condition.operator;

  switch (op) {
    case "equals":
      return actual === expected;

    case "not_equals":
      return actual !== expected;

    case "contains":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.includes(expected);
      }
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      return false;

    case "not_contains":
      if (typeof actual === "string" && typeof expected === "string") {
        return !actual.includes(expected);
      }
      if (Array.isArray(actual)) {
        return !actual.includes(expected);
      }
      return true;

    case "startsWith":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.startsWith(expected);
      }
      return false;

    case "endsWith":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.endsWith(expected);
      }
      return false;

    case "gt":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual > expected;
      }
      return false;

    case "gte":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual >= expected;
      }
      return false;

    case "lt":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual < expected;
      }
      return false;

    case "lte":
      if (typeof actual === "number" && typeof expected === "number") {
        return actual <= expected;
      }
      return false;

    case "regex": {
      if (typeof actual === "string" && typeof expected === "string") {
        try {
          return new RegExp(expected).test(actual);
        } catch {
          return false;
        }
      }
      return false;
    }

    case "in":
      if (Array.isArray(expected)) {
        return expected.includes(actual);
      }
      return false;

    case "not_in":
      if (Array.isArray(expected)) {
        return !expected.includes(actual);
      }
      return true;

    default:
      return false;
  }
}

function policyMatches(policy: Policy, context: ActionContext): boolean {
  if (!policy.enabled) return false;
  if (policy.conditions.length === 0) return true;

  const logic = policy.conditionLogic ?? "AND";

  if (logic === "AND") {
    return policy.conditions.every((c) => evaluateCondition(c, context));
  } else {
    return policy.conditions.some((c) => evaluateCondition(c, context));
  }
}

// --------------- Built-in default policies ---------------

const DEFAULT_POLICIES: Policy[] = [
  {
    policyId: "high-financial-impact-approval",
    name: "High Financial Impact Approval",
    description:
      "Requires human approval for actions with financial impact exceeding $100,000",
    version: "1.0.0",
    enabled: true,
    priority: 10,
    conditions: [
      {
        field: "financialImpact",
        operator: "gt",
        value: 100000,
      },
    ],
    conditionLogic: "AND",
    action: "require_approval",
    parameters: {
      approvalTimeoutMs: 86400000,
      escalationPath: ["finance-team", "executive-team"],
    },
    createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
  },
  {
    policyId: "production-write-approval",
    name: "Production Write Approval",
    description:
      "Requires approval before writing to any production resource",
    version: "1.0.0",
    enabled: true,
    priority: 20,
    conditions: [
      {
        field: "resource",
        operator: "startsWith",
        value: "production.",
      },
      {
        field: "action",
        operator: "contains",
        value: "write",
      },
    ],
    conditionLogic: "AND",
    action: "require_approval",
    parameters: {
      approvalTimeoutMs: 3600000,
      escalationPath: ["ops-team"],
    },
    createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
  },
  {
    policyId: "hr-data-restriction",
    name: "HR Data Access Restriction",
    description:
      "Denies access to HR data for non-HR agents",
    version: "1.0.0",
    enabled: true,
    priority: 5,
    conditions: [
      {
        field: "resource",
        operator: "contains",
        value: "hr.",
      },
      {
        field: "agentType",
        operator: "not_equals",
        value: "hr-agent",
      },
    ],
    conditionLogic: "AND",
    action: "deny",
    parameters: {
      logLevel: "warn",
      alertTeam: "security",
    },
    createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
  },
  {
    policyId: "rate-limit-tool-calls",
    name: "Rate Limit Tool Calls",
    description:
      "Applies rate limiting when an agent exceeds 100 tool calls per minute",
    version: "1.0.0",
    enabled: true,
    priority: 30,
    conditions: [
      {
        field: "toolCallsInWindow",
        operator: "gt",
        value: 100,
      },
    ],
    conditionLogic: "AND",
    action: "rate_limit",
    parameters: {
      windowMs: 60000,
      maxCallsPerWindow: 100,
      retryAfterMs: 10000,
    },
    createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
  },
  {
    policyId: "quarantine-on-repeated-violations",
    name: "Quarantine on Repeated Policy Violations",
    description:
      "Quarantines agents that have 3 or more policy violations in a single day",
    version: "1.0.0",
    enabled: true,
    priority: 1, // highest priority – evaluated first
    conditions: [
      {
        field: "policyViolationsToday",
        operator: "gte",
        value: 3,
      },
    ],
    conditionLogic: "AND",
    action: "quarantine",
    parameters: {
      quarantineDurationMs: 3600000,
      alertTeam: "security",
      requireManualRelease: true,
    },
    createdAt: new Date("2025-01-01T00:00:00Z").toISOString(),
    updatedAt: new Date("2025-01-01T00:00:00Z").toISOString(),
  },
];

// --------------- PolicyEngine ---------------

export class PolicyEngine {
  private policies: Map<string, Policy> = new Map();

  constructor(includeDefaults = true) {
    if (includeDefaults) {
      for (const p of DEFAULT_POLICIES) {
        this.policies.set(p.policyId, { ...p });
      }
    }
  }

  registerPolicy(policy: Policy): void {
    const existing = this.policies.get(policy.policyId);
    if (existing) {
      // Overwrite but preserve creation timestamp
      this.policies.set(policy.policyId, {
        ...policy,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      this.policies.set(policy.policyId, {
        ...policy,
        createdAt: policy.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  enablePolicy(policyId: string): void {
    const policy = this.policies.get(policyId);
    if (!policy) throw new Error(`Policy not found: ${policyId}`);
    this.policies.set(policyId, {
      ...policy,
      enabled: true,
      updatedAt: new Date().toISOString(),
    });
  }

  disablePolicy(policyId: string): void {
    const policy = this.policies.get(policyId);
    if (!policy) throw new Error(`Policy not found: ${policyId}`);
    this.policies.set(policyId, {
      ...policy,
      enabled: false,
      updatedAt: new Date().toISOString(),
    });
  }

  getPolicies(): Policy[] {
    return Array.from(this.policies.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  /**
   * Evaluate context against all matching policies and return the highest-priority result.
   * Priority order of actions: quarantine > deny > rate_limit > require_approval > modify > allow
   */
  evaluateAction(context: ActionContext): PolicyResult {
    const results = this.evaluateAll(context);

    if (results.length === 0) {
      return {
        action: "allow",
        policyId: "default-allow",
        reason: "No matching policies found. Defaulting to allow.",
        confidence: 1.0,
      };
    }

    // Action precedence map: higher = more restrictive
    const precedence: Record<string, number> = {
      allow: 0,
      modify: 1,
      rate_limit: 2,
      require_approval: 3,
      deny: 4,
      quarantine: 5,
    };

    results.sort((a, b) => {
      const ap = precedence[a.action] ?? 0;
      const bp = precedence[b.action] ?? 0;
      return bp - ap; // most restrictive first
    });

    return results[0];
  }

  /**
   * Run all enabled policies against the context and return every matching result.
   * Results are sorted by policy priority (ascending).
   */
  evaluateAll(context: ActionContext): PolicyResult[] {
    const sorted = this.getPolicies(); // already sorted by priority
    const results: PolicyResult[] = [];

    for (const policy of sorted) {
      if (!policy.enabled) continue;
      if (policyMatches(policy, context)) {
        results.push({
          action: policy.action,
          policyId: policy.policyId,
          reason: `Policy "${policy.name}" matched: ${policy.description}`,
          confidence: 0.95,
          metadata: policy.parameters,
        });
      }
    }

    return results;
  }
}
