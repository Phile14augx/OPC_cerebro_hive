import { KnowledgeGraphService, globalKnowledgeGraph } from "./knowledge-graph.js";

// ---------------------------------------------------------------------------------------------
// Trend Intelligence Engine
// ---------------------------------------------------------------------------------------------

export type TrendLifecycle = "Emerging" | "Growing" | "Accelerating" | "Mainstream" | "Mature" | "Declining" | "Legacy";

export interface TrendScore {
  researchVelocity: number;
  citationVelocity: number;
  githubVelocity: number;
  modelReleases: number;
  startupActivity: number;
  vcFunding: number;
  enterpriseAdoption: number;
  conferenceMentions: number;
  benchmarkPerformance: number;
  talentDemand: number;
  
  overallScore: number; // 0-100
  lifecycle: TrendLifecycle;
}

export class TrendIntelligenceEngine {
  private graph: KnowledgeGraphService;

  constructor(graph: KnowledgeGraphService) {
    this.graph = graph;
  }

  /**
   * Deterministically calculates a trend score for a given entity or concept.
   */
  calculateTrendScore(entityId: string): TrendScore {
    const entity = this.graph.getEntity(entityId);
    if (!entity) throw new Error(`Entity not found: ${entityId}`);
    
    // Seeded random based on entity ID to simulate deterministic trend values
    let h = 0;
    for (let i = 0; i < entity.id.length; i++) h = Math.imul(31, h) + entity.id.charCodeAt(i) | 0;
    let s = h;
    const rand = () => { s = Math.imul(1664525, s) + 1013904223 | 0; return (s >>> 0) / 4294967296; };
    
    // Base scores modified by graph centrality
    const centrality = this.graph.centrality(entity.id);
    const boost = Math.min(20, centrality * 2);

    const researchVelocity = Math.floor(20 + rand() * 60 + boost);
    const citationVelocity = Math.floor(10 + rand() * 50 + boost);
    const githubVelocity = Math.floor(30 + rand() * 50 + (entity.type === "Framework" ? 20 : 0));
    const modelReleases = Math.floor(10 + rand() * 70);
    const startupActivity = Math.floor(5 + rand() * 80);
    const vcFunding = Math.floor(5 + rand() * 90);
    const enterpriseAdoption = Math.floor(5 + rand() * 60 + (entity.type === "Enterprise Product" ? 30 : 0));
    const conferenceMentions = Math.floor(20 + rand() * 60);
    const benchmarkPerformance = Math.floor(40 + rand() * 50);
    const talentDemand = Math.floor(10 + rand() * 80);

    const overallScore = Math.floor(
      (researchVelocity * 0.15) +
      (citationVelocity * 0.10) +
      (githubVelocity * 0.15) +
      (modelReleases * 0.10) +
      (startupActivity * 0.10) +
      (vcFunding * 0.05) +
      (enterpriseAdoption * 0.20) +
      (conferenceMentions * 0.05) +
      (benchmarkPerformance * 0.05) +
      (talentDemand * 0.05)
    );

    let lifecycle: TrendLifecycle = "Emerging";
    if (overallScore > 90) lifecycle = "Mainstream";
    else if (overallScore > 80) lifecycle = "Accelerating";
    else if (overallScore > 65) lifecycle = "Growing";
    else if (overallScore > 45) lifecycle = "Emerging";
    else if (overallScore > 30) lifecycle = "Mature";
    else if (overallScore > 15) lifecycle = "Declining";
    else lifecycle = "Legacy";
    
    // Explicit overrides for demonstration
    const name = entity.canonicalName.toLowerCase();
    if (name.includes("mixture of experts") || name.includes("moe")) lifecycle = "Accelerating";
    else if (name.includes("rag") || name.includes("retrieval")) lifecycle = "Mainstream";
    else if (name.includes("vector db") || name.includes("vector database")) lifecycle = "Mature";
    else if (name.includes("prompt engineering")) lifecycle = "Declining";

    return {
      researchVelocity, citationVelocity, githubVelocity, modelReleases, startupActivity,
      vcFunding, enterpriseAdoption, conferenceMentions, benchmarkPerformance, talentDemand,
      overallScore: Math.min(100, Math.max(0, overallScore)),
      lifecycle
    };
  }
}

// ---------------------------------------------------------------------------------------------
// Innovation Signals Engine
// ---------------------------------------------------------------------------------------------

export interface InnovationSignal {
  id: string;
  type: "Paper" | "Repository" | "Model Release" | "Patent" | "Startup" | "Conference" | "Enterprise Product" | "Government" | "Benchmark" | "Investment";
  title: string;
  source: string;
  confidence: number;
  timestamp: string;
}

export class InnovationSignalEngine {
  private signals: InnovationSignal[] = [];

  collectSignals(signals: InnovationSignal[]) {
    this.signals.push(...signals);
  }

  mergeSignals() {
    // Deterministic deduplication based on title similarity (simulated)
    const merged: InnovationSignal[] = [];
    const seen = new Set<string>();
    for (const s of this.signals) {
      const normalized = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(normalized)) {
        seen.add(normalized);
        merged.push(s);
      }
    }
    this.signals = merged;
  }

  normalize() {
    for (const s of this.signals) {
      s.confidence = Math.min(100, s.confidence + 5);
    }
  }

  rank(): InnovationSignal[] {
    return [...this.signals].sort((a, b) => b.confidence - a.confidence);
  }
}

export const globalTrendEngine = new TrendIntelligenceEngine(globalKnowledgeGraph);
export const globalSignalEngine = new InnovationSignalEngine();
