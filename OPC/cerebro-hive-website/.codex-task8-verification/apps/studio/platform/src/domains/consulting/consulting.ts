import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import type { EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { XGateway } from "../../ai/x/gateway.js";
import type { WorldModel } from "../../ai/world/world.js";
import type { FlowService } from "../flow/flow.js";
import type { KnowledgeFabric } from "../knowledge/knowledge.js";
import type { SimulatorService } from "../simulator/simulator.js";
import { CONSULTING_CATALOG, ENGAGEMENT_PHASES, MATURITY_LEVELS, type ConsultingCapability, type EngagementPhase } from "./catalog.js";

const SUBJECTS = {
  engagementCreated: "consulting.engagement.created",
  phaseAdvanced: "consulting.engagement.phase",
  assessmentCompleted: "consulting.assessment.completed",
  roadmapGenerated: "consulting.roadmap.generated",
} as const;

export interface Engagement {
  id: string; organizationId: string; capabilityId: string; client: string;
  objectives: string[]; phase: EngagementPhase; phaseHistory: { phase: EngagementPhase; at: string; note?: string }[];
  workflowId?: string; assessmentId?: string; roadmapId?: string; status: "active" | "completed" | "paused";
  createdAt: string; updatedAt: string;
}

export interface ReadinessAssessment {
  id: string; organizationId: string; engagementId?: string; client: string;
  scores: Record<string, number>; overall: number; level: typeof MATURITY_LEVELS[number];
  gaps: { dimension: string; score: number; gap: string; recommendation: string }[];
  narrative: string; createdAt: string;
}

export interface Roadmap {
  id: string; organizationId: string; engagementId: string;
  horizonQuarters: number;
  initiatives: { quarter: number; phase: EngagementPhase; title: string; capability: string; kpi: string }[];
  projectedMaturity: number[]; createdAt: string;
}

export interface ConsultingRepository {
  insertEngagement(e: Engagement): Promise<void>;
  updateEngagement(e: Engagement): Promise<void>;
  getEngagement(organizationId: string, id: string): Promise<Engagement | undefined>;
  listEngagements(organizationId: string): Promise<Engagement[]>;
  insertAssessment(a: ReadinessAssessment): Promise<void>;
  getAssessment(organizationId: string, id: string): Promise<ReadinessAssessment | undefined>;
  insertRoadmap(r: Roadmap): Promise<void>;
  getRoadmap(organizationId: string, id: string): Promise<Roadmap | undefined>;
}

export class InMemoryConsultingRepository implements ConsultingRepository {
  engagements = new Map<string, Engagement>();
  assessments = new Map<string, ReadinessAssessment>();
  roadmaps = new Map<string, Roadmap>();
  async insertEngagement(e: Engagement) { this.engagements.set(e.id, structuredClone(e)); }
  async updateEngagement(e: Engagement) { this.engagements.set(e.id, structuredClone(e)); }
  async getEngagement(org: string, id: string) { const e = this.engagements.get(id); return e?.organizationId === org ? structuredClone(e) : undefined; }
  async listEngagements(org: string) { return [...this.engagements.values()].filter(e => e.organizationId === org).map(e => structuredClone(e)); }
  async insertAssessment(a: ReadinessAssessment) { this.assessments.set(a.id, structuredClone(a)); }
  async getAssessment(org: string, id: string) { const a = this.assessments.get(id); return a?.organizationId === org ? structuredClone(a) : undefined; }
  async insertRoadmap(r: Roadmap) { this.roadmaps.set(r.id, structuredClone(r)); }
  async getRoadmap(org: string, id: string) { const r = this.roadmaps.get(id); return r?.organizationId === org ? structuredClone(r) : undefined; }
}

const GAP_PLAYBOOK: Record<string, { gap: string; recommendation: string }> = {
  strategy: { gap: "No prioritized AI portfolio tied to value-chain economics", recommendation: "Run CerebroAI Strategy™ assess+strategy phases; stand up an executive AI council with a 90-day roadmap." },
  data: { gap: "Fragmented data estate; retrieval is manual and ungoverned", recommendation: "Deploy Enterprise Intelligence Modernization™: ontology, ETL/RAG pipelines, knowledge graph with citations." },
  platform: { gap: "No production runtime for agents; experiments live in notebooks", recommendation: "Stand up AI Platform Engineering™: the Enterprise AI OS runtime, CI/CD, observability, cost controls." },
  talent: { gap: "AI skills concentrated in a small group; no enablement loop", recommendation: "Launch an AI Center of Excellence™ with training curriculum and reusable pattern library." },
  governance: { gap: "No policy enforcement or audit trail in the AI execution path", recommendation: "Adopt AI Governance & Trust™: Guard in the runtime path, approvals, compliance scorecards." },
};

/**
 * Core Consulting Capabilities — the ten practice areas operationalized on the
 * Enterprise AI OS. Engagements compile to approval-gated Flow workflows,
 * assessments are ingested into the Knowledge Fabric (searchable, citable),
 * and roadmaps project maturity using the Simulator.
 */
export class ConsultingService {
  constructor(
    private readonly repo: ConsultingRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly x: XGateway,
    private readonly world: WorldModel,
    private readonly flow: FlowService,
    private readonly knowledge: KnowledgeFabric,
    private readonly simulator: SimulatorService,
  ) {}

  catalog(): ConsultingCapability[] { return CONSULTING_CATALOG; }

  capability(id: string): ConsultingCapability {
    const c = CONSULTING_CATALOG.find(c => c.id === id);
    if (!c) throw PlatformError.notFound("consulting capability", id);
    return c;
  }

  async createEngagement(ctx: RequestContext, input: { capabilityId: string; client: string; objectives?: string[] }): Promise<Engagement> {
    this.policy.assert(ctx.principal, "runtime:run", { kind: "engagement", organizationId: ctx.principal.organizationId });
    const capability = this.capability(input.capabilityId);
    const now = new Date().toISOString();

    // Engagement lifecycle compiles to a Flow workflow: phase tasks with an
    // approval gate before build and before scale.
    const nodes = [
      { id: "assess", type: "task" as const, name: `Assess: ${capability.name}`, config: { goal: `Run discovery for ${input.client}: current state across ${capability.assessmentDimensions.join(", ")}` }, next: ["strategy"] },
      { id: "strategy", type: "task" as const, name: "Strategy", config: { goal: `Define target state and prioritized portfolio for ${input.client} using ${capability.name}` }, next: ["architecture"] },
      { id: "architecture", type: "task" as const, name: "Architecture", config: { goal: `Design reference architecture for ${capability.name} deliverables: ${capability.deliverables.join("; ")}` }, next: ["gate-build"] },
      { id: "gate-build", type: "approval" as const, name: "Build gate", config: { approverRole: "admin" }, next: ["build"] },
      { id: "build", type: "task" as const, name: "Build", config: { goal: `Implement ${capability.deliverables[0] ?? "core deliverable"} for ${input.client}` }, next: ["govern"] },
      { id: "govern", type: "task" as const, name: "Govern", config: { goal: `Apply governance controls and evaluation harness for ${input.client}` }, next: ["scale"] },
      { id: "scale", type: "task" as const, name: "Scale", config: { goal: `Codify playbooks and scale ${capability.name} across ${input.client}` }, next: [] },
    ];
    const workflow = await this.flow.create(ctx, { name: `Engagement: ${capability.name} — ${input.client}`, definition: { entry: "assess", nodes } });

    const engagement: Engagement = {
      id: newId("eng"), organizationId: ctx.principal.organizationId, capabilityId: capability.id,
      client: input.client, objectives: input.objectives ?? [], phase: "assess",
      phaseHistory: [{ phase: "assess", at: now }], workflowId: workflow.id,
      status: "active", createdAt: now, updatedAt: now,
    };
    await this.repo.insertEngagement(engagement);
    await this.world.project(ctx.principal.organizationId, "process", engagement.id, `${capability.name} — ${input.client}`, { phase: "assess", capability: capability.id });
    await this.bus.publish(SUBJECTS.engagementCreated, { engagementId: engagement.id, capabilityId: capability.id, client: input.client, workflowId: workflow.id }, { organizationId: engagement.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return engagement;
  }

  listEngagements(ctx: RequestContext): Promise<Engagement[]> {
    this.policy.assert(ctx.principal, "runtime:read", { kind: "engagement", organizationId: ctx.principal.organizationId });
    return this.repo.listEngagements(ctx.principal.organizationId);
  }

  async getEngagement(ctx: RequestContext, id: string): Promise<Engagement> {
    this.policy.assert(ctx.principal, "runtime:read", { kind: "engagement", organizationId: ctx.principal.organizationId });
    const e = await this.repo.getEngagement(ctx.principal.organizationId, id);
    if (!e) throw PlatformError.notFound("engagement", id);
    return e;
  }

  async advancePhase(ctx: RequestContext, id: string, note?: string): Promise<Engagement> {
    const engagement = await this.getEngagement(ctx, id);
    const idx = ENGAGEMENT_PHASES.indexOf(engagement.phase);
    if (idx >= ENGAGEMENT_PHASES.length - 1) {
      engagement.status = "completed";
    } else {
      engagement.phase = ENGAGEMENT_PHASES[idx + 1]!;
      engagement.phaseHistory.push({ phase: engagement.phase, at: new Date().toISOString(), note });
    }
    engagement.updatedAt = new Date().toISOString();
    await this.repo.updateEngagement(engagement);
    await this.world.project(ctx.principal.organizationId, "process", engagement.id, engagement.id, { phase: engagement.phase, status: engagement.status });
    await this.bus.publish(SUBJECTS.phaseAdvanced, { engagementId: id, phase: engagement.phase, status: engagement.status }, { organizationId: engagement.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return engagement;
  }

  /** AI Readiness Assessment: 5 dimensions, 0-4 answers per question. */
  async runAssessment(ctx: RequestContext, input: { client: string; engagementId?: string; answers: Record<string, number[]> }): Promise<ReadinessAssessment> {
    this.policy.assert(ctx.principal, "runtime:run", { kind: "assessment", organizationId: ctx.principal.organizationId });
    const scores: Record<string, number> = {};
    for (const [dimension, answers] of Object.entries(input.answers)) {
      if (!answers.length) continue;
      const avg = answers.reduce((a, b) => a + Math.max(0, Math.min(4, b)), 0) / answers.length;
      scores[dimension] = Number((avg / 4).toFixed(3)); // normalize 0..1
    }
    const values = Object.values(scores);
    const overall = values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3)) : 0;
    const level = MATURITY_LEVELS[Math.min(MATURITY_LEVELS.length - 1, Math.floor(overall * MATURITY_LEVELS.length))]!;
    const gaps = Object.entries(scores)
      .filter(([, v]) => v < 0.6)
      .sort((a, b) => a[1] - b[1])
      .map(([dimension, score]) => ({
        dimension, score,
        gap: GAP_PLAYBOOK[dimension]?.gap ?? `Low maturity in ${dimension}`,
        recommendation: GAP_PLAYBOOK[dimension]?.recommendation ?? `Prioritize ${dimension} uplift`,
      }));
    const narrativeRes = await this.x.complete(ctx.principal.organizationId, {
      messages: [
        { role: "system", content: "You are a principal AI strategy consultant. Summarize this readiness assessment crisply for an executive." },
        { role: "user", content: `Client: ${input.client}. Overall ${(overall * 100).toFixed(0)}% (${level}). Dimension scores: ${JSON.stringify(scores)}. Top gaps: ${gaps.map(g => g.dimension).join(", ") || "none"}.` },
      ],
      metadata: { purpose: "consulting:assessment" },
    }, { traceId: ctx.traceId });

    const assessment: ReadinessAssessment = {
      id: newId("asm"), organizationId: ctx.principal.organizationId, engagementId: input.engagementId,
      client: input.client, scores, overall, level, gaps, narrative: narrativeRes.text, createdAt: new Date().toISOString(),
    };
    await this.repo.insertAssessment(assessment);

    // The report becomes institutional knowledge: searchable + citable.
    await this.knowledge.ingest(ctx, {
      title: `AI Readiness Assessment — ${input.client}`,
      contentType: "text/markdown",
      source: "consulting",
      content: `# AI Readiness Assessment — ${input.client}\n\nOverall maturity: ${(overall * 100).toFixed(0)}% (${level}).\n\n${Object.entries(scores).map(([d, s]) => `- ${d}: ${(s * 100).toFixed(0)}%`).join("\n")}\n\n## Gaps\n${gaps.map(g => `- ${g.dimension}: ${g.gap}. Recommendation: ${g.recommendation}`).join("\n") || "None material."}\n\n## Narrative\n${narrativeRes.text}`,
    });

    if (input.engagementId) {
      const engagement = await this.repo.getEngagement(ctx.principal.organizationId, input.engagementId);
      if (engagement) { engagement.assessmentId = assessment.id; await this.repo.updateEngagement(engagement); }
    }
    await this.bus.publish(SUBJECTS.assessmentCompleted, { assessmentId: assessment.id, client: input.client, overall, level }, { organizationId: assessment.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return assessment;
  }

  /** Roadmap: gap-driven initiatives across quarters + simulator-projected maturity. */
  async generateRoadmap(ctx: RequestContext, engagementId: string, opts?: { horizonQuarters?: number }): Promise<Roadmap> {
    const engagement = await this.getEngagement(ctx, engagementId);
    const capability = this.capability(engagement.capabilityId);
    const assessment = engagement.assessmentId ? await this.repo.getAssessment(ctx.principal.organizationId, engagement.assessmentId) : undefined;
    const horizon = Math.min(opts?.horizonQuarters ?? 4, 8);

    const gaps = assessment?.gaps ?? capability.assessmentDimensions.map(d => ({ dimension: d, score: 0.4, gap: GAP_PLAYBOOK[d]?.gap ?? d, recommendation: GAP_PLAYBOOK[d]?.recommendation ?? d }));
    const initiatives: Roadmap["initiatives"] = [];
    const phasePerQuarter: EngagementPhase[] = ["assess", "strategy", "architecture", "build", "govern", "scale"];
    for (let q = 1; q <= horizon; q++) {
      const phase = phasePerQuarter[Math.min(q - 1 + 1, phasePerQuarter.length - 1)]!;
      const gap = gaps[(q - 1) % Math.max(1, gaps.length)];
      initiatives.push({
        quarter: q, phase,
        title: gap ? `${gap.recommendation.split(":")[0]}` : `${capability.name} wave ${q}`,
        capability: capability.id,
        kpi: gap ? `Raise ${gap.dimension} maturity above 60%` : "Deployment milestone met",
      });
    }
    const base = assessment ? assessment.overall : 0.35;
    const sim = await this.simulator.simulateScenario(ctx, { series: [base, Math.min(1, base + 0.08)], horizon, deltas: [{ label: "engagement", multiplier: 1.15 }] });
    const projection = ((sim.result as { scenarios: { projection: number[] }[] }).scenarios[0]?.projection ?? []).map(v => Number(Math.max(0, Math.min(1, v)).toFixed(3)));

    const roadmap: Roadmap = {
      id: newId("rdm"), organizationId: ctx.principal.organizationId, engagementId,
      horizonQuarters: horizon, initiatives, projectedMaturity: projection, createdAt: new Date().toISOString(),
    };
    await this.repo.insertRoadmap(roadmap);
    engagement.roadmapId = roadmap.id;
    await this.repo.updateEngagement(engagement);
    await this.bus.publish(SUBJECTS.roadmapGenerated, { roadmapId: roadmap.id, engagementId, horizon }, { organizationId: roadmap.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return roadmap;
  }
}
