import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";

/**
 * CerebroForge™ — Phase 1 of the AI Innovation Factory: a governed-simulation research-to-product
 * pipeline, not a live web-scraping news aggregator. The full vision (continuously crawling arXiv,
 * GitHub, benchmark leaderboards, and competitor announcements) needs real external API access and
 * ongoing scraping infrastructure this platform doesn't have credentials for. What *is* buildable
 * without any external dependency is the engine that would sit behind that ingestion layer: submit
 * a research signal (a paper, repo, model, or announcement) and CerebroForge deterministically scores
 * its innovation potential across nine dimensions, proposes concrete product opportunities (SaaS
 * feature, API, consulting offering, whitepaper, etc.) tailored to the signal's category, and — on
 * request — expands any opportunity into a full implementation-ready product spec (overview,
 * features, target customers, architecture, tech stack, timeline, build-effort tiers). All of it is
 * seeded from the input (reproducible, fully auditable), matching the governed-simulation convention
 * used across HiveForge/CerebroStudio/CerebroSwarm/CerebroInsight/CerebroGrowth. The moment real
 * research-feed credentials exist, the ingestion boundary here is the only piece that needs to change.
 */

// ---------------------------------------------------------------------------------------------
// Research Discovery
// ---------------------------------------------------------------------------------------------

export type SourceType = "paper" | "repo" | "model" | "dataset" | "news" | "startup";
export type ResearchCategory =
  | "llms" | "multimodal" | "agents" | "rag" | "reasoning" | "computer-vision" | "speech"
  | "reinforcement-learning" | "world-models" | "robotics" | "mlops" | "inference"
  | "vector-databases" | "synthetic-data" | "evaluation" | "security" | "ai-safety";

export type ProductOpportunityType =
  | "saas-feature" | "api" | "sdk" | "consulting" | "copilot" | "automation-agent"
  | "whitepaper" | "internal-tool" | "infrastructure" | "course";

const STOPWORDS = new Set(["the", "and", "for", "are", "but", "not", "you", "with", "this", "that", "from", "have",
  "will", "your", "can", "our", "into", "how", "why", "what", "their", "they", "them", "then", "than", "over",
  "when", "where", "which", "while", "about", "these", "those", "been", "being", "such", "each", "more",
  "most", "some", "any", "all", "its", "it's", "a", "an", "of", "to", "in", "on", "is", "as", "at", "by", "or", "be", "new"]);

function extractKeyPhrases(text: string, n: number): string[] {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9']+/)) {
    const w = raw.trim();
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w[0]!.toUpperCase() + w.slice(1));
}

interface CategoryMeta {
  label: string;
  industries: string[];
  opportunityBias: ProductOpportunityType[];
  techStack: string[];
  noveltyBias: number;      // added to technicalNovelty
  difficultyBias: number;   // added to implementationDifficulty
  demandBias: number;       // added to marketDemand
  alignmentBias: number;    // added to strategicAlignment (fit with CerebroHive's own stack)
}

