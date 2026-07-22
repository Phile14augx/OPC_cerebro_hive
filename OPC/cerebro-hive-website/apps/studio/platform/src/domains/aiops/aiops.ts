import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { ObservatoryService } from "../observatory/observatory.js";
import type { GuardService } from "../guard/guard.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro AIOps™ — anomaly detection over the platform's own telemetry
 * (Observatory metrics + execution stats) and security signal (Guard
 * events), incident creation with correlation across signals, and
 * playbook-driven remediation suggestions. Closes the operate loop the
 * DevOps/AI-engineering handbook calls for: observe -> detect -> correlate
 * -> remediate.
 */

export type AnomalyKind = "error_rate_spike" | "latency_spike" | "guard_block_spike" | "cost_spike";
export type IncidentSeverity = "sev4" | "sev3" | "sev2" | "sev1";
export type IncidentStatus = "open" | "correlated" | "remediating" | "resolved";

export interface Anomaly { id: string; organizationId: string; kind: AnomalyKind; metric: string; baseline: number; observed: number; detectedAt: string }

export interface Incident {
  id: string; organizationId: string; title: string; severity: IncidentSeverity; status: IncidentStatus;
  anomalyIds: string[]; correlatedSignals: string[]; suggestedPlaybook?: string; openedAt: string; resolvedAt?: string;
}

export interface AiopsRepository {
  insertAnomaly(a: Anomaly): Promise<void>;
  listAnomalies(org: string, limit?: number): Promise<Anomaly[]>;
  insertIncident(i: Incident): Promise<void>;
  updateIncident(i: Incident): Promise<void>;
  listIncidents(org: string, status?: IncidentStatus): Promise<Incident[]>;
}

export class InMemoryAiopsRepository implements AiopsRepository {
  anomalies: Anomaly[] = [];
  incidents = new Map<string, Incident>();

  async insertAnomaly(a: Anomaly) { this.anomalies.push(a); }
  async listAnomalies(org: string, limit = 100) { return this.anomalies.filter(a => a.organizationId === org).slice(-limit).reverse(); }
  async insertIncident(i: Incident) { this.incidents.set(i.id, structuredClone(i)); }
  async updateIncident(i: Incident) { this.incidents.set(i.id, structuredClone(i)); }
  async listIncidents(org: string, status?: IncidentStatus) {
    return [...this.incidents.values()].filter(i => i.organizationId === org && (!status || i.status === status)).reverse();
  }
}

/** Remediation playbooks keyed by anomaly kind — deterministic, human-readable runbook steps (AIOps auto-remediation suggestion). */
const PLAYBOOKS: Record<AnomalyKind, string> = {
  error_rate_spike: "Roll back the most recent deployment for the affected service; if unresolved, scale down traffic via canary and page on-call.",
  latency_spike: "Check downstream dependency health (DB, cache, AI provider); scale replicas horizontally; enable request shedding if p99 exceeds SLA.",
  guard_block_spike: "Review recent Guard-blocked inputs for a coordinated prompt-injection campaign; consider temporary rate-limit tightening on the affected API key.",
  cost_spike: "Identify the top AI-call consumer by workspace; verify no runaway retry loop; apply a temporary per-workspace token budget.",
};

function severityFor(kind: AnomalyKind, ratio: number): IncidentSeverity {
  if (ratio >= 4) return "sev1";
  if (ratio >= 2.5) return "sev2";
  if (ratio >= 1.5) return "sev3";
  return "sev4";
}

export class AiopsService {
  constructor(
    private readonly repo: AiopsRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly observatory: ObservatoryService,
    private readonly guard: GuardService,
  ) {}

