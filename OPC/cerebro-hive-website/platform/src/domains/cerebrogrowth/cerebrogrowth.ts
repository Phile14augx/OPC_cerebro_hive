import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";

/**
 * CerebroGrowth™ — Phase 1 of the Enterprise AI Growth OS: a governed-simulation content and
 * revenue engine, not a LinkedIn automation tool. Real LinkedIn integration (Phase 9 of the
 * vision) needs an actual LinkedIn Developer App with client credentials this platform doesn't
 * have — nobody here can create the account or approve the API access on the user's behalf. What
 * *is* buildable without any external credentials is the engine that would sit behind that
 * integration: an AI Content Studio that turns one piece of research into a full multi-channel
 * content set, a CRM that carries a lead from first touch through signed contract with AI
 * qualification scoring at every stage, and a Sales Copilot that generates a company intelligence
 * brief on demand. All three are deterministic (seeded from the input, reproducible, fully
 * auditable) — matching the governed-simulation convention used across HiveForge/CerebroStudio/
 * CerebroSwarm/CerebroInsight/the hiring pipeline. The moment a real LinkedIn app + CRM export
 * target exist, the publish/sync boundary here is the only piece that needs to change.
 */

// ---------------------------------------------------------------------------------------------
// Content Studio
// ---------------------------------------------------------------------------------------------

export type ContentPieceType =
  | "exec-summary" | "ceo-post" | "company-post" | "carousel"
  | "infographic-brief" | "newsletter" | "blog" | "video-script";

export interface ContentPiece { id: string; type: ContentPieceType; title: string; body: string }
export interface ContentSet {
  id: string; organizationId: string; sourceTitle: string; sourceExcerpt: string;
  pieces: ContentPiece[]; createdAt: string;
}

const STOPWORDS = new Set(["the", "and", "for", "are", "but", "not", "you", "with", "this", "that", "from", "have",
  "will", "your", "can", "our", "into", "how", "why", "what", "their", "they", "them", "then", "than", "over",
  "when", "where", "which", "while", "about", "these", "those", "been", "being", "into", "such", "each", "more",
  "most", "some", "any", "all", "its", "it's", "a", "an", "of", "to", "in", "on", "is", "as", "at", "by", "or", "be"]);

function extractKeyPhrases(text: string, n: number): string[] {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9']+/)) {
    const w = raw.trim();
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w[0]!.toUpperCase() + w.slice(1));
}

const NEWSLETTER_TRACKS = [
  { day: "Sunday", topic: "Future of AI" },
  { day: "Monday", topic: "Enterprise AI" },
  { day: "Tuesday", topic: "AI Research" },
  { day: "Wednesday", topic: "Enterprise Architecture" },
  { day: "Thursday", topic: "Case Studies" },
  { day: "Friday", topic: "Daily Insights" },
  { day: "Saturday", topic: "AI Strategy" },
];