const CATEGORY_META: Record<ResearchCategory, CategoryMeta> = {
  llms: { label: "Large Language Models", industries: ["Technology", "Financial Services", "Media"], opportunityBias: ["api", "copilot", "saas-feature"], techStack: ["vLLM", "PyTorch", "Ray Serve"], noveltyBias: 4, difficultyBias: 6, demandBias: 18, alignmentBias: 15 },
  multimodal: { label: "Multimodal AI", industries: ["Retail", "Media", "Healthcare"], opportunityBias: ["saas-feature", "api", "copilot"], techStack: ["PyTorch", "CLIP-style encoders", "vLLM"], noveltyBias: 10, difficultyBias: 10, demandBias: 10, alignmentBias: 6 },
  agents: { label: "Autonomous Agents", industries: ["Technology", "Financial Services", "Manufacturing"], opportunityBias: ["automation-agent", "saas-feature", "internal-tool"], techStack: ["LangGraph-style orchestration", "Ray", "Redis"], noveltyBias: 8, difficultyBias: 8, demandBias: 20, alignmentBias: 22 },
  rag: { label: "Retrieval-Augmented Generation", industries: ["Financial Services", "Healthcare", "Legal"], opportunityBias: ["api", "sdk", "saas-feature"], techStack: ["Vector DB", "Postgres", "Embeddings pipeline"], noveltyBias: 2, difficultyBias: -4, demandBias: 14, alignmentBias: 20 },
  reasoning: { label: "Reasoning Models", industries: ["Financial Services", "Technology", "Legal"], opportunityBias: ["copilot", "api", "consulting"], techStack: ["vLLM", "Custom inference server"], noveltyBias: 12, difficultyBias: 8, demandBias: 16, alignmentBias: 14 },
  "computer-vision": { label: "Computer Vision", industries: ["Manufacturing", "Retail", "Healthcare"], opportunityBias: ["api", "saas-feature", "infrastructure"], techStack: ["PyTorch", "ONNX Runtime", "GPU inference"], noveltyBias: 3, difficultyBias: 5, demandBias: 6, alignmentBias: 2 },
  speech: { label: "Speech & Audio AI", industries: ["Media", "Retail", "Healthcare"], opportunityBias: ["api", "sdk", "saas-feature"], techStack: ["Whisper-class ASR", "TTS pipeline"], noveltyBias: 2, difficultyBias: 2, demandBias: 8, alignmentBias: 0 },
  "reinforcement-learning": { label: "Reinforcement Learning", industries: ["Manufacturing", "Financial Services"], opportunityBias: ["consulting", "internal-tool", "whitepaper"], techStack: ["Ray RLlib", "Custom simulators"], noveltyBias: 6, difficultyBias: 18, demandBias: -4, alignmentBias: -2 },
  "world-models": { label: "World Models", industries: ["Manufacturing", "Robotics", "Gaming"], opportunityBias: ["whitepaper", "consulting", "internal-tool"], techStack: ["Custom simulators", "GPU clusters"], noveltyBias: 16, difficultyBias: 22, demandBias: -8, alignmentBias: -6 },
  robotics: { label: "Robotics", industries: ["Manufacturing", "Logistics"], opportunityBias: ["consulting", "internal-tool", "whitepaper"], techStack: ["ROS", "Edge inference"], noveltyBias: 10, difficultyBias: 24, demandBias: -6, alignmentBias: -10 },
  mlops: { label: "MLOps & Infrastructure", industries: ["Technology", "Financial Services", "Manufacturing"], opportunityBias: ["infrastructure", "internal-tool", "sdk"], techStack: ["Kubernetes", "Terraform", "KServe", "OpenTelemetry"], noveltyBias: -6, difficultyBias: -2, demandBias: 10, alignmentBias: 18 },
  inference: { label: "Inference & Serving", industries: ["Technology", "Financial Services"], opportunityBias: ["infrastructure", "sdk", "api"], techStack: ["vLLM", "TensorRT", "KServe"], noveltyBias: -2, difficultyBias: 4, demandBias: 12, alignmentBias: 16 },
  "vector-databases": { label: "Vector Databases", industries: ["Technology", "Financial Services", "Legal"], opportunityBias: ["infrastructure", "sdk", "api"], techStack: ["pgvector", "Qdrant-class store"], noveltyBias: -4, difficultyBias: -6, demandBias: 8, alignmentBias: 12 },
  "synthetic-data": { label: "Synthetic Data", industries: ["Healthcare", "Financial Services", "Manufacturing"], opportunityBias: ["saas-feature", "sdk", "consulting"], techStack: ["Diffusion/GAN pipelines", "Data validation"], noveltyBias: 6, difficultyBias: 4, demandBias: 4, alignmentBias: 4 },
  evaluation: { label: "AI Evaluation & Benchmarking", industries: ["Technology", "Financial Services", "Healthcare"], opportunityBias: ["internal-tool", "sdk", "whitepaper"], techStack: ["Eval harnesses", "OpenTelemetry"], noveltyBias: -4, difficultyBias: -8, demandBias: 6, alignmentBias: 10 },
  security: { label: "AI Security", industries: ["Financial Services", "Government", "Healthcare"], opportunityBias: ["consulting", "internal-tool", "whitepaper"], techStack: ["Guardrail frameworks", "SBOM tooling"], noveltyBias: 0, difficultyBias: 2, demandBias: 10, alignmentBias: 12 },
  "ai-safety": { label: "AI Safety & Alignment", industries: ["Government", "Financial Services", "Healthcare"], opportunityBias: ["whitepaper", "consulting", "internal-tool"], techStack: ["Guardrail frameworks", "Eval harnesses"], noveltyBias: 4, difficultyBias: 0, demandBias: -2, alignmentBias: 8 },
};

