import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { XGateway } from "../x/gateway.js";
import type { CompletionResult, ChatMessage } from "../x/types.js";

/**
 * Cerebro Router™ — the intelligent model-routing layer described in the
 * Enterprise Cognitive OS vision: every request passes through intent
 * detection, complexity estimation, cost prediction, latency prediction,
 * and privacy classification before a model is selected. No human chooses
 * a model; the OS does. Execution still flows through XGateway (which
 * already owns provider fallback/retry/caching) — this layer is the
 * decision-making brain in front of it, plus a routing-decision ledger for
 * observability and continuous learning.
 */

export type Intent = "code" | "research" | "analysis" | "creative" | "support" | "extraction" | "general";
export type PrivacyTier = "public" | "internal" | "restricted";

export interface ModelProfile {
  id: string; family: string; quality: number; speedMsPer1k: number; costPer1kIn: number; costPer1kOut: number;
  strengths: Intent[]; local: boolean;
}

/** Catalog of models the router reasons about (superset of what XGateway has live providers for — routing is advisory, execution always falls back safely through XGateway's own provider chain). */
export const MODEL_CATALOG: ModelProfile[] = [
  { id: "gpt-4o", family: "openai", quality: 0.93, speedMsPer1k: 900, costPer1kIn: 2.5, costPer1kOut: 10, strengths: ["analysis", "research", "code"], local: false },
  { id: "gpt-4o-mini", family: "openai", quality: 0.78, speedMsPer1k: 400, costPer1kIn: 0.15, costPer1kOut: 0.6, strengths: ["support", "extraction", "general"], local: false },
  { id: "claude-sonnet-5", family: "anthropic", quality: 0.95, speedMsPer1k: 850, costPer1kIn: 3, costPer1kOut: 15, strengths: ["code", "analysis", "research", "creative"], local: false },
  { id: "claude-haiku-4-5-20251001", family: "anthropic", quality: 0.8, speedMsPer1k: 350, costPer1kIn: 1, costPer1kOut: 5, strengths: ["support", "extraction", "general"], local: false },
  { id: "gemini-1.5-pro", family: "google", quality: 0.9, speedMsPer1k: 800, costPer1kIn: 1.25, costPer1kOut: 5, strengths: ["research", "analysis", "extraction"], local: false },
  { id: "llama3.2", family: "meta", quality: 0.7, speedMsPer1k: 600, costPer1kIn: 0, costPer1kOut: 0, strengths: ["general", "support"], local: true },
  { id: "mistral-large", family: "mistral", quality: 0.85, speedMsPer1k: 700, costPer1kIn: 2, costPer1kOut: 6, strengths: ["code", "analysis"], local: false },
  { id: "deepseek-v3", family: "deepseek", quality: 0.87, speedMsPer1k: 750, costPer1kIn: 0.27, costPer1kOut: 1.1, strengths: ["code", "research"], local: false },
  { id: "qwen2.5-72b", family: "alibaba", quality: 0.83, speedMsPer1k: 700, costPer1kIn: 0.4, costPer1kOut: 1.2, strengths: ["general", "extraction"], local: false },
  { id: "command-r-plus", family: "cohere", quality: 0.82, speedMsPer1k: 650, costPer1kIn: 2.5, costPer1kOut: 10, strengths: ["research", "extraction"], local: false },
  { id: "phi-4", family: "microsoft", quality: 0.72, speedMsPer1k: 300, costPer1kIn: 0, costPer1kOut: 0, strengths: ["support", "general"], local: true },
  { id: "granite-3", family: "ibm", quality: 0.74, speedMsPer1k: 500, costPer1kIn: 0.3, costPer1kOut: 0.9, strengths: ["extraction", "support"], local: false },
  { id: "mixtral-8x22b", family: "mistral", quality: 0.84, speedMsPer1k: 600, costPer1kIn: 0.65, costPer1kOut: 2, strengths: ["code", "general"], local: true },
  { id: "cerebro-mock-1", family: "cerebro", quality: 0.6, speedMsPer1k: 50, costPer1kIn: 0, costPer1kOut: 0, strengths: ["general", "support"], local: true },
];

const PII_PATTERNS = [/\b\d{3}-\d{2}-\d{4}\b/, /\b\d{16}\b/, /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, /\b(?:\d[ -]*?){13,19}\b/];
const RESTRICTED_KEYWORDS = /\b(confidential|classified|salary|ssn|social security|passport|medical record|phi|proprietary|trade secret)\b/i;
const INTERNAL_KEYWORDS = /\b(internal|employee|org chart|customer list|contract|financials|roadmap)\b/i;

export interface RoutingDecision {
  id: string; organizationId: string; intent: Intent; complexity: number; privacyTier: PrivacyTier;
  candidates: { modelId: string; score: number }[]; selectedModel: string; rationale: string;
  predictedCostUsd: number; predictedLatencyMs: number; estimatedTokens: number; decidedAt: string;
}

export interface RouterRepository {
  insert(d: RoutingDecision): Promise<void>;
  list(org: string, limit?: number): Promise<RoutingDecision[]>;
}