function buildContentPieces(sourceTitle: string, sourceExcerpt: string, rand: () => number): ContentPiece[] {
  const kw = extractKeyPhrases(`${sourceTitle} ${sourceExcerpt}`, 5);
  const [k1, k2, k3] = [kw[0] ?? "Enterprise AI", kw[1] ?? "Automation", kw[2] ?? "Governance"];
  const track = NEWSLETTER_TRACKS[Math.floor(rand() * NEWSLETTER_TRACKS.length)]!;
  const tag = k1.replace(/[^A-Za-z0-9]/g, "");

  const execSummary =
    `${sourceTitle} shows that ${k1} and ${k2} are becoming decisive factors in how enterprises approach ` +
    `${k3.toLowerCase()}. This summary distills the core findings into takeaways relevant to both technical ` +
    `and business leadership: what changed, why it matters, and what to evaluate next.`;

  const ceoPost =
    `We just published new research: "${sourceTitle}".\n\n` +
    `The short version: ${k1} is no longer optional for enterprises serious about ${k2.toLowerCase()}.\n\n` +
    `Three things stood out to me:\n` +
    `1. ${k1} adoption is accelerating faster than most governance frameworks can keep up with.\n` +
    `2. Teams that treat ${k2.toLowerCase()} as infrastructure — not a project — are pulling ahead.\n` +
    `3. ${k3} is the single most under-invested capability we see across enterprise AI programs.\n\n` +
    `Full writeup linked below.\n\n#EnterpriseAI #${tag} #AIStrategy`;

  const companyPost =
    `New research from the CerebroHive team: ${sourceTitle}.\n\n` +
    `We look at how ${k1.toLowerCase()} and ${k2.toLowerCase()} are reshaping enterprise AI programs, and what ` +
    `leaders should prioritize over the next two quarters. Read the full breakdown and see how this maps to your ` +
    `own ${k3.toLowerCase()} roadmap.`;

  const carousel = [
    `Slide 1 — Hook: "${sourceTitle}" — what most enterprises are getting wrong about ${k1}.`,
    `Slide 2 — The Problem: ${k2} initiatives stall without a governed, production-grade foundation.`,
    `Slide 3 — What We Found: ${k1} maturity correlates directly with ${k3.toLowerCase()} investment.`,
    `Slide 4 — Why It Matters: teams without this foundation see slower time-to-value and higher risk exposure.`,
    `Slide 5 — What To Do: audit your ${k3.toLowerCase()} posture before scaling ${k1.toLowerCase()} further.`,
    `Slide 6 — CTA: Read the full research at cerebrohive.ai/research — link in comments.`,
  ].join("\n");

  const infographicBrief =
    `Data points to visualize:\n` +
    `- Headline stat: ${k1} adoption trend (line chart, quarterly)\n` +
    `- Comparison: ${k2} maturity by company size (bar chart)\n` +
    `- Breakdown: ${k3} investment by category (donut chart)\n` +
    `- Callout stat: top finding from "${sourceTitle}"\n` +
    `Suggested layout: single-column, dark theme, CerebroHive brand accent, CTA footer with QR code to full paper.`;

  const newsletter =
    `${track.day} — ${track.topic}\n\n` +
    `This week's spotlight: "${sourceTitle}". A look at how ${k1.toLowerCase()} and ${k2.toLowerCase()} are ` +
    `changing the calculus for enterprise ${k3.toLowerCase()} programs — with practical takeaways for teams ` +
    `evaluating where to invest next.`;

  const blog =
    `# ${sourceTitle}\n\n` +
    `${sourceExcerpt.slice(0, 280)}${sourceExcerpt.length > 280 ? "…" : ""}\n\n` +
    `## Why ${k1} Matters Now\n(stub — expand with supporting data and examples)\n\n` +
    `## The Role of ${k2}\n(stub — expand with case studies)\n\n` +
    `## Getting ${k3} Right\n(stub — expand with a practical checklist)\n\n` +
    `## Conclusion\n(stub — summarize the recommended next steps)`;

  const videoScript =
    `[HOOK, 0:00-0:05]\nWhat if your ${k1.toLowerCase()} strategy is missing the one thing that actually predicts success?\n\n` +
    `[PROBLEM, 0:05-0:20]\nMost enterprises treat ${k2.toLowerCase()} as a side project instead of core infrastructure.\n\n` +
    `[INSIGHT, 0:20-0:45]\nOur research on "${sourceTitle}" found ${k3.toLowerCase()} is the biggest predictor of outcomes.\n\n` +
    `[PROOF, 0:45-1:00]\n(insert supporting chart / stat from the infographic)\n\n` +
    `[CTA, 1:00-1:10]\nFull research at cerebrohive.ai/research — link below.`;

  const defs: { type: ContentPieceType; title: string; body: string }[] = [
    { type: "exec-summary", title: "Executive Summary", body: execSummary },
    { type: "ceo-post", title: "CEO LinkedIn Post", body: ceoPost },
    { type: "company-post", title: "Company Page Post", body: companyPost },
    { type: "carousel", title: "LinkedIn Carousel (6 slides)", body: carousel },
    { type: "infographic-brief", title: "Infographic Brief", body: infographicBrief },
    { type: "newsletter", title: `Newsletter — ${track.day} (${track.topic})`, body: newsletter },
    { type: "blog", title: "Blog Draft", body: blog },
    { type: "video-script", title: "Video Script", body: videoScript },
  ];
  return defs.map(d => ({ id: newId("cnt"), ...d }));
}