export interface ResearchSignal {
  id: string; organizationId: string;
  title: string; sourceType: SourceType; category: ResearchCategory; summary: string; sourceOrg?: string;
  score: InnovationScore; opportunities: ProductOpportunity[];
  createdAt: string;
}

export interface InnovationScore {
  technicalNovelty: number; businessValue: number; implementationDifficulty: number; marketDemand: number;
  competitiveAdvantage: number; enterpriseReadiness: number; risk: number; roi: number; strategicAlignment: number;
  overall: number; factors: string[];
}

function scoreSignal(input: { title: string; summary: string; sourceType: SourceType; category: ResearchCategory }, rand: () => number): InnovationScore {
  const meta = CATEGORY_META[input.category];
  const text = `${input.title} ${input.summary}`.toLowerCase();
  const factors: string[] = [`Category: ${meta.label}`];

  let technicalNovelty = 45 + Math.floor(rand() * 25) + meta.noveltyBias;
  let businessValue = 40 + Math.floor(rand() * 25);
  let implementationDifficulty = 40 + Math.floor(rand() * 25) + meta.difficultyBias;
  let marketDemand = 45 + Math.floor(rand() * 20) + meta.demandBias;
  let competitiveAdvantage = 40 + Math.floor(rand() * 30);
  let enterpriseReadiness = 35 + Math.floor(rand() * 25);
  let strategicAlignment = 40 + Math.floor(rand() * 20) + meta.alignmentBias;

  if (/production|enterprise|deployed|scale|benchmark|sota|state-of-the-art/.test(text)) {
    businessValue += 12; enterpriseReadiness += 15;
    factors.push("Summary signals production/enterprise deployment language: +business value, +readiness");
  }
  if (/experimental|preview|research prototype|early stage|proof of concept/.test(text)) {
    enterpriseReadiness -= 15; factors.push("Summary signals early-stage/experimental status: -readiness");
  }
  if (/open source|open-source|apache|mit license|permissive/.test(text)) {
    implementationDifficulty -= 8; factors.push("Open-source / permissively licensed: -implementation difficulty");
  }
  if (input.sourceType === "paper") { implementationDifficulty += 10; factors.push("Paper without reference implementation: +implementation difficulty"); }
  if (input.sourceType === "repo") { implementationDifficulty -= 6; enterpriseReadiness += 4; factors.push("Working repository available: -difficulty, +readiness"); }
  if (input.sourceType === "model") { enterpriseReadiness += 8; factors.push("Released model weights available: +readiness"); }
  if (input.sourceType === "startup") { competitiveAdvantage -= 10; factors.push("Already commercialized by a startup: -competitive advantage (market is moving)"); }

  technicalNovelty = Math.max(5, Math.min(99, technicalNovelty));
  businessValue = Math.max(5, Math.min(99, businessValue));
  implementationDifficulty = Math.max(5, Math.min(99, implementationDifficulty));
  marketDemand = Math.max(5, Math.min(99, marketDemand));
  competitiveAdvantage = Math.max(5, Math.min(99, competitiveAdvantage));
  enterpriseReadiness = Math.max(5, Math.min(99, enterpriseReadiness));
  strategicAlignment = Math.max(5, Math.min(99, strategicAlignment));

  const risk = Math.max(5, Math.min(95, Math.round(100 - enterpriseReadiness * 0.6 - (100 - implementationDifficulty) * 0.1)));
  const roi = Math.max(5, Math.min(99, Math.round(businessValue * 0.5 + marketDemand * 0.3 + competitiveAdvantage * 0.2)));

  const overall = Math.max(0, Math.min(100, Math.round(
    technicalNovelty * 0.15 + businessValue * 0.20 + marketDemand * 0.15 + competitiveAdvantage * 0.10 +
    enterpriseReadiness * 0.15 + roi * 0.10 + strategicAlignment * 0.15 -
    implementationDifficulty * 0.10 - risk * 0.05,
  )));
  factors.push(`Overall score blends novelty, business value, demand, readiness, ROI, and strategic fit, discounted by implementation difficulty and risk: ${overall}/100`);

  return { technicalNovelty, businessValue, implementationDifficulty, marketDemand, competitiveAdvantage, enterpriseReadiness, risk, roi, strategicAlignment, overall, factors };
}

