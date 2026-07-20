import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { WorldModel } from "../../ai/world/world.js";
import type { IntelligenceHub } from "../hub/hub.js";
import type { ObservatoryService } from "../observatory/observatory.js";
import type { MeshService } from "../mesh/mesh.js";
import type { GovernanceService } from "../governance/governance.js";
import type { KnowledgeFabric } from "../knowledge/knowledge.js";
import type { MemoryFabric } from "../memory/memory.js";
import type { RuntimeService } from "../runtime/runtime.js";

export interface Notification { id: string; organizationId: string; userId?: string; severity: "info" | "warning" | "critical"; title: string; body: string; read: boolean; createdAt: string }
export interface NotificationRepository { insert(n: Notification): Promise<void>; list(organizationId: string, limit?: number): Promise<Notification[]>; markRead(organizationId: string, id: string): Promise<void> }
export class InMemoryNotificationRepository implements NotificationRepository {
  rows: Notification[] = [];
  async insert(n: Notification) { this.rows.push(structuredClone(n)); }
  async list(org: string, limit = 50) { return this.rows.filter(r => r.organizationId === org).slice(-limit).reverse(); }
  async markRead(org: string, id: string) { const n = this.rows.find(r => r.id === id && r.organizationId === org); if (n) n.read = true; }
}

/**
 * CerebroSphere™ — mission control: executive cockpit aggregation, org explorer,
 * cross-product search, global notifications, and the mission timeline. This is
 * the API surface the application shell renders.
 */
export class SphereService {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly bus: EventBus,
    private readonly world: WorldModel,
    private readonly hub: IntelligenceHub,
    private readonly observatory: ObservatoryService,
    private readonly mesh: MeshService,
    private readonly governance: GovernanceService,
    private readonly knowledge: KnowledgeFabric,
    private readonly memory: MemoryFabric,
    private readonly runtime: RuntimeService,
  ) {
    this.attachNotificationProjections();
  }

  private attachNotificationProjections(): void {
    void this.bus.subscribe(Subjects.runtime.executionFailed, async e => {
      await this.notify(e.organizationId, "warning", "Execution failed", `Execution ${String(e.data.executionId)} failed: ${String(e.data.error ?? e.data.reason ?? "unknown")}`);
    });
    void this.bus.subscribe(Subjects.security.guardBlocked, async e => {
      await this.notify(e.organizationId, "critical", "Guard blocked input", `Risk ${String(e.data.riskScore)} — findings: ${(e.data.findings as string[] ?? []).join(", ")}`);
    });
    void this.bus.subscribe(Subjects.evaluation.regressionDetected, async e => {
      await this.notify(e.organizationId, "warning", "Eval regression", `Suite ${String(e.data.suite)} dropped to ${String(e.data.score)} (baseline ${String(e.data.baseline)})`);
    });
    void this.bus.subscribe(Subjects.governance.approvalRequested, async e => {
      await this.notify(e.organizationId, "info", "Approval requested", `${String(e.data.subjectKind)} ${String(e.data.subjectId)} awaits ${String(e.data.approverRole)}`);
    });
  }

  async notify(organizationId: string, severity: Notification["severity"], title: string, body: string, userId?: string): Promise<Notification> {
    const n: Notification = { id: newId("ntf"), organizationId, userId, severity, title, body, read: false, createdAt: new Date().toISOString() };
    await this.notifications.insert(n);
    await this.bus.publish(Subjects.platform.notification, { notificationId: n.id, severity, title }, { organizationId });
    return n;
  }

  listNotifications(ctx: RequestContext, limit = 50): Promise<Notification[]> {
    return this.notifications.list(ctx.principal.organizationId, limit);
  }

  /** Executive cockpit: one call, whole-platform posture. */
  async cockpit(ctx: RequestContext) {
    const [analytics, worldCounts, agents, approvals, notifications] = await Promise.all([
      this.hub.analytics(ctx),
      this.world.snapshot(ctx.principal.organizationId),
      this.mesh.directory(ctx),
      this.governance.listApprovals(ctx, "pending"),
      this.notifications.list(ctx.principal.organizationId, 10),
    ]);
    const overview = await this.observatory.overview(ctx);
    return {
      generatedAt: new Date().toISOString(),
      analytics, world: worldCounts,
      mesh: { total: agents.length, online: agents.filter(a => a.status === "online").length },
      governance: { pendingApprovals: approvals.length },
      observability: { spans: overview.spans.length, counters: Object.keys(overview.counters).length, costUsd: overview.cost.costUsd },
      notifications,
    };
  }

  /** Cross-product search: knowledge + memory + world + executions in one query. */
  async search(ctx: RequestContext, query: string) {
    const [knowledge, memories, world, executions] = await Promise.all([
      this.knowledge.search(ctx, query, { limit: 3 }).catch(() => ({ hits: [], citations: [], entities: [] })),
      this.memory.retrieve(ctx, { query, limit: 3 }).catch(() => []),
      this.world.semanticQuery(ctx.principal.organizationId, query, { limit: 3 }),
      this.runtime.list(ctx, { limit: 50 }),
    ]);
    const q = query.toLowerCase();
    return {
      query,
      knowledge: knowledge.hits.map(h => ({ title: h.documentTitle, snippet: h.text.slice(0, 160), score: h.score })),
      memory: memories.map(m => ({ tier: m.tier, snippet: m.content.slice(0, 160), score: Number(m.score.toFixed(3)) })),
      world: world.filter(w => w.score > 0.03).map(w => ({ kind: w.kind, name: w.name, score: Number(w.score.toFixed(3)) })),
      executions: executions.filter(e => e.goal.toLowerCase().includes(q)).slice(0, 3).map(e => ({ id: e.id, goal: e.goal.slice(0, 100), status: e.status })),
    };
  }

  /** Mission timeline: recent significant events across the whole platform. */
  async timeline(ctx: RequestContext, limit = 30) {
    const notifications = await this.notifications.list(ctx.principal.organizationId, limit);
    const executions = await this.runtime.list(ctx, { limit: 10 });
    const entries = [
      ...notifications.map(n => ({ at: n.createdAt, kind: `notification:${n.severity}`, title: n.title, detail: n.body.slice(0, 140) })),
      ...executions.map(e => ({ at: e.finishedAt ?? e.queuedAt, kind: `execution:${e.status}`, title: e.goal.slice(0, 80), detail: e.result?.output.slice(0, 120) ?? e.error ?? "" })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
    return { entries };
  }
}
