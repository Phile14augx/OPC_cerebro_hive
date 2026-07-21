import type { Principal } from "../context/context.js";
import { PlatformError } from "../errors/errors.js";

/** RBAC role → permission grants; permissions are "domain:action" with wildcard support. */
const ROLE_GRANTS: Record<string, string[]> = {
  system: ["*"],
  owner: ["*"],
  admin: ["*"],
  operator: [
    "runtime:*", "reasoning:*", "flow:*", "memory:*", "knowledge:*", "context:*",
    "mesh:read", "eval:*", "observatory:read", "hub:read", "simulator:*", "connect:invoke", "sphere:read", "ai:*",
    "governance:*", "web3:*", "devops:*", "mlops:*", "secops:*", "aiops:*",
    "compiler:*", "swarm:*", "actions:*",
    "digitaltwin:*", "research:*", "zerotrust:*", "dataplatform:*", "hiveforge:*", "cerebrostudio:*",
  ],
  developer: [
    "runtime:*", "reasoning:*", "memory:read", "memory:write", "knowledge:*", "context:*",
    "eval:*", "observatory:read", "simulator:*", "sphere:read", "ai:*", "flow:read", "flow:run",
    "web3:read", "web3:write", "governance:read",
    "devops:read", "devops:write", "mlops:read", "mlops:write", "secops:read", "aiops:read",
    "compiler:read", "compiler:write", "swarm:read", "swarm:write", "actions:read", "actions:execute",
    "digitaltwin:read", "digitaltwin:write", "research:read", "research:write", "zerotrust:read", "dataplatform:read", "dataplatform:write",
    "hiveforge:read", "hiveforge:write", "cerebrostudio:read", "cerebrostudio:write",
  ],
  analyst: [
    "knowledge:read", "hub:read", "observatory:read", "sphere:read", "memory:read", "eval:read", "governance:read", "web3:read",
    "devops:read", "mlops:read", "secops:read", "aiops:read",
    "compiler:read", "swarm:read", "actions:read",
    "digitaltwin:read", "research:read", "zerotrust:read", "dataplatform:read", "hiveforge:read", "cerebrostudio:read",
  ],
  viewer: ["*:read", "sphere:read"],
};

/** ABAC rule: applies extra conditions on top of role grants. */
export interface AbacRule {
  id: string;
  description: string;
  /** Return "allow" | "deny" | "abstain". */
  evaluate(principal: Principal, action: string, resource: { kind: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, string> }): "allow" | "deny" | "abstain";
}

const tenantIsolation: AbacRule = {
  id: "tenant-isolation",
  description: "A principal may only touch resources of its own organization",
  evaluate: (p, _a, r) => (r.organizationId && r.organizationId !== p.organizationId && !p.roles.includes("system") ? "deny" : "abstain"),
};

const workspaceScoping: AbacRule = {
  id: "workspace-scoping",
  description: "Workspace-scoped principals cannot cross workspaces",
  evaluate: (p, _a, r) =>
    p.workspaceId && r.workspaceId && r.workspaceId !== p.workspaceId ? "deny" : "abstain",
};

export class PolicyEngine {
  private rules: AbacRule[] = [tenantIsolation, workspaceScoping];

  addRule(rule: AbacRule): void { this.rules.push(rule); }

  can(principal: Principal, action: string, resource: { kind: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, string> }): boolean {
    for (const rule of this.rules) {
      const verdict = rule.evaluate(principal, action, resource);
      if (verdict === "deny") return false;
    }
    const [domain, verb] = action.split(":");
    for (const role of principal.roles) {
      for (const grant of ROLE_GRANTS[role] ?? []) {
        if (grant === "*") return true;
        const [gd, gv] = grant.split(":");
        if ((gd === "*" || gd === domain) && (gv === "*" || gv === verb)) return true;
      }
    }
    return false;
  }

  assert(principal: Principal, action: string, resource: { kind: string; organizationId?: string; workspaceId?: string; attributes?: Record<string, string> }): void {
    if (!this.can(principal, action, resource)) {
      throw PlatformError.forbidden(`principal lacks permission ${action} on ${resource.kind}`);
    }
  }
}