  /** Scans current telemetry against supplied baselines and opens anomalies/incidents for anything materially over baseline. */
  async detect(ctx: RequestContext, baselines?: Partial<Record<AnomalyKind, number>>): Promise<{ anomalies: Anomaly[]; incidents: Incident[] }> {
    this.policy.assert(ctx.principal, "aiops:write", { kind: "anomaly", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const [stats, guardEvents] = await Promise.all([
      this.observatory.executionStats(ctx),
      this.guard.recentEvents(ctx),
    ]);
    const failed = stats.byStatus.failed ?? 0;
    const errorRate = stats.total > 0 ? failed / stats.total : 0;
    const blockedCount = guardEvents.filter((e: { blocked: boolean }) => e.blocked).length;

    const b = { error_rate_spike: 0.1, guard_block_spike: 3, latency_spike: 500, cost_spike: 5, ...baselines };
    const observations: { kind: AnomalyKind; metric: string; baseline: number; observed: number }[] = [
      { kind: "error_rate_spike", metric: "execution.error_rate", baseline: b.error_rate_spike!, observed: errorRate },
      { kind: "guard_block_spike", metric: "guard.blocked_count", baseline: b.guard_block_spike!, observed: blockedCount },
    ];

    const anomalies: Anomaly[] = [];
    const incidents: Incident[] = [];
    for (const obs of observations) {
      if (obs.baseline <= 0 || obs.observed <= obs.baseline) continue;
      const anomaly: Anomaly = {
        id: newId("anom"), organizationId: org, kind: obs.kind, metric: obs.metric,
        baseline: obs.baseline, observed: obs.observed, detectedAt: new Date().toISOString(),
      };
      anomalies.push(anomaly);
      await this.repo.insertAnomaly(anomaly);
      await this.bus.publish(Subjects.aiops.anomalyDetected, { anomalyId: anomaly.id, kind: anomaly.kind, observed: anomaly.observed, baseline: anomaly.baseline }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

      const ratio = obs.observed / obs.baseline;
      const incident: Incident = {
        id: newId("incident"), organizationId: org, title: `${obs.kind.replace(/_/g, " ")}: ${obs.observed} vs baseline ${obs.baseline}`,
        severity: severityFor(obs.kind, ratio), status: "open", anomalyIds: [anomaly.id], correlatedSignals: [],
        suggestedPlaybook: PLAYBOOKS[obs.kind], openedAt: new Date().toISOString(),
      };
      incidents.push(incident);
      await this.repo.insertIncident(incident);
      await this.bus.publish(Subjects.aiops.incidentOpened, { incidentId: incident.id, severity: incident.severity, title: incident.title }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      await this.bus.publish(Subjects.aiops.remediationSuggested, { incidentId: incident.id, playbook: incident.suggestedPlaybook }, { organizationId: org, traceId: ctx.traceId });
    }

    // Correlate open incidents that fired within the same detection pass — a real signal that they share a root cause.
    if (incidents.length > 1) {
      const ids = incidents.map(i => i.id);
      for (const incident of incidents) {
        incident.status = "correlated";
        incident.correlatedSignals = ids.filter(id => id !== incident.id);
        await this.repo.updateIncident(incident);
        await this.bus.publish(Subjects.aiops.incidentCorrelated, { incidentId: incident.id, correlatedWith: incident.correlatedSignals }, { organizationId: org, traceId: ctx.traceId });
      }
    }

    return { anomalies, incidents };
  }

  async listAnomalies(ctx: RequestContext, limit?: number): Promise<Anomaly[]> {
    this.policy.assert(ctx.principal, "aiops:read", { kind: "anomaly", organizationId: ctx.principal.organizationId });
    return this.repo.listAnomalies(ctx.principal.organizationId, limit);
  }

  async listIncidents(ctx: RequestContext, status?: IncidentStatus): Promise<Incident[]> {
    this.policy.assert(ctx.principal, "aiops:read", { kind: "incident", organizationId: ctx.principal.organizationId });
    return this.repo.listIncidents(ctx.principal.organizationId, status);
  }

  async resolveIncident(ctx: RequestContext, incidentId: string): Promise<Incident> {
    this.policy.assert(ctx.principal, "aiops:write", { kind: "incident", organizationId: ctx.principal.organizationId });
    const incident = (await this.repo.listIncidents(ctx.principal.organizationId)).find(i => i.id === incidentId);
    if (!incident) throw PlatformError.notFound("incident", incidentId);
    incident.status = "resolved";
    incident.resolvedAt = new Date().toISOString();
    await this.repo.updateIncident(incident);
    await this.bus.publish(Subjects.aiops.incidentResolved, { incidentId }, { organizationId: incident.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return incident;
  }
}
