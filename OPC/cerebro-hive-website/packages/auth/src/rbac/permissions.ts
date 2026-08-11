/**
 * @cerebro/auth — RBAC permission system
 * Fine-grained permissions per org role.
 */

// ── Roles ─────────────────────────────────────────────────────────────────────

export type OrgRole = "OWNER" | "ADMIN" | "DEVELOPER" | "ANALYST" | "VIEWER";

export type AgentRegistryPermission =
  | "agent.read"
  | "agent.create"
  | "agent.draft.edit"
  | "agent.version.publish"
  | "agent.lifecycle.certify"
  | "agent.lifecycle.promote_production"
  | "agent.lifecycle.suspend";

const AGENT_REGISTRY_PERMISSION_MAP: Record<OrgRole, ReadonlySet<AgentRegistryPermission>> = {
  VIEWER: new Set(["agent.read"]),
  ANALYST: new Set(["agent.read"]),
  DEVELOPER: new Set(["agent.read", "agent.create", "agent.draft.edit"]),
  ADMIN: new Set([
    "agent.read", "agent.create", "agent.draft.edit", "agent.version.publish", "agent.lifecycle.certify",
  ]),
  OWNER: new Set([
    "agent.read", "agent.create", "agent.draft.edit", "agent.version.publish", "agent.lifecycle.certify",
    "agent.lifecycle.promote_production", "agent.lifecycle.suspend",
  ]),
};

export function getAgentRegistryPermissions(role: OrgRole): AgentRegistryPermission[] {
  return Array.from(AGENT_REGISTRY_PERMISSION_MAP[role] ?? []);
}

export function hasAgentRegistryPermission(role: OrgRole, permission: AgentRegistryPermission): boolean {
  return AGENT_REGISTRY_PERMISSION_MAP[role]?.has(permission) ?? false;
}

// ── Permissions ───────────────────────────────────────────────────────────────

export type RBACPermission =
  // Organization
  | "org:read"
  | "org:update"
  | "org:delete"
  | "org:manage_billing"
  // Members
  | "members:read"
  | "members:invite"
  | "members:remove"
  | "members:manage_roles"
  // API Keys
  | "api_keys:read"
  | "api_keys:create"
  | "api_keys:revoke"
  // Workflows
  | "workflows:read"
  | "workflows:create"
  | "workflows:update"
  | "workflows:delete"
  | "workflows:publish"
  | "workflows:execute"
  // Agents
  | "agents:read"
  | "agents:create"
  | "agents:update"
  | "agents:delete"
  | "agents:run"
  // Knowledge
  | "knowledge:read"
  | "knowledge:create"
  | "knowledge:update"
  | "knowledge:delete"
  | "knowledge:upload"
  // AI
  | "ai:chat"
  | "ai:usage_read"
  | "ai:settings_update"
  // Feature flags
  | "feature_flags:read"
  | "feature_flags:manage"
  // Audit
  | "audit:read"
  // Settings
  | "settings:read"
  | "settings:update";

// ── Role → RBACPermission mapping ─────────────────────────────────────────────────

const OWNER_PERMISSIONS = new Set<RBACPermission>([
  "org:read", "org:update", "org:delete", "org:manage_billing",
  "members:read", "members:invite", "members:remove", "members:manage_roles",
  "api_keys:read", "api_keys:create", "api_keys:revoke",
  "workflows:read", "workflows:create", "workflows:update", "workflows:delete", "workflows:publish", "workflows:execute",
  "agents:read", "agents:create", "agents:update", "agents:delete", "agents:run",
  "knowledge:read", "knowledge:create", "knowledge:update", "knowledge:delete", "knowledge:upload",
  "ai:chat", "ai:usage_read", "ai:settings_update",
  "feature_flags:read", "feature_flags:manage",
  "audit:read",
  "settings:read", "settings:update",
]);

const ADMIN_PERMISSIONS = new Set<RBACPermission>([
  "org:read", "org:update",
  "members:read", "members:invite", "members:remove", "members:manage_roles",
  "api_keys:read", "api_keys:create", "api_keys:revoke",
  "workflows:read", "workflows:create", "workflows:update", "workflows:delete", "workflows:publish", "workflows:execute",
  "agents:read", "agents:create", "agents:update", "agents:delete", "agents:run",
  "knowledge:read", "knowledge:create", "knowledge:update", "knowledge:delete", "knowledge:upload",
  "ai:chat", "ai:usage_read", "ai:settings_update",
  "feature_flags:read", "feature_flags:manage",
  "audit:read",
  "settings:read", "settings:update",
]);

const DEVELOPER_PERMISSIONS = new Set<RBACPermission>([
  "org:read",
  "members:read",
  "api_keys:read", "api_keys:create",
  "workflows:read", "workflows:create", "workflows:update", "workflows:publish", "workflows:execute",
  "agents:read", "agents:create", "agents:update", "agents:run",
  "knowledge:read", "knowledge:create", "knowledge:update", "knowledge:upload",
  "ai:chat", "ai:usage_read",
  "feature_flags:read",
  "settings:read",
]);

const ANALYST_PERMISSIONS = new Set<RBACPermission>([
  "org:read",
  "members:read",
  "workflows:read", "workflows:execute",
  "agents:read", "agents:run",
  "knowledge:read",
  "ai:chat", "ai:usage_read",
  "settings:read",
]);

const VIEWER_PERMISSIONS = new Set<RBACPermission>([
  "org:read",
  "members:read",
  "workflows:read",
  "agents:read",
  "knowledge:read",
  "settings:read",
]);

export const PERMISSION_MAP: Record<OrgRole, Set<RBACPermission>> = {
  OWNER:     OWNER_PERMISSIONS,
  ADMIN:     ADMIN_PERMISSIONS,
  DEVELOPER: DEVELOPER_PERMISSIONS,
  ANALYST:   ANALYST_PERMISSIONS,
  VIEWER:    VIEWER_PERMISSIONS,
};

export function hasPermission(role: OrgRole, permission: RBACPermission): boolean {
  return PERMISSION_MAP[role]?.has(permission) ?? false;
}

export function getPermissions(role: OrgRole): RBACPermission[] {
  return Array.from(PERMISSION_MAP[role] ?? []);
}

/** Returns the highest role from a list (ordered OWNER > ADMIN > ...) */
const ROLE_ORDER: OrgRole[] = ["OWNER", "ADMIN", "DEVELOPER", "ANALYST", "VIEWER"];

export function highestRole(roles: OrgRole[]): OrgRole | null {
  for (const r of ROLE_ORDER) {
    if (roles.includes(r)) return r;
  }
  return null;
}
