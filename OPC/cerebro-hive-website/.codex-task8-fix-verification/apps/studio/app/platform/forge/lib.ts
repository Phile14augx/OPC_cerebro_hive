export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; }
}

export type SourceType = "paper" | "repo" | "model" | "dataset" | "news" | "startup";
export type ResearchCategory =
  | "llms" | "multimodal" | "agents" | "rag" | "reasoning" | "computer-vision" | "speech"
  | "reinforcement-learning" | "world-models" | "robotics" | "mlops" | "inference"
  | "vector-databases" | "synthetic-data" | "evaluation" | "security" | "ai-safety";

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  "llms", "multimodal", "agents", "rag", "reasoning", "computer-vision", "speech",
  "reinforcement-learning", "world-models", "robotics", "mlops", "inference",
  "vector-databases", "synthetic-data", "evaluation", "security", "ai-safety",
];

export const CATEGORY_LABEL: Record<ResearchCategory, string> = {
  llms: "Large Language Models", multimodal: "Multimodal AI", agents: "Autonomous Agents",
  rag: "Retrieval-Augmented Generation", reasoning: "Reasoning Models", "computer-vision": "Computer Vision",
  speech: "Speech & Audio AI", "reinforcement-learning": "Reinforcement Learning", "world-models": "World Models",
  robotics: "Robotics", mlops: "MLOps & Infrastructure", inference: "Inference & Serving",
  "vector-databases": "Vector Databases", "synthetic-data": "Synthetic Data", evaluation: "AI Evaluation & Benchmarking",
  security: "AI Security", "ai-safety": "AI Safety & Alignment",
};

export type ProductOpportunityType =
  | "saas-feature" | "api" | "sdk" | "consulting" | "copilot" | "automation-agent"
  | "whitepaper" | "internal-tool" | "infrastructure" | "course";

export const OPPORTUNITY_LABEL: Record<ProductOpportunityType, string> = {
  "saas-feature": "New SaaS Feature", api: "Public API", sdk: "Developer SDK", consulting: "Consulting Offering",
  copilot: "AI Copilot", "automation-agent": "Automation Agent", whitepaper: "Whitepaper / Research Brief",
  "internal-tool": "Internal Tooling", infrastructure: "Infrastructure Component", course: "Training / Certification",
};

export interface InnovationScore {
  technicalNovelty: number; businessValue: number; implementationDifficulty: number; marketDemand: number;
  competitiveAdvantage: number; enterpriseReadiness: number; risk: number; roi: number; strategicAlignment: number;
  overall: number; factors: string[];
}

export interface ProductOpportunity {
  type: ProductOpportunityType; title: string; rationale: string; targetIndustries: string[];
}

export interface ResearchSignal {
  id: string; title: string; sourceType: SourceType; category: ResearchCategory; summary: string; sourceOrg?: string;
  score: InnovationScore; opportunities: ProductOpportunity[]; createdAt: string;
}

export interface BuildTier { name: string; weeks: number; teamSize: number; estimatedCostUsd: number; scope: string[] }
export interface ProductSpec {
  id: string; signalId: string; opportunityType: ProductOpportunityType; opportunityTitle: string;
  overview: string; features: string[]; targetCustomers: string[];
  architecture: string[]; techStack: string[];
  timelinePhases: { phase: string; weeks: string }[]; buildTiers: BuildTier[];
  createdAt: string;
}
