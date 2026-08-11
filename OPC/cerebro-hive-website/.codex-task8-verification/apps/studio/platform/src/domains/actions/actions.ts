import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import type { FlowService } from "../flow/flow.js";

/**
 * Cerebro Actions™ — the "Autonomous Execution" pillar of the Enterprise
 * Cognitive OS: not recommendations, execution. A governed catalog of
 * enterprise action connectors (Jira, GitHub, Kubernetes, email, CRM, ERP,
 * infrastructure, internal workflows) with policy-gated, human-approval-gated
 * (for high-blast-radius actions), fully audited execution. Where the
 * platform already owns a real capability (triggering a Flow workflow) the
 * action performs it for real; everything else uses the same seeded
 * deterministic-simulation philosophy as DevOps/SecOps so demos are safe and
 * reproducible without live third-party credentials.
 */

export type ActionKind =
  | "create_jira_ticket" | "open_github_pr" | "deploy_kubernetes" | "send_email"
  | "update_crm_record" | "update_erp_record" | "provision_infrastructure" | "trigger_workflow";

export interface ActionDefinition { kind: ActionKind; title: string; category: "dev" | "infra" | "comms" | "crm" | "erp" | "orchestration"; requiresApproval: boolean; description: string }

export const ACTION_CATALOG: ActionDefinition[] = [
  { kind: "create_jira_ticket", title: "Create Jira Ticket", category: "dev", requiresApproval: false, description: "Files a new issue in the configured Jira project." },
  { kind: "open_github_pr", title: "Open GitHub PR", category: "dev", requiresApproval: false, description: "Opens a pull request against the configured repository." },
  { kind: "deploy_kubernetes", title: "Deploy to Kubernetes", category: "infra", requiresApproval: true, description: "Rolls out a new deployment/version to a Kubernetes cluster." },
  { kind: "send_email", title: "Send Email", category: "comms", requiresApproval: false, description: "Sends a transactional or notification email." },
  { kind: "update_crm_record", title: "Update CRM Record", category: "crm", requiresApproval: false, description: "Updates a contact, deal, or account record in the CRM." },
  { kind: "update_erp_record", title: "Update ERP Record", category: "erp", requiresApproval: true, description: "Updates a financial or operational record in the ERP system." },
  { kind: "provision_infrastructure", title: "Provision Infrastructure", category: "infra", requiresApproval: true, description: "Provisions new cloud infrastructure (compute, storage, network)." },
  { kind: "trigger_workflow", title: "Trigger Internal Workflow", category: "orchestration", requiresApproval: false, description: "Runs a registered Cerebro Flow workflow — executed for real, not simulated." },
];

export type ActionStatus = "executed" | "pending_approval" | "denied" | "failed";

export interface ActionExecution {
  id: string; organizationId: string; kind: ActionKind; params: Record<string, unknown>;
  status: ActionStatus; result?: Record<string, unknown>; requestedBy: string; requestedAt: string;
}

export interface ActionsRepository {
  insert(a: ActionExecution): Promise<void>;
  list(org: string, limit?: number): Promise<ActionExecution[]>;
}

export class InMemoryActionsRepository implements ActionsRepository {
  rows: ActionExecution[] = [];
  async insert(a: ActionExecution) { this.rows.push(a); }
  async list(org: string, limit = 100) { return this.rows.filter(a => a.organizationId === org).slice(-limit).reverse(); }
}

function hash32(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export class ActionsService {
  constructor(
    private readonly repo: ActionsRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly flow: FlowService,
  ) {}

  catalog(): ActionDefinition[] { return ACTION_CATALOG; }

  async execute(ctx: RequestContext, input: { kind: ActionKind; params?: Record<string, unknown>; approved?: boolean }): Promise<ActionExecution> {
    this.policy.assert(ctx.principal, "actions:execute", { kind: "action", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const def = ACTION_CATALOG.find(a => a.kind === input.kind);
    if (!def) throw PlatformError.notFound("action", input.kind);
    const params = input.params ?? {};

    const record: ActionExecution = {
      id: newId("act"), organizationId: org, kind: def.kind, params,
      status: "executed", requestedBy: ctx.principal.userId, requestedAt: new Date().toISOString(),
    };

    if (def.requiresApproval && !input.approved) {
      record.status = "pending_approval";
      await this.repo.insert(record);
      await this.bus.publish(Subjects.actions.approvalRequired, { actionId: record.id, kind: def.kind }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      return record;
    }

    try {
      record.result = def.kind === "trigger_workflow"
        ? await this.runWorkflow(ctx, params)
        : this.simulate(def.kind, params, record.id);
      record.status = "executed";
    } catch (err) {
      record.status = "failed";
      record.result = { error: err instanceof Error ? err.message : String(err) };
    }

    await this.repo.insert(record);
    await this.bus.publish(Subjects.actions.executed, { actionId: record.id, kind: def.kind, status: record.status }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return record;
  }

  private async runWorkflow(ctx: RequestContext, params: Record<string, unknown>): Promise<Record<string, unknown>> {
    const workflowId = String(params.workflowId ?? "");
    if (!workflowId) throw PlatformError.validation("trigger_workflow requires params.workflowId");
    const run = await this.flow.run(ctx, workflowId, (params.input as Record<string, unknown>) ?? {});
    return { runId: run.id, status: run.status };
  }

  /** Deterministic, offline-safe simulation of an enterprise connector call — same seeded philosophy as DevOps/SecOps. */
  private simulate(kind: ActionKind, params: Record<string, unknown>, seedId: string): Record<string, unknown> {
    const seed = hash32(`${kind}:${seedId}:${JSON.stringify(params)}`);
    switch (kind) {
      case "create_jira_ticket":
        return { ticketId: `${String(params.project ?? "OPS")}-${1000 + (seed % 9000)}`, url: `https://jira.internal/browse/${String(params.project ?? "OPS")}-${1000 + (seed % 9000)}`, status: "open" };
      case "open_github_pr":
        return { prNumber: 100 + (seed % 900), url: `https://github.com/${String(params.repo ?? "org/repo")}/pull/${100 + (seed % 900)}`, status: "open" };
      case "deploy_kubernetes":
        return { deployment: String(params.deployment ?? "app"), replicas: 1 + (seed % 5), cluster: String(params.cluster ?? "prod"), status: "rolled_out" };
      case "send_email":
        return { messageId: `msg_${(seed >>> 0).toString(16)}`, to: params.to ?? "unknown", status: "sent" };
      case "update_crm_record":
        return { recordId: String(params.recordId ?? `rec_${(seed >>> 0).toString(16)}`), fieldsUpdated: Object.keys((params.fields as object) ?? {}).length || 1, status: "updated" };
      case "update_erp_record":
        return { recordId: String(params.recordId ?? `erp_${(seed >>> 0).toString(16)}`), module: String(params.module ?? "finance"), status: "updated" };
      case "provision_infrastructure":
        return { resourceId: `res_${(seed >>> 0).toString(16)}`, resourceType: String(params.resourceType ?? "compute"), region: String(params.region ?? "us-east-1"), status: "provisioned" };
      default:
        return { status: "unknown_action" };
    }
  }

  list(ctx: RequestContext, limit?: number): Promise<ActionExecution[]> {
    this.policy.assert(ctx.principal, "actions:read", { kind: "action", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId, limit);
  }
}
