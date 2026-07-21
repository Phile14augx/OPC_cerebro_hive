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

export interface CatalogItem { id: string; name: string; provisionable: boolean; hourlyRateUsd?: number }
export interface CatalogCategory { id: string; name: string; tagline: string; subgroups: { name: string; items: CatalogItem[] }[] }
export type SizeTier = "small" | "medium" | "large" | "xlarge";
export interface ProvisionedResource {
  id: string; kind: string; category: string; subgroup: string; itemId: string; itemName: string;
  region: string; status: string; sizeTier: SizeTier; replicas?: number; options: string[];
  specs: Record<string, unknown>; endpoint: string; hourlyRateUsd: number; createdAt: string;
}
export interface MarketplaceInstallation { id: string; itemId: string; itemName: string; category: string; installedAt: string }
export interface Invoice { id: string; periodStart: string; periodEnd: string; lineItems: { resourceId: string; itemName: string; hours: number; amountUsd: number }[]; totalUsd: number; generatedAt: string }
export interface CostExplorer { byKind: Record<string, number>; byCategory: Record<string, number>; totalUsd: number; resourceCount: number }

/** Wizard config — mirrors the backend's REGIONS / SIZE_TIER_MULTIPLIER. */
export const WIZARD_REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];
export const WIZARD_SIZE_TIERS: { id: SizeTier; label: string; blurb: string; multiplier: number }[] = [
  { id: "small", label: "Small", blurb: "Dev/test workloads, lowest cost.", multiplier: 0.5 },
  { id: "medium", label: "Medium", blurb: "Standard production workloads.", multiplier: 1 },
  { id: "large", label: "Large", blurb: "High-throughput production workloads.", multiplier: 2 },
  { id: "xlarge", label: "X-Large", blurb: "Mission-critical, maximum headroom.", multiplier: 4 },
];
export const WIZARD_OPTION_CHOICES = ["multi-az", "high-availability", "auto-scaling", "encryption-at-rest"];

/** Sidebar/hub navigation groups — hand-curated to mirror catalog.ts's 24 categories without duplicating the full item data client-side. */
export const hiveForgeSections: { id: string; name: string; blurb: string; href: string }[] = [
  { id: "compute", name: "Cloud Compute Console", blurb: "Provision VPS, GPU, Kubernetes, and serverless resources.", href: "/platform/hiveforge/compute" },
  { id: "data", name: "Data & Networking Console", blurb: "Provision databases, storage, and networking.", href: "/platform/hiveforge/data" },
  { id: "marketplace", name: "Marketplace", blurb: "Install models, agents, prompt packs, and templates.", href: "/platform/hiveforge/marketplace" },
  { id: "billing", name: "Billing & Cost Explorer", blurb: "Live usage, cost breakdown by resource kind, invoices.", href: "/platform/hiveforge/billing" },
];

export const catalogCategoryIndex: { id: string; name: string; tagline: string }[] = [
  { id: "ai-development", name: "AI Development", tagline: "Build agents, prompts, and flows end to end." },
  { id: "ai-models", name: "AI Models", tagline: "Foundation, open-source, and fine-tuned models." },
  { id: "ai-agents", name: "AI Agents", tagline: "Pre-built departmental and custom agents." },
  { id: "apis-developer-platform", name: "APIs & Developer Platform", tagline: "Gateway, AI APIs, and backend services." },
  { id: "cloud-compute", name: "Cloud Compute", tagline: "A full compute portfolio — VPS, GPU, inference, training." },
  { id: "kubernetes", name: "Kubernetes", tagline: "Managed, GPU-aware, serverless Kubernetes." },
  { id: "containers", name: "Containers", tagline: "Registry, build, and runtime security." },
  { id: "serverless", name: "Serverless", tagline: "Functions, edge, workers, and scheduled jobs." },
  { id: "databases", name: "Databases", tagline: "SQL, NoSQL, cache, search, vector, and graph." },
  { id: "storage", name: "Storage", tagline: "Object, block, file, archive, and backup." },
  { id: "networking", name: "Networking", tagline: "VPC, DNS, CDN, load balancing, WAF." },
  { id: "devops", name: "DevOps", tagline: "CI/CD, IaC, GitOps, registries, secrets, feature flags." },
  { id: "observability", name: "Observability", tagline: "Metrics, logs, traces, AI/GPU/API telemetry." },
  { id: "security", name: "Security", tagline: "IAM, SSO, RBAC, MFA, secrets, threat detection." },
  { id: "ai-governance", name: "AI Governance", tagline: "Policies, approvals, safety, explainability, risk." },
  { id: "data-platform", name: "Data Platform", tagline: "ETL/ELT, streaming, lake/warehouse, catalog, lineage." },
  { id: "knowledge-platform", name: "Knowledge Platform", tagline: "Enterprise search, RAG, document intelligence." },
  { id: "automation", name: "Automation", tagline: "Workflow, rules, events, queues, approvals." },
  { id: "marketplace", name: "Marketplace", tagline: "Models, agents, prompts, workflows, templates, connectors." },
  { id: "developer-tools", name: "Developer Tools", tagline: "Browser IDE, CLI, SDKs, templates." },
  { id: "deployment-platform", name: "Deployment Platform", tagline: "Static, web apps, APIs, AI apps, workers, edge." },
  { id: "domain-ssl", name: "Domain & SSL", tagline: "Registration, DNS, certificates, edge routing." },
  { id: "enterprise-applications", name: "Enterprise Applications", tagline: "First-class HiveOS modules." },
  { id: "billing-marketplace", name: "Billing & Marketplace", tagline: "Usage, invoices, budgets, cost explorer." },
];