export interface ProductOpportunity {
  type: ProductOpportunityType; title: string; rationale: string; targetIndustries: string[];
}

const OPPORTUNITY_LABEL: Record<ProductOpportunityType, string> = {
  "saas-feature": "New SaaS Feature", api: "Public API", sdk: "Developer SDK", consulting: "Consulting Offering",
  copilot: "AI Copilot", "automation-agent": "Automation Agent", whitepaper: "Whitepaper / Research Brief",
  "internal-tool": "Internal Tooling", infrastructure: "Infrastructure Component", course: "Training / Certification",
};

const GENERIC_OPPORTUNITY_POOL: ProductOpportunityType[] = ["whitepaper", "consulting", "internal-tool"];

function buildOpportunities(signal: { title: string; summary: string; category: ResearchCategory }, score: InnovationScore, rand: () => number): ProductOpportunity[] {
  const meta = CATEGORY_META[signal.category];
  const kw = extractKeyPhrases(`${signal.title} ${signal.summary}`, 3);
  const [k1, k2] = [kw[0] ?? meta.label, kw[1] ?? "Enterprise AI"];

  const typePool = [...meta.opportunityBias, ...GENERIC_OPPORTUNITY_POOL.filter(t => !meta.opportunityBias.includes(t))];
  const count = score.overall >= 70 ? 4 : score.overall >= 45 ? 3 : 2;
  const chosen: ProductOpportunityType[] = [];
  const pool = [...typePool];
  for (let i = 0; i < count && pool.length; i++) chosen.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]!);

  return chosen.map(type => {
    const label = OPPORTUNITY_LABEL[type];
    let title: string; let rationale: string;
    switch (type) {
      case "saas-feature":
        title = `${k1} Studio — a new CerebroStudio™ module`; rationale = `Score of ${score.overall}/100 and ${meta.label.toLowerCase()} category demand support packaging this as a self-serve SaaS feature rather than a bespoke build.`; break;
      case "api":
        title = `${k1} API`; rationale = `High market demand (${score.marketDemand}/100) for ${meta.label.toLowerCase()} makes a metered API the fastest path to distribution.`; break;
      case "sdk":
        title = `${k1} SDK`; rationale = `Implementation difficulty of ${score.implementationDifficulty}/100 suggests developers need a packaged SDK rather than raw API access.`; break;
      case "consulting":
        title = `${meta.label} Readiness Engagement`; rationale = `Enterprise readiness of only ${score.enterpriseReadiness}/100 means most buyers need an assessment-and-implementation engagement before self-service adoption.`; break;
      case "copilot":
        title = `${k1} Copilot`; rationale = `Strategic alignment (${score.strategicAlignment}/100) with CerebroHive's own agent stack makes a copilot experience a natural extension.`; break;
      case "automation-agent":
        title = `${k1} Automation Agent`; rationale = `Business value (${score.businessValue}/100) is concentrated in workflow automation for ${meta.industries[0]} and similar industries.`; break;
      case "whitepaper":
        title = `${signal.title} — Enterprise Implications`; rationale = `Technical novelty of ${score.technicalNovelty}/100 with enterprise readiness still forming (${score.enterpriseReadiness}/100) makes thought-leadership content the lowest-risk first move.`; break;
      case "internal-tool":
        title = `${k1} Internal Accelerator`; rationale = `ROI potential (${score.roi}/100) is strong enough to justify building this as an internal accelerator before productizing externally.`; break;
      case "infrastructure":
        title = `${k1} Infrastructure Layer`; rationale = `${meta.label} functions as foundational infrastructure other CerebroHive products (HiveForge, CerebroStudio) can build on.`; break;
      case "course":
        title = `${meta.label} for Enterprise Teams`; rationale = `Market demand (${score.marketDemand}/100) supports an enablement/certification track for enterprise engineering teams adopting ${k2.toLowerCase()}.`; break;
    }
    return { type, title, rationale, targetIndustries: meta.industries.slice(0, 2 + Math.floor(rand() * 2)), label } as ProductOpportunity & { label: string };
  }).map(({ label: _label, ...o }) => o);
}