// ---------------------------------------------------------------------------------------------
// CRM
// ---------------------------------------------------------------------------------------------

export type LeadStage = "new" | "qualified" | "meeting" | "proposal" | "contract" | "won" | "lost";
export type LeadSource = "lead-gen-form" | "referral" | "inbound" | "outbound" | "event";

export const LEAD_STAGE_ORDER: LeadStage[] = ["new", "qualified", "meeting", "proposal", "contract", "won"];

export interface StageEvent { stage: LeadStage; at: string }
export interface Lead {
  id: string; organizationId: string;
  contactName: string; email: string; title?: string;
  companyName: string; industry?: string; employeeCount?: number;
  source: LeadSource; notes?: string;
  stage: LeadStage; opportunityScore: number; riskScore: number; recommendedService: string;
  history: StageEvent[]; createdAt: string; updatedAt: string;
}

const SERVICE_CATALOG: { keywords: string[]; service: string }[] = [
  { keywords: ["agent", "automation", "workflow"], service: "AI Agent & Automation Build" },
  { keywords: ["data", "warehouse", "pipeline", "analytics"], service: "Data Platform & Analytics Engineering" },
  { keywords: ["security", "compliance", "governance", "risk"], service: "AI Security & Governance Assessment" },
  { keywords: ["cloud", "infrastructure", "devops", "platform"], service: "Cloud-Native Platform Engineering" },
  { keywords: ["strategy", "roadmap", "transformation"], service: "AI Transformation Roadmap" },
  { keywords: ["hire", "talent", "recruit", "team"], service: "AI Talent & Team Buildout" },
];
const DEFAULT_SERVICE = "AI Strategy Consultation";

function recommendedServiceFor(text: string): string {
  const lower = text.toLowerCase();
  for (const entry of SERVICE_CATALOG) if (entry.keywords.some(k => lower.includes(k))) return entry.service;
  return DEFAULT_SERVICE;
}

interface ScoreBreakdown { opportunity: number; risk: number; opportunityFactors: string[]; riskFactors: string[] }

function scoreLeadDetailed(input: { title?: string; companyName: string; employeeCount?: number; source: LeadSource; notes?: string }, rand: () => number): ScoreBreakdown {
  let opportunity = 40 + Math.floor(rand() * 20);
  let risk = 30 + Math.floor(rand() * 20);
  const opportunityFactors: string[] = [`Baseline score for an inbound-quality profile: +${opportunity}`];
  const riskFactors: string[] = [`Baseline risk for an unqualified profile: +${risk}`];

  const title = (input.title ?? "").toLowerCase();
  if (/chief|cxo|ceo|cto|ciso|coo/.test(title)) { opportunity += 22; opportunityFactors.push("C-level title — strong buying authority: +22"); }
  else if (/vp|vice president|head of/.test(title)) { opportunity += 15; opportunityFactors.push("VP/Head-of title — likely budget influence: +15"); }
  else if (/director|manager/.test(title)) { opportunity += 8; opportunityFactors.push("Director/Manager title — some buying influence: +8"); }
  else { riskFactors.push("No senior title on file — buying authority unconfirmed"); }

  const size = input.employeeCount ?? 0;
  if (size >= 5000) { opportunity += 15; opportunityFactors.push("Enterprise-scale company (5,000+ employees): +15"); }
  else if (size >= 500) { opportunity += 10; opportunityFactors.push("Mid-market company (500-5,000 employees): +10"); }
  else if (size >= 50) { opportunity += 4; opportunityFactors.push("Small-to-mid company (50-500 employees): +4"); }
  else { risk += 8; riskFactors.push("Company under 50 employees — smaller budget likely: +8"); }

  if (input.source === "referral") { opportunity += 12; risk -= 8; opportunityFactors.push("Referral source — warm intro, higher trust: +12"); riskFactors.push("Referral source reduces risk: -8"); }
  else if (input.source === "lead-gen-form") { opportunity += 6; opportunityFactors.push("Lead-gen form submission — self-identified interest: +6"); }
  else if (input.source === "outbound") { risk += 6; riskFactors.push("Cold outbound — no inbound interest signal yet: +6"); }
  else { opportunityFactors.push(`${input.source} source — neutral signal`); }

  if (input.notes && input.notes.length > 40) { opportunity += 5; opportunityFactors.push("Detailed notes on file — clearer need identified: +5"); }
  else { riskFactors.push("Sparse notes — need not yet well understood"); }

  opportunity = Math.max(5, Math.min(99, opportunity));
  risk = Math.max(5, Math.min(95, risk));
  return { opportunity, risk, opportunityFactors, riskFactors };
}

