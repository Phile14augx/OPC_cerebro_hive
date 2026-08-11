import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { AuditService } from "../../kernel/governance-audit/audit.js";
import type { ApprovalGateway } from "../flow/flow.js";

export interface Approval {
  id: string; organizationId: string; subjectKind: string; subjectId: string;
  requestedBy: string; approverRole: string; status: "pending" | "approved" | "rejected";
  reason?: string; decidedBy?: string; decidedAt?: string; createdAt: string;
}

export interface ApprovalRepository {
  insert(a: Approval): Promise<void>;
  update(a: Approval): Promise<void>;
  get(organizationId: string, id: string): Promise<Approval | undefined>;
  list(organizationId: string, status?: Approval["status"]): Promise<Approval[]>;
}

export class InMemoryApprovalRepository implements ApprovalRepository {
  rows = new Map<string, Approval>();
  async insert(a: Approval) { this.rows.set(a.id, structuredClone(a)); }
  async update(a: Approval) { this.rows.set(a.id, structuredClone(a)); }
  async get(org: string, id: string) { const a = this.rows.get(id); return a?.organizationId === org ? structuredClone(a) : undefined; }
  async list(org: string, status?: Approval["status"]) {
    return [...this.rows.values()].filter(a => a.organizationId === org && (!status || a.status === status)).map(a => structuredClone(a));
  }
}

/** Compliance control mappings the platform can attest to. */
export const COMPLIANCE_CONTROLS = {
  SOC2: [
    { id: "CC6.1", name: "Logical access controls", evidence: "RBAC/ABAC policy engine on every service call" },
    { id: "CC7.2", name: "Anomaly monitoring", evidence: "Observatory metrics + representation-layer anomaly detection" },
    { id: "CC8.1", name: "Change management", evidence: "Versioned workflows/prompts + audit trail of mutations" },
  ],
  ISO27001: [
    { id: "A.9", name: "Access control", evidence: "API keys, roles, tenant isolation rules" },
    { id: "A.12.4", name: "Logging and monitoring", evidence: "Structured audit log with actor/action/resource" },
  ],
  GDPR: [
    { id: "Art.5", name: "Data minimisation", evidence: "Guard PII redaction before storage; retention sweeps" },
    { id: "Art.17", name: "Right to erasure", evidence: "Memory expiration + retention policies" },
  ],
  HIPAA: [
    { id: "164.312", name: "Technical safeguards", evidence: "Access control, audit controls, transmission security posture" },
  ],
} as const;

export interface RetentionPolicy { resource: "memory" | "audit" | "executions" | "guard_events"; maxAgeDays: number }

/**
 * Cerebro Governance™ — approval workflows, audit surface, retention,
 * lifecycle, and compliance control attestation. Implements the Flow
 * ApprovalGateway so workflow approval nodes route through governance.
 */
export class GovernanceService implements ApprovalGateway {
  private retention: RetentionPolicy[] = [
    { resource: "memory", maxAgeDays: 180 },
    { resource: "audit", maxAgeDays: 365 },
    { resource: "executions", maxAgeDays: 90 },
    { resource: "guard_events", maxAgeDays: 90 },
  ];

  constructor(
    private readonly repo: ApprovalRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly audit: AuditService,
  ) {}

  async request(ctx: RequestContext, subjectKind: string, subjectId: string, approverRole: string): Promise<string> {
    const approval: Approval = {
      id: newId("apr"), organizationId: ctx.principal.organizationId, subjectKind, subjectId,
      requestedBy: ctx.principal.userId, approverRole, status: "pending", createdAt: new Date().toISOString(),
    };
    await this.repo.insert(approval);
    await this.bus.publish(Subjects.governance.approvalRequested, { approvalId: approval.id, subjectKind, subjectId, approverRole }, { organizationId: approval.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    await this.audit.record({ organizationId: approval.organizationId, actor: ctx.principal.userId, action: "approval.requested", resource: subjectKind, resourceId: subjectId, details: { approvalId: approval.id }, traceId: ctx.traceId });
    return approval.id;
  }

  async status(organizationId: string, approvalId: string): Promise<"pending" | "approved" | "rejected"> {
    const a = await this.repo.get(organizationId, approvalId);
    if (!a) throw PlatformError.notFound("approval", approvalId);
    return a.status;
  }

  async decide(ctx: RequestContext, approvalId: string, decision: "approved" | "rejected", reason?: string): Promise<Approval> {
    this.policy.assert(ctx.principal, "governance:write", { kind: "approval", organizationId: ctx.principal.organizationId });
    const approval = await this.repo.get(ctx.principal.organizationId, approvalId);
    if (!approval) throw PlatformError.notFound("approval", approvalId);
    if (approval.status !== "pending") throw new PlatformError("precondition_failed", `approval already ${approval.status}`);
    const canApprove = ctx.principal.roles.some(r => r === approval.approverRole || r === "owner" || r === "admin" || r === "system");
    if (!canApprove) throw PlatformError.forbidden(`requires role ${approval.approverRole}`);
    approval.status = decision;
    approval.reason = reason;
    approval.decidedBy = ctx.principal.userId;
    approval.decidedAt = new Date().toISOString();
    await this.repo.update(approval);
    await this.bus.publish(Subjects.governance.approvalDecided, { approvalId, decision }, { organizationId: approval.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    await this.audit.record({ organizationId: approval.organizationId, actor: ctx.principal.userId, action: `approval.${decision}`, resource: approval.subjectKind, resourceId: approval.subjectId, details: { reason: reason ?? null }, traceId: ctx.traceId });
    return approval;
  }

  listApprovals(ctx: RequestContext, status?: Approval["status"]): Promise<Approval[]> {
    this.policy.assert(ctx.principal, "governance:read", { kind: "approval", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId, status);
  }

  compliancePosture(): typeof COMPLIANCE_CONTROLS { return COMPLIANCE_CONTROLS; }
  retentionPolicies(): RetentionPolicy[] { return [...this.retention]; }
  setRetention(ctx: RequestContext, policy: RetentionPolicy): void {
    this.policy.assert(ctx.principal, "governance:write", { kind: "retention", organizationId: ctx.principal.organizationId });
    this.retention = [...this.retention.filter(r => r.resource !== policy.resource), policy];
  }
}
