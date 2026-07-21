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

export type ContentPieceType =
  | "exec-summary" | "ceo-post" | "company-post" | "carousel"
  | "infographic-brief" | "newsletter" | "blog" | "video-script";

export interface ContentPiece { id: string; type: ContentPieceType; title: string; body: string }
export interface ContentSet { id: string; sourceTitle: string; sourceExcerpt: string; pieces: ContentPiece[]; createdAt: string }

export type LeadStage = "new" | "qualified" | "meeting" | "proposal" | "contract" | "won" | "lost";
export type LeadSource = "lead-gen-form" | "referral" | "inbound" | "outbound" | "event";
export const LEAD_STAGE_ORDER: LeadStage[] = ["new", "qualified", "meeting", "proposal", "contract", "won"];

export interface StageEvent { stage: LeadStage; at: string }
export interface Lead {
  id: string; contactName: string; email: string; title?: string;
  companyName: string; industry?: string; employeeCount?: number;
  source: LeadSource; notes?: string;
  stage: LeadStage; opportunityScore: number; riskScore: number; recommendedService: string;
  history: StageEvent[]; createdAt: string; updatedAt: string;
}

export interface ProposalTier { name: string; priceUsd: number; includes: string[] }
export interface Proposal {
  id: string; leadId: string; scope: string[]; timelineWeeks: { phase: string; weeks: string }[];
  architecture: string[]; tiers: ProposalTier[]; createdAt: string;
}

export interface SalesBrief {
  id: string; companyName: string; industry?: string;
  overview: string; latestNews: string[]; aiMaturity: { score: number; label: string };
  existingStackGuess: string[]; painPoints: string[]; stakeholders: string[];
  suggestedPitch: string; discoveryQuestions: string[]; proposalOutline: string[]; createdAt: string;
}

export type FundingStage = "bootstrapped" | "seed" | "series-a" | "series-b" | "series-c-plus" | "public";
export type EmployeeTrend = "growing" | "stable" | "shrinking";
export interface LeadIntelligence {
  id: string; leadId: string;
  websiteSignal: string; fundingStage: FundingStage; employeeTrend: EmployeeTrend;
  techStackGuess: string[]; hiringTrend: string; aiReadinessScore: number;
  opportunity: number; risk: number; opportunityFactors: string[]; riskFactors: string[];
  recommendedServiceRationale: string; createdAt: string;
}