export interface BuildTier { name: string; weeks: number; teamSize: number; estimatedCostUsd: number; scope: string[] }
export interface ProductSpec {
  id: string; organizationId: string; signalId: string;
  opportunityType: ProductOpportunityType; opportunityTitle: string;
  overview: string; features: string[]; targetCustomers: string[];
  architecture: string[]; techStack: string[];
  timelinePhases: { phase: string; weeks: string }[]; buildTiers: BuildTier[];
  createdAt: string;
}

function buildProductSpec(signal: ResearchSignal, opportunity: ProductOpportunity, rand: () => number): Omit<ProductSpec, "id" | "organizationId" | "signalId" | "createdAt"> {
  const meta = CATEGORY_META[signal.category];
  const kw = extractKeyPhrases(`${signal.title} ${signal.summary}`, 2);
  const k1 = kw[0] ?? meta.label;
  const baseWeeks = 6 + Math.round(signal.score.implementationDifficulty / 10);
  const baseCost = Math.round((20_000 + signal.score.implementationDifficulty * 900 + rand() * 15_000) / 500) * 500;

  return {
    opportunityType: opportunity.type, opportunityTitle: opportunity.title,
    overview: `${opportunity.title} translates the research signal "${signal.title}" into a ${OPPORTUNITY_LABEL[opportunity.type].toLowerCase()} for ` +
      `${opportunity.targetIndustries.join(" and ")}. ${opportunity.rationale}`,
    features: [
      `Core ${k1} capability adapted from the source research, hardened for production use`,
      "Governed execution layer with policy checks, audit trail, and observability",
      `${meta.label} pipeline with deterministic, reproducible outputs`,
      "Usage-based metering and reporting for cost attribution",
      "Integration hooks into existing CerebroHive domains via the event bus",
    ],
    targetCustomers: opportunity.targetIndustries.map(i => `${i} enterprises adopting ${meta.label.toLowerCase()}`),
    architecture: [
      "Domain-driven service boundary, isolated from other CerebroHive domains",
      `${meta.techStack[0] ?? "Core runtime"} for the primary processing pipeline`,
      "Event-driven integration via the platform's existing NATS-backed event bus",
      "Policy-engine-gated read/write access, scoped per organization",
    ],
    techStack: meta.techStack,
    timelinePhases: [
      { phase: "Discovery & Feasibility", weeks: "Weeks 1-2" },
      { phase: "Architecture & Prototype", weeks: `Weeks 3-${2 + Math.max(2, Math.round(baseWeeks * 0.3))}` },
      { phase: "Build & Integration", weeks: `Weeks ${3 + Math.max(2, Math.round(baseWeeks * 0.3))}-${baseWeeks}` },
      { phase: "Evaluation & Hardening", weeks: `Weeks ${baseWeeks + 1}-${baseWeeks + 2}` },
      { phase: "Launch & Enablement", weeks: `Week ${baseWeeks + 3}` },
    ],
    buildTiers: [
      { name: "MVP", weeks: baseWeeks, teamSize: 2, estimatedCostUsd: baseCost, scope: ["Core capability only", "Single environment", "Manual evaluation"] },
      { name: "Full Build", weeks: baseWeeks + 4, teamSize: 3, estimatedCostUsd: Math.round(baseCost * 1.9), scope: ["Full feature set", "Staging + production", "Automated evaluation suite"] },
      { name: "Enterprise-Grade", weeks: baseWeeks + 9, teamSize: 5, estimatedCostUsd: Math.round(baseCost * 3.4), scope: ["Full feature set", "Multi-tenant hardening", "SLA-backed support", "Ongoing roadmap partnership"] },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------------------------

export interface CerebroForgeRepository {
  insertSignal(s: ResearchSignal): Promise<void>;
  listSignals(org: string): Promise<ResearchSignal[]>;
  getSignal(org: string, id: string): Promise<ResearchSignal | undefined>;

  insertProductSpec(p: ProductSpec): Promise<void>;
  listProductSpecs(org: string): Promise<ProductSpec[]>;
}

export class InMemoryCerebroForgeRepository implements CerebroForgeRepository {
  signals = new Map<string, ResearchSignal>();
  productSpecs = new Map<string, ProductSpec>();

  async insertSignal(s: ResearchSignal) { this.signals.set(s.id, structuredClone(s)); }
  async listSignals(org: string) { return [...this.signals.values()].filter(s => s.organizationId === org).sort((a, b) => b.score.overall - a.score.overall); }
  async getSignal(org: string, id: string) { const s = this.signals.get(id); return s && s.organizationId === org ? structuredClone(s) : undefined; }

  async insertProductSpec(p: ProductSpec) { this.productSpecs.set(p.id, structuredClone(p)); }
  async listProductSpecs(org: string) { return [...this.productSpecs.values()].filter(p => p.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
}

// ---------------------------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------------------------

export class CerebroForgeService {
  constructor(
    private readonly repo: CerebroForgeRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async ingestSignal(ctx: RequestContext, input: { title: string; sourceType: SourceType; category: ResearchCategory; summary: string; sourceOrg?: string }): Promise<ResearchSignal> {
    this.policy.assert(ctx.principal, "cerebroforge:write", { kind: "signal", organizationId: ctx.principal.organizationId });
    if (!input.title.trim()) throw PlatformError.validation("title is required");
    if (!input.summary.trim()) throw PlatformError.validation("summary is required");
    if (!CATEGORY_META[input.category]) throw PlatformError.validation(`unknown category ${input.category}`);
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.title}:${input.summary.slice(0, 64)}`);
    const score = scoreSignal(input, rand);
    const opportunities = buildOpportunities(input, score, rand);
    const signal: ResearchSignal = {
      id: newId("sig"), organizationId: org, title: input.title, sourceType: input.sourceType,
      category: input.category, summary: input.summary, sourceOrg: input.sourceOrg,
      score, opportunities, createdAt: new Date().toISOString(),
    };
    await this.repo.insertSignal(signal);
    await this.bus.publish(Subjects.cerebroforge.signalIngested, { signalId: signal.id, overall: score.overall, category: input.category }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return signal;
  }

  listSignals(ctx: RequestContext): Promise<ResearchSignal[]> {
    this.policy.assert(ctx.principal, "cerebroforge:read", { kind: "signal", organizationId: ctx.principal.organizationId });
    return this.repo.listSignals(ctx.principal.organizationId);
  }

  async getSignal(ctx: RequestContext, signalId: string): Promise<ResearchSignal> {
    this.policy.assert(ctx.principal, "cerebroforge:read", { kind: "signal", organizationId: ctx.principal.organizationId });
    const signal = await this.repo.getSignal(ctx.principal.organizationId, signalId);
    if (!signal) throw PlatformError.notFound("signal", signalId);
    return signal;
  }

  async generateProductSpec(ctx: RequestContext, signalId: string, opportunityType: ProductOpportunityType): Promise<ProductSpec> {
    this.policy.assert(ctx.principal, "cerebroforge:write", { kind: "spec", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const signal = await this.repo.getSignal(org, signalId);
    if (!signal) throw PlatformError.notFound("signal", signalId);
    const opportunity = signal.opportunities.find(o => o.type === opportunityType);
    if (!opportunity) throw PlatformError.validation(`signal has no "${opportunityType}" opportunity`);
    const rand = seededRandom(`${org}:${signal.id}:${opportunityType}:spec`);
    const built = buildProductSpec(signal, opportunity, rand);
    const spec: ProductSpec = { id: newId("spc"), organizationId: org, signalId: signal.id, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertProductSpec(spec);
    await this.bus.publish(Subjects.cerebroforge.productSpecGenerated, { productSpecId: spec.id, signalId: signal.id, opportunityType }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return spec;
  }

  listProductSpecs(ctx: RequestContext): Promise<ProductSpec[]> {
    this.policy.assert(ctx.principal, "cerebroforge:read", { kind: "spec", organizationId: ctx.principal.organizationId });
    return this.repo.listProductSpecs(ctx.principal.organizationId);
  }
}

export const FORGE_CATEGORIES: ResearchCategory[] = Object.keys(CATEGORY_META) as ResearchCategory[];
export function categoryLabel(c: ResearchCategory): string { return CATEGORY_META[c].label; }