export interface ProposalTier { name: string; priceUsd: number; includes: string[] }
export interface Proposal {
  id: string; organizationId: string; leadId: string;
  scope: string[]; timelineWeeks: { phase: string; weeks: string }[]; architecture: string[]; tiers: ProposalTier[];
  createdAt: string;
}

function buildProposal(lead: Lead, rand: () => number): Omit<Proposal, "id" | "organizationId" | "leadId" | "createdAt"> {
  const service = lead.recommendedService;
  const baseSize = Math.max(1, Math.log10(Math.max(lead.employeeCount ?? 100, 10)));
  const basePrice = Math.round((15_000 + baseSize * 12_000 + rand() * 8_000) / 500) * 500;

  return {
    scope: [
      `${service} for ${lead.companyName}`,
      "Current-state assessment and technical discovery",
      "Architecture design aligned to existing stack",
      "Implementation, testing, and handover with documentation",
    ],
    timelineWeeks: [
      { phase: "Discovery & Assessment", weeks: "Weeks 1-2" },
      { phase: "Architecture & Design", weeks: "Weeks 3-4" },
      { phase: "Build & Integration", weeks: "Weeks 5-9" },
      { phase: "Testing & Rollout", weeks: "Weeks 10-11" },
      { phase: "Handover & Enablement", weeks: "Week 12" },
    ],
    architecture: [
      "Domain-driven service boundaries with clear ownership",
      "Event-driven integration between existing systems",
      "Governed AI layer (policy, audit, observability) from day one",
      "CI/CD and infrastructure-as-code for repeatable deploys",
    ],
    tiers: [
      { name: "Starter", priceUsd: basePrice, includes: ["Core scope", "Single environment", "4 weeks support"] },
      { name: "Growth", priceUsd: Math.round(basePrice * 1.8), includes: ["Full scope", "Staging + production", "12 weeks support", "Quarterly review"] },
      { name: "Enterprise", priceUsd: Math.round(basePrice * 3.2), includes: ["Full scope", "Multi-environment", "Dedicated engineer", "SLA-backed support", "Ongoing roadmap partnership"] },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Sales Copilot
// ---------------------------------------------------------------------------------------------

export interface SalesBrief {
  id: string; organizationId: string; companyName: string; industry?: string;
  overview: string; latestNews: string[]; aiMaturity: { score: number; label: string };
  existingStackGuess: string[]; painPoints: string[]; stakeholders: string[];
  suggestedPitch: string; discoveryQuestions: string[]; proposalOutline: string[]; createdAt: string;
}

const STACK_POOL = ["AWS", "Azure", "GCP", "Snowflake", "Databricks", "Salesforce", "SAP", "Kubernetes", "PostgreSQL", "Kafka", "Terraform", "Datadog"];
const PAIN_POOL = [
  "fragmented AI pilots that never reach production",
  "no shared governance layer across teams building with AI",
  "rising cloud spend with unclear ROI attribution",
  "manual processes that don't scale past pilot volume",
  "data scattered across systems with no unified access layer",
  "compliance and security review bottlenecking every AI initiative",
];
const STAKEHOLDER_POOL = ["Chief Technology Officer", "Chief AI Officer", "VP of Engineering", "Head of Data", "VP of Operations", "Chief Information Security Officer"];
const MATURITY_LABELS: [number, string][] = [[85, "AI-Native"], [65, "Scaling"], [40, "Emerging"], [0, "Early-Stage"]];

function pick<T>(pool: T[], n: number, rand: () => number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]!);
  return out;
}

function buildSalesBrief(companyName: string, industry: string | undefined, rand: () => number): Omit<SalesBrief, "id" | "organizationId" | "createdAt"> {
  const maturityScore = 30 + Math.floor(rand() * 65);
  const label = MATURITY_LABELS.find(([min]) => maturityScore >= min)![1];
  const industryPhrase = industry ? industry.toLowerCase() : "their industry";

  return {
    companyName, industry,
    overview: `${companyName} is a ${industryPhrase} organization at the "${label}" stage of AI maturity. Public signals ` +
      `suggest active investment in modernization initiatives, with AI adoption concentrated in a small number of teams ` +
      `rather than distributed org-wide.`,
    latestNews: [
      `${companyName} announces continued investment in digital transformation initiatives.`,
      `${companyName} expands engineering headcount to support platform modernization.`,
      `${companyName} named in industry coverage of ${industryPhrase} AI adoption trends.`,
    ],
    aiMaturity: { score: maturityScore, label },
    existingStackGuess: pick(STACK_POOL, 4, rand),
    painPoints: pick(PAIN_POOL, 3, rand),
    stakeholders: pick(STAKEHOLDER_POOL, 3, rand),
    suggestedPitch: `Position CerebroHive as the partner that turns ${companyName}'s scattered AI pilots into a governed, ` +
      `production-grade platform — leading with the gap between their current "${label}" maturity and where the ` +
      `${industryPhrase} market is heading over the next 12-18 months.`,
    discoveryQuestions: [
      "What's currently blocking your AI initiatives from reaching production?",
      "Who owns AI governance and policy decisions today?",
      "How is AI spend currently tracked and attributed to outcomes?",
      "What does your current data and infrastructure stack look like?",
      "What would a successful engagement need to prove within the first 90 days?",
    ],
    proposalOutline: [
      "Current-state AI maturity assessment",
      "Governance and policy framework design",
      "Priority use-case selection and business case",
      "Phased implementation roadmap",
      "Success metrics and executive reporting cadence",
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Lead Intelligence (Phase 6) — enrichment layer on top of the CRM's flat opportunity/risk score
// ---------------------------------------------------------------------------------------------

export type EmployeeTrend = "growing" | "stable" | "shrinking";
export type FundingStage = "bootstrapped" | "seed" | "series-a" | "series-b" | "series-c-plus" | "public" | "unknown";

export interface LeadIntelligence {
  id: string; organizationId: string; leadId: string;
  websiteSignal: string; fundingStage: FundingStage; employeeTrend: EmployeeTrend;
  techStackGuess: string[]; hiringTrend: string; aiReadinessScore: number;
  opportunity: number; risk: number; opportunityFactors: string[]; riskFactors: string[];
  recommendedServiceRationale: string; createdAt: string;
}

const FUNDING_POOL: FundingStage[] = ["bootstrapped", "seed", "series-a", "series-b", "series-c-plus", "public"];
const EMPLOYEE_TREND_POOL: EmployeeTrend[] = ["growing", "stable", "shrinking"];
const HIRING_SIGNALS = [
  "actively hiring across engineering and data roles",
  "hiring has slowed but engineering headcount is stable",
  "recently posted several AI/ML engineering roles",
  "hiring freeze reported in the last two quarters",
  "expanding go-to-market team alongside engineering",
];

function fundingStageFor(employeeCount: number | undefined, rand: () => number): FundingStage {
  const size = employeeCount ?? 0;
  if (size >= 5000) return "public";
  if (size >= 1000) return rand() > 0.5 ? "public" : "series-c-plus";
  if (size >= 200) return "series-b";
  if (size >= 50) return "series-a";
  if (size >= 10) return "seed";
  return "bootstrapped";
}

function buildLeadIntelligence(lead: Lead, score: ScoreBreakdown, rand: () => number): Omit<LeadIntelligence, "id" | "organizationId" | "leadId" | "createdAt"> {
  const domainGuess = lead.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
  const fundingStage = fundingStageFor(lead.employeeCount, rand);
  const employeeTrend = EMPLOYEE_TREND_POOL[Math.floor(rand() * EMPLOYEE_TREND_POOL.length)]!;
  const techStackGuess = pick(STACK_POOL, 3 + Math.floor(rand() * 2), rand);
  const hiringTrend = HIRING_SIGNALS[Math.floor(rand() * HIRING_SIGNALS.length)]!;
  const aiReadinessScore = Math.max(10, Math.min(95, Math.round((score.opportunity * 0.6 + (100 - score.risk) * 0.4))));

  return {
    websiteSignal: `Public signals for ${domainGuess} suggest an active web presence with recent product or careers page updates.`,
    fundingStage, employeeTrend, techStackGuess, hiringTrend, aiReadinessScore,
    opportunity: score.opportunity, risk: score.risk,
    opportunityFactors: score.opportunityFactors, riskFactors: score.riskFactors,
    recommendedServiceRationale: `Recommended "${lead.recommendedService}" based on the language in the lead's notes and industry; ` +
      `an AI readiness score of ${aiReadinessScore}/100 suggests they are ${aiReadinessScore >= 70 ? "ready for a production-scale engagement" : aiReadinessScore >= 45 ? "ready for a scoped pilot before a larger commitment" : "early-stage and best suited to a foundational assessment first"}.`,
  };
}

// ---------------------------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------------------------

export interface CerebroGrowthRepository {
  insertContentSet(c: ContentSet): Promise<void>;
  listContentSets(org: string): Promise<ContentSet[]>;

  insertLead(l: Lead): Promise<void>;
  updateLead(l: Lead): Promise<void>;
  listLeads(org: string): Promise<Lead[]>;
  getLead(org: string, id: string): Promise<Lead | undefined>;

  insertProposal(p: Proposal): Promise<void>;
  listProposals(org: string): Promise<Proposal[]>;

  insertBrief(b: SalesBrief): Promise<void>;
  listBriefs(org: string): Promise<SalesBrief[]>;

  upsertLeadIntelligence(i: LeadIntelligence): Promise<void>;
  getLeadIntelligence(org: string, leadId: string): Promise<LeadIntelligence | undefined>;
  listLeadIntelligence(org: string): Promise<LeadIntelligence[]>;
}

export class InMemoryCerebroGrowthRepository implements CerebroGrowthRepository {
  contentSets = new Map<string, ContentSet>();
  leads = new Map<string, Lead>();
  proposals = new Map<string, Proposal>();
  briefs = new Map<string, SalesBrief>();
  leadIntelligence = new Map<string, LeadIntelligence>(); // key: leadId

  async insertContentSet(c: ContentSet) { this.contentSets.set(c.id, structuredClone(c)); }
  async listContentSets(org: string) { return [...this.contentSets.values()].filter(c => c.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertLead(l: Lead) { this.leads.set(l.id, structuredClone(l)); }
  async updateLead(l: Lead) { this.leads.set(l.id, structuredClone(l)); }
  async listLeads(org: string) { return [...this.leads.values()].filter(l => l.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  async getLead(org: string, id: string) { const l = this.leads.get(id); return l && l.organizationId === org ? structuredClone(l) : undefined; }

  async insertProposal(p: Proposal) { this.proposals.set(p.id, structuredClone(p)); }
  async listProposals(org: string) { return [...this.proposals.values()].filter(p => p.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertBrief(b: SalesBrief) { this.briefs.set(b.id, structuredClone(b)); }
  async listBriefs(org: string) { return [...this.briefs.values()].filter(b => b.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async upsertLeadIntelligence(i: LeadIntelligence) { this.leadIntelligence.set(i.leadId, structuredClone(i)); }
  async getLeadIntelligence(org: string, leadId: string) { const i = this.leadIntelligence.get(leadId); return i && i.organizationId === org ? structuredClone(i) : undefined; }
  async listLeadIntelligence(org: string) { return [...this.leadIntelligence.values()].filter(i => i.organizationId === org); }
}

// ---------------------------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------------------------

export class CerebroGrowthService {
  constructor(
    private readonly repo: CerebroGrowthRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async generateContentSet(ctx: RequestContext, input: { sourceTitle: string; sourceExcerpt: string }): Promise<ContentSet> {
    this.policy.assert(ctx.principal, "cerebrogrowth:write", { kind: "content", organizationId: ctx.principal.organizationId });
    if (!input.sourceTitle.trim()) throw PlatformError.validation("sourceTitle is required");
    if (!input.sourceExcerpt.trim()) throw PlatformError.validation("sourceExcerpt is required");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.sourceTitle}:${input.sourceExcerpt.slice(0, 64)}`);
    const pieces = buildContentPieces(input.sourceTitle, input.sourceExcerpt, rand);
    const set: ContentSet = { id: newId("cst"), organizationId: org, sourceTitle: input.sourceTitle, sourceExcerpt: input.sourceExcerpt, pieces, createdAt: new Date().toISOString() };
    await this.repo.insertContentSet(set);
    await this.bus.publish(Subjects.cerebrogrowth.contentGenerated, { contentSetId: set.id, pieceCount: pieces.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return set;
  }

  listContentSets(ctx: RequestContext): Promise<ContentSet[]> {
    this.policy.assert(ctx.principal, "cerebrogrowth:read", { kind: "content", organizationId: ctx.principal.organizationId });
    return this.repo.listContentSets(ctx.principal.organizationId);
  }

  async createLead(ctx: RequestContext, input: { contactName: string; email: string; title?: string; companyName: string; industry?: string; employeeCount?: number; source: LeadSource; notes?: string }): Promise<Lead> {
    this.policy.assert(ctx.principal, "cerebrogrowth:write", { kind: "lead", organizationId: ctx.principal.organizationId });
    if (!input.contactName.trim()) throw PlatformError.validation("contactName is required");
    if (!input.companyName.trim()) throw PlatformError.validation("companyName is required");
    const org = ctx.principal.organizationId;
    const now = new Date().toISOString();
    const rand = seededRandom(`${org}:${input.email}:${input.companyName}`);
    const { opportunity, risk } = scoreLeadDetailed(input, rand);
    const recommendedService = recommendedServiceFor(`${input.notes ?? ""} ${input.industry ?? ""}`);
    const stage: LeadStage = opportunity >= 65 ? "qualified" : "new";
    const lead: Lead = {
      id: newId("led"), organizationId: org, contactName: input.contactName, email: input.email, title: input.title,
      companyName: input.companyName, industry: input.industry, employeeCount: input.employeeCount,
      source: input.source, notes: input.notes,
      stage, opportunityScore: opportunity, riskScore: risk, recommendedService,
      history: [{ stage: "new", at: now }, ...(stage !== "new" ? [{ stage, at: now }] : [])],
      createdAt: now, updatedAt: now,
    };
    await this.repo.insertLead(lead);
    await this.bus.publish(Subjects.cerebrogrowth.leadCreated, { leadId: lead.id, opportunityScore: opportunity, stage }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return lead;
  }

  listLeads(ctx: RequestContext): Promise<Lead[]> {
    this.policy.assert(ctx.principal, "cerebrogrowth:read", { kind: "lead", organizationId: ctx.principal.organizationId });
    return this.repo.listLeads(ctx.principal.organizationId);
  }

  async advanceLeadStage(ctx: RequestContext, leadId: string, toStage: LeadStage): Promise<Lead> {
    this.policy.assert(ctx.principal, "cerebrogrowth:write", { kind: "lead", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const lead = await this.repo.getLead(org, leadId);
    if (!lead) throw PlatformError.notFound("lead", leadId);
    if (toStage !== "lost") {
      const from = LEAD_STAGE_ORDER.indexOf(lead.stage);
      const to = LEAD_STAGE_ORDER.indexOf(toStage);
      if (to === -1) throw PlatformError.validation(`unknown stage ${toStage}`);
      if (to < from) throw PlatformError.validation(`cannot move stage backward: ${lead.stage} -> ${toStage}`);
    }
    const now = new Date().toISOString();
    lead.stage = toStage;
    lead.updatedAt = now;
    lead.history.push({ stage: toStage, at: now });
    await this.repo.updateLead(lead);
    await this.bus.publish(Subjects.cerebrogrowth.leadStageChanged, { leadId: lead.id, stage: toStage }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return lead;
  }

  async generateProposal(ctx: RequestContext, leadId: string): Promise<Proposal> {
    this.policy.assert(ctx.principal, "cerebrogrowth:write", { kind: "proposal", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const lead = await this.repo.getLead(org, leadId);
    if (!lead) throw PlatformError.notFound("lead", leadId);
    const rand = seededRandom(`${org}:${lead.id}:proposal`);
    const built = buildProposal(lead, rand);
    const proposal: Proposal = { id: newId("prp"), organizationId: org, leadId: lead.id, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertProposal(proposal);
    if (LEAD_STAGE_ORDER.indexOf(lead.stage) < LEAD_STAGE_ORDER.indexOf("proposal")) {
      await this.advanceLeadStage(ctx, lead.id, "proposal");
    }
    await this.bus.publish(Subjects.cerebrogrowth.proposalGenerated, { proposalId: proposal.id, leadId: lead.id }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return proposal;
  }

  async enrichLead(ctx: RequestContext, leadId: string): Promise<LeadIntelligence> {
    this.policy.assert(ctx.principal, "cerebrogrowth:write", { kind: "lead", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const lead = await this.repo.getLead(org, leadId);
    if (!lead) throw PlatformError.notFound("lead", leadId);
    const rand = seededRandom(`${org}:${lead.id}:intelligence`);
    const score = scoreLeadDetailed(lead, rand);
    const built = buildLeadIntelligence(lead, score, rand);
    const intelligence: LeadIntelligence = { id: newId("lin"), organizationId: org, leadId: lead.id, ...built, createdAt: new Date().toISOString() };
    await this.repo.upsertLeadIntelligence(intelligence);
    await this.bus.publish(Subjects.cerebrogrowth.leadEnriched, { leadId: lead.id, aiReadinessScore: intelligence.aiReadinessScore }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return intelligence;
  }

  async getLeadIntelligence(ctx: RequestContext, leadId: string): Promise<LeadIntelligence | undefined> {
    this.policy.assert(ctx.principal, "cerebrogrowth:read", { kind: "lead", organizationId: ctx.principal.organizationId });
    return this.repo.getLeadIntelligence(ctx.principal.organizationId, leadId);
  }

  listProposals(ctx: RequestContext): Promise<Proposal[]> {
    this.policy.assert(ctx.principal, "cerebrogrowth:read", { kind: "proposal", organizationId: ctx.principal.organizationId });
    return this.repo.listProposals(ctx.principal.organizationId);
  }

  async generateSalesBrief(ctx: RequestContext, input: { companyName: string; industry?: string }): Promise<SalesBrief> {
    this.policy.assert(ctx.principal, "cerebrogrowth:write", { kind: "brief", organizationId: ctx.principal.organizationId });
    if (!input.companyName.trim()) throw PlatformError.validation("companyName is required");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.companyName}:${input.industry ?? ""}`);
    const built = buildSalesBrief(input.companyName, input.industry, rand);
    const brief: SalesBrief = { id: newId("brf"), organizationId: org, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertBrief(brief);
    await this.bus.publish(Subjects.cerebrogrowth.briefGenerated, { briefId: brief.id, companyName: input.companyName }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return brief;
  }

  listBriefs(ctx: RequestContext): Promise<SalesBrief[]> {
    this.policy.assert(ctx.principal, "cerebrogrowth:read", { kind: "brief", organizationId: ctx.principal.organizationId });
    return this.repo.listBriefs(ctx.principal.organizationId);
  }
}
