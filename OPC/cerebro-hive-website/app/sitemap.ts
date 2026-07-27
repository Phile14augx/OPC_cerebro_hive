import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cerebro-hive.com";

// ── Platform product slugs (51 products) ──────────────────────────────────────
const PLATFORM_SLUGS = [
  // T0 — Foundation
  "identity", "govern",
  // T1 — Infrastructure
  "compute", "storage", "network", "memory", "lake", "deploy",
  // T2 — Data & Intelligence
  "data", "vector", "knowledge", "analytics", "observatory", "quality",
  // T3 — AI Runtime
  "models", "agents", "forge", "flow", "automation", "planner", "reasoner", "semantic", "evaluation", "gateway", "api",
  // T4 — Cerebro Applications
  "studio", "agent", "search", "archive", "insight", "copilot", "customer360", "compliance", "console", "ops",
  // T5 — Enterprise & Ecosystem
  "erp", "crm", "hr", "finance", "procurement", "projects", "assets", "pulse",
  "marketplace", "partner", "billing", "license", "cloud", "shield", "learn", "x",
];

// ── Solution slugs (12 solutions) ─────────────────────────────────────────────
const SOLUTION_SLUGS = [
  "enterprise-ai", "ai-agents", "rag", "document-ai", "knowledge-management",
  "hyperautomation", "decision-intelligence", "predictive-analytics",
  "customer-experience", "erp-modernization", "cloud-modernization", "ai-governance",
];

// ── Industry slugs (15 industries) ────────────────────────────────────────────
const INDUSTRY_SLUGS = [
  "finance", "healthcare", "manufacturing", "retail", "government", "insurance",
  "energy", "construction", "real-estate", "logistics", "education", "telecom",
  "technology", "media", "services",
];

// ── Legal slugs (6 docs) ──────────────────────────────────────────────────────
const LEGAL_SLUGS = ["privacy", "terms", "security", "dpa", "cookies", "aup"];

function url(path: string, priority = 0.7, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") {
  return { url: `${BASE_URL}${path}`, lastModified: new Date(), changeFrequency, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core pages ────────────────────────────────────────────────────────────
    url("/", 1.0, "weekly"),
    url("/platform", 0.9, "weekly"),
    url("/services", 0.9, "monthly"),
    url("/solutions", 0.9, "monthly"),
    url("/industries", 0.9, "monthly"),
    url("/academy", 0.8, "monthly"),
    url("/contact", 0.8, "monthly"),
    url("/about", 0.7, "monthly"),
    url("/careers", 0.7, "monthly"),
    url("/company", 0.6, "monthly"),

    // ── Academy sub-pages ─────────────────────────────────────────────────────
    url("/academy/courses", 0.7, "monthly"),
    url("/academy/learning-paths", 0.7, "monthly"),
    url("/academy/corporate-programs", 0.7, "monthly"),
    url("/academy/referral", 0.6, "monthly"),

    // ── Services sub-pages ────────────────────────────────────────────────────
    url("/services/strategy", 0.8, "monthly"),
    url("/services/engineering", 0.8, "monthly"),
    url("/services/operations", 0.8, "monthly"),
    url("/services/security", 0.8, "monthly"),
    url("/services/industry", 0.8, "monthly"),

    // ── Platform product pages ────────────────────────────────────────────────
    ...PLATFORM_SLUGS.map((slug) => url(`/platform/${slug}`, 0.7, "monthly")),

    // ── Solution detail pages ─────────────────────────────────────────────────
    ...SOLUTION_SLUGS.map((slug) => url(`/solutions/${slug}`, 0.7, "monthly")),

    // ── Industry detail pages ─────────────────────────────────────────────────
    ...INDUSTRY_SLUGS.map((slug) => url(`/industries/${slug}`, 0.7, "monthly")),

    // ── Legal pages (lower priority, noindex) ─────────────────────────────────
    ...LEGAL_SLUGS.map((slug) => url(`/legal/${slug}`, 0.3, "yearly")),
  ];
}