export class InMemoryRouterRepository implements RouterRepository {
  decisions: RoutingDecision[] = [];
  async insert(d: RoutingDecision) { this.decisions.push(d); }
  async list(org: string, limit = 50) { return this.decisions.filter(d => d.organizationId === org).slice(-limit).reverse(); }
}

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/```|function|class |import |def |const |query|sql|regex|bug|stack trace/.test(t)) return "code";
  if (/\b(research|survey|literature|compare|benchmark|state of the art)\b/.test(t)) return "research";
  if (/\b(analyz|evaluate|assess|forecast|trend|root cause|why did)\b/.test(t)) return "analysis";
  if (/\b(write|story|poem|draft|brainstorm|slogan|creative)\b/.test(t)) return "creative";
  if (/\b(extract|parse|structure|convert to json|table of|list all)\b/.test(t)) return "extraction";
  if (/\b(help|how do i|support|issue|problem|not working)\b/.test(t)) return "support";
  return "general";
}

function estimateComplexity(text: string): number {
  let score = 0;
  score += Math.min(0.35, text.length / 4000);
  score += (text.match(/[.;]/g)?.length ?? 0) * 0.02;
  if (/\b(then|after|finally|step \d|multi-step|pipeline)\b/i.test(text)) score += 0.2;
  if (/\b(architecture|design|strategy|roadmap|migration|tradeoff)\b/i.test(text)) score += 0.2;
  if (/```/.test(text)) score += 0.15;
  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

function classifyPrivacy(text: string): PrivacyTier {
  if (PII_PATTERNS.some(p => p.test(text)) || RESTRICTED_KEYWORDS.test(text)) return "restricted";
  if (INTERNAL_KEYWORDS.test(text)) return "internal";
  return "public";
}

export interface RoutingConstraints {
  maxCostUsd?: number; maxLatencyMs?: number; requireLocal?: boolean; preferredFamily?: string; minQuality?: number;
}

/** Cerebro Router™ — deterministic, explainable model selection across the full catalog. */
export class ModelRouter {
  constructor(
    private readonly repo: RouterRepository,
    private readonly bus: EventBus,
    private readonly gateway: XGateway,
  ) {}

  /** Classify + select a model without executing anything (pure decision, fully explainable). */
  async route(ctx: RequestContext, text: string, constraints?: RoutingConstraints): Promise<RoutingDecision> {
    const org = ctx.principal.organizationId;
    const intent = detectIntent(text);
    const complexity = estimateComplexity(text);
    const privacyTier = classifyPrivacy(text);
    const estimatedTokens = Math.max(32, Math.ceil(text.length / 4)) + Math.round(complexity * 800);

    let pool = MODEL_CATALOG;
    if (privacyTier === "restricted" || constraints?.requireLocal) pool = pool.filter(m => m.local);
    if (constraints?.preferredFamily) pool = pool.filter(m => m.family === constraints.preferredFamily) || pool;
    if (!pool.length) pool = MODEL_CATALOG.filter(m => m.local);

    const candidates = pool.map(m => {
      const strengthBonus = m.strengths.includes(intent) ? 0.25 : 0;
      const qualityFit = complexity > 0.55 ? m.quality : 1 - Math.abs(m.quality - (0.5 + complexity * 0.5));
      const estCost = (estimatedTokens / 1000) * (m.costPer1kIn + m.costPer1kOut) / 2;
      const estLatency = m.speedMsPer1k * (estimatedTokens / 1000 + 0.3);
      let score = qualityFit * 0.5 + strengthBonus + (1 - Math.min(1, estCost / 0.5)) * 0.15 + (1 - Math.min(1, estLatency / 6000)) * 0.1;
      if (constraints?.maxCostUsd !== undefined && estCost > constraints.maxCostUsd) score -= 1;
      if (constraints?.maxLatencyMs !== undefined && estLatency > constraints.maxLatencyMs) score -= 1;
      if (constraints?.minQuality !== undefined && m.quality < constraints.minQuality) score -= 1;
      return { modelId: m.id, score: Number(score.toFixed(4)), estCost, estLatency };
    }).sort((a, b) => b.score - a.score);

    const winner = candidates[0]!;
    const winnerProfile = MODEL_CATALOG.find(m => m.id === winner.modelId)!;
    const rationale = `intent=${intent} complexity=${complexity} privacy=${privacyTier} -> ${winner.modelId} `
      + `(quality ${winnerProfile.quality}, ${winnerProfile.strengths.includes(intent) ? "specialized for this intent, " : ""}`
      + `~$${winner.estCost.toFixed(4)} / ~${Math.round(winner.estLatency)}ms)`;

    const decision: RoutingDecision = {
      id: newId("route"), organizationId: org, intent, complexity, privacyTier,
      candidates: candidates.map(c => ({ modelId: c.modelId, score: c.score })), selectedModel: winner.modelId,
      rationale, predictedCostUsd: Number(winner.estCost.toFixed(6)), predictedLatencyMs: Math.round(winner.estLatency),
      estimatedTokens, decidedAt: new Date().toISOString(),
    };
    await this.repo.insert(decision);
    await this.bus.publish(Subjects.router.decided, { decisionId: decision.id, intent, selectedModel: decision.selectedModel, complexity, privacyTier }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return decision;
  }

  /** Route AND execute: classify, pick a model, run it through XGateway (which owns real provider fallback), and record actual vs. predicted for continuous learning. */
  async execute(ctx: RequestContext, messages: ChatMessage[], constraints?: RoutingConstraints): Promise<{ decision: RoutingDecision; result: CompletionResult }> {
    const org = ctx.principal.organizationId;
    const text = messages.map(m => m.content).join("\n");
    const decision = await this.route(ctx, text, constraints);
    const result = await this.gateway.complete(org, { messages, model: decision.selectedModel }, { traceId: ctx.traceId });
    await this.bus.publish(Subjects.router.executed, {
      decisionId: decision.id, actualModel: result.model, actualCostUsd: result.costUsd, actualLatencyMs: result.latencyMs,
      predictedCostUsd: decision.predictedCostUsd, predictedLatencyMs: decision.predictedLatencyMs,
    }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return { decision, result };
  }

  catalog(): ModelProfile[] { return MODEL_CATALOG; }

  history(ctx: RequestContext, limit?: number): Promise<RoutingDecision[]> {
    return this.repo.list(ctx.principal.organizationId, limit);
  }
}
