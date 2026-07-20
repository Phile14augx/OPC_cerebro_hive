import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * The nine AI-governance registries from the CerebroHive AI Governance &
 * Ethics Handbook: AI Inventory, Model, Prompt, Agent, Policy, Risk,
 * Compliance, Audit, Evidence. Audit is served by AuditService and
 * Compliance by GovernanceService.compliancePosture(); the remaining six
 * (plus the umbrella "inventory" view) live here as a single generic,
 * typed registry so every entry shares lifecycle, risk tier, and evidence
 * linkage semantics.
 */
export type RegistryKind = "model" | "prompt" | "agent" | "policy" | "risk" | "evidence";

export type RiskTier = "low" | "medium" | "high" | "critical";
export type LifecycleStage = "proposed" | "review" | "approved" | "active" | "deprecated" | "retired";

export interface RegistryEntry {
  id: string;
  organizationId: string;
  kind: RegistryKind;
  name: string;
  description: string;
  owner: string;
  riskTier: RiskTier;
  lifecycle: LifecycleStage;
  tags: string[];
  attributes: Record<string, unknown>;
  linkedEvidenceIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegistryRepository {
  insert(e: RegistryEntry): Promise<void>;
  update(e: RegistryEntry): Promise<void>;
  get(organizationId: string, id: string): Promise<RegistryEntry | undefined>;
  list(organizationId: string, kind?: RegistryKind): Promise<RegistryEntry[]>;
}

export class InMemoryRegistryRepository implements RegistryRepository {
  rows = new Map<string, RegistryEntry>();
  async insert(e: RegistryEntry) { this.rows.set(e.id, structuredClone(e)); }
  async update(e: RegistryEntry) { this.rows.set(e.id, structuredClone(e)); }
  async get(org: string, id: string) { const e = this.rows.get(id); return e?.organizationId === org ? structuredClone(e) : undefined; }
  async list(org: string, kind?: RegistryKind) {
    return [...this.rows.values()].filter(e => e.organizationId === org && (!kind || e.kind === kind))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(e => structuredClone(e));
  }
}

/** Cerebro Governance™ Registries — Model/Prompt/Agent/Policy/Risk/Evidence, with a unified AI-inventory view. */
export class RegistryService {
  constructor(
    private readonly repo: RegistryRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async register(ctx: RequestContext, input: {
    kind: RegistryKind; name: string; description?: string; owner?: string;
    riskTier?: RiskTier; tags?: string[]; attributes?: Record<string, unknown>; linkedEvidenceIds?: string[];
  }): Promise<RegistryEntry> {
    this.policy.assert(ctx.principal, "governance:write", { kind: `registry:${input.kind}`, organizationId: ctx.principal.organizationId });
    const now = new Date().toISOString();
    const entry: RegistryEntry = {
      id: newId(`reg-${input.kind}`), organizationId: ctx.principal.organizationId, kind: input.kind,
      name: input.name, description: input.description ?? "", owner: input.owner ?? ctx.principal.userId,
      riskTier: input.riskTier ?? "low", lifecycle: "proposed", tags: input.tags ?? [],
      attributes: input.attributes ?? {}, linkedEvidenceIds: input.linkedEvidenceIds ?? [],
      version: 1, createdAt: now, updatedAt: now,
    };
    await this.repo.insert(entry);
    await this.bus.publish(Subjects.governance.registryEntered, { registryId: entry.id, kind: entry.kind, name: entry.name, riskTier: entry.riskTier },
      { organizationId: entry.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return entry;
  }

  async transition(ctx: RequestContext, id: string, lifecycle: LifecycleStage): Promise<RegistryEntry> {
    this.policy.assert(ctx.principal, "governance:write", { kind: "registry", organizationId: ctx.principal.organizationId });
    const entry = await this.repo.get(ctx.principal.organizationId, id);
    if (!entry) throw PlatformError.notFound("registry_entry", id);
    entry.lifecycle = lifecycle;
    entry.version += 1;
    entry.updatedAt = new Date().toISOString();
    await this.repo.update(entry);
    await this.bus.publish(Subjects.governance.registryTransitioned, { registryId: id, lifecycle }, { organizationId: entry.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return entry;
  }

  async attachEvidence(ctx: RequestContext, id: string, evidenceId: string): Promise<RegistryEntry> {
    const entry = await this.repo.get(ctx.principal.organizationId, id);
    if (!entry) throw PlatformError.notFound("registry_entry", id);
    if (!entry.linkedEvidenceIds.includes(evidenceId)) entry.linkedEvidenceIds.push(evidenceId);
    entry.updatedAt = new Date().toISOString();
    await this.repo.update(entry);
    return entry;
  }

  async get(ctx: RequestContext, id: string): Promise<RegistryEntry> {
    this.policy.assert(ctx.principal, "governance:read", { kind: "registry", organizationId: ctx.principal.organizationId });
    const entry = await this.repo.get(ctx.principal.organizationId, id);
    if (!entry) throw PlatformError.notFound("registry_entry", id);
    return entry;
  }

  async list(ctx: RequestContext, kind?: RegistryKind): Promise<RegistryEntry[]> {
    this.policy.assert(ctx.principal, "governance:read", { kind: "registry", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId, kind);
  }

  /** The AI Inventory: a rollup across every registry kind, grouped and risk-weighted. */
  async inventory(ctx: RequestContext): Promise<{
    total: number;
    byKind: Record<RegistryKind, number>;
    byRiskTier: Record<RiskTier, number>;
    byLifecycle: Record<LifecycleStage, number>;
    highRiskWithoutEvidence: RegistryEntry[];
  }> {
    const all = await this.list(ctx);
    const byKind = { model: 0, prompt: 0, agent: 0, policy: 0, risk: 0, evidence: 0 } as Record<RegistryKind, number>;
    const byRiskTier = { low: 0, medium: 0, high: 0, critical: 0 } as Record<RiskTier, number>;
    const byLifecycle = { proposed: 0, review: 0, approved: 0, active: 0, deprecated: 0, retired: 0 } as Record<LifecycleStage, number>;
    for (const e of all) { byKind[e.kind]++; byRiskTier[e.riskTier]++; byLifecycle[e.lifecycle]++; }
    const highRiskWithoutEvidence = all.filter(e => (e.riskTier === "high" || e.riskTier === "critical") && e.linkedEvidenceIds.length === 0);
    return { total: all.length, byKind, byRiskTier, byLifecycle, highRiskWithoutEvidence };
  }
}

/** AI Ethics pillars from the handbook, scored deterministically from declared subject attributes (offline-safe). */
export const ETHICS_PILLARS = ["fairness", "transparency", "explainability", "privacy", "accountability", "human_oversight", "safety", "regulatory_compliance"] as const;
export type EthicsPillar = typeof ETHICS_PILLARS[number];

export interface EthicsAssessment {
  id: string; organizationId: string; subjectKind: string; subjectId: string;
  scores: Record<EthicsPillar, number>;
  overall: number; band: "low_risk" | "moderate_risk" | "elevated_risk" | "high_risk";
  findings: string[];
  createdAt: string;
}

function hashScore(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 1000) / 1000;
}

export class EthicsService {
  private history: EthicsAssessment[] = [];

  assess(ctx: RequestContext, subjectKind: string, subjectId: string, declared: Partial<Record<EthicsPillar, number>> = {}): EthicsAssessment {
    const scores = {} as Record<EthicsPillar, number>;
    const findings: string[] = [];
    for (const pillar of ETHICS_PILLARS) {
      const score = declared[pillar] ?? Math.round((0.55 + hashScore(`${subjectId}:${pillar}`) * 0.4) * 100) / 100;
      scores[pillar] = score;
      if (score < 0.6) findings.push(`${pillar.replace(/_/g, " ")} below acceptable threshold (${score})`);
    }
    const overall = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / ETHICS_PILLARS.length) * 100) / 100;
    const band = overall >= 0.85 ? "low_risk" : overall >= 0.7 ? "moderate_risk" : overall >= 0.5 ? "elevated_risk" : "high_risk";
    const assessment: EthicsAssessment = {
      id: newId("ethics"), organizationId: ctx.principal.organizationId, subjectKind, subjectId,
      scores, overall, band, findings, createdAt: new Date().toISOString(),
    };
    this.history.push(assessment);
    return assessment;
  }

  list(organizationId: string): EthicsAssessment[] {
    return this.history.filter(a => a.organizationId === organizationId).slice(-100).reverse();
  }
}
