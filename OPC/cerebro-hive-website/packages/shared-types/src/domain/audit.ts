// ── Audit event domain types ──────────────────────────────────────────────────

import type { OrgId, UserId } from "./user.js";

export type AuditEventId = string & { readonly __brand: "AuditEventId" };

export type AuditEventType =
  // Auth
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "auth.mfa_enabled"
  | "auth.mfa_disabled"
  | "auth.password_reset"
  // Users
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.invited"
  | "user.role_changed"
  | "user.suspended"
  // Organization
  | "org.created"
  | "org.updated"
  | "org.settings_changed"
  | "org.plan_changed"
  | "org.sso_configured"
  // API Keys
  | "api_key.created"
  | "api_key.revoked"
  | "api_key.used"
  // Workflows
  | "workflow.created"
  | "workflow.updated"
  | "workflow.published"
  | "workflow.archived"
  | "workflow.deleted"
  | "workflow.executed"
  | "workflow.execution_failed"
  | "workflow.execution_cancelled"
  // Agents
  | "agent.created"
  | "agent.updated"
  | "agent.deployed"
  | "agent.deprecated"
  // Knowledge
  | "knowledge.collection_created"
  | "knowledge.document_uploaded"
  | "knowledge.document_deleted"
  // AI
  | "ai.provider_configured"
  | "ai.budget_exceeded"
  | "ai.cost_alert"
  // Billing
  | "billing.subscription_created"
  | "billing.subscription_updated"
  | "billing.subscription_cancelled"
  | "billing.payment_succeeded"
  | "billing.payment_failed"
  // Security
  | "security.suspicious_activity"
  | "security.rate_limit_exceeded"
  | "security.ip_blocked"
  | "security.policy_violation"
  // Admin
  | "admin.impersonation_started"
  | "admin.impersonation_ended"
  | "admin.data_export"
  | "admin.data_deletion";

export type AuditEventSeverity = "info" | "warning" | "critical";

export interface AuditEvent {
  id:          AuditEventId;
  orgId:       OrgId;
  actorId:     UserId | null;         // null for system events
  actorType:   "user" | "api_key" | "system" | "admin";
  actorEmail:  string | null;
  type:        AuditEventType;
  severity:    AuditEventSeverity;
  resourceType: string | null;        // "workflow", "user", etc.
  resourceId:   string | null;
  description:  string;
  before:       Record<string, unknown> | null;   // state before change
  after:        Record<string, unknown> | null;   // state after change
  metadata:     Record<string, unknown>;
  ipAddress:    string | null;
  userAgent:    string | null;
  traceId:      string | null;
  createdAt:    string;
}
