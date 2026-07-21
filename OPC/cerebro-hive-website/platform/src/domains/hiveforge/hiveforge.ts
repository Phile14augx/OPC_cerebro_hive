import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";
import { catalog, findCatalogItem, type CatalogCategory, type CatalogCategoryId } from "./catalog.js";

/**
 * HiveForge™ — the Enterprise AI Cloud Marketplace. A governed catalog +
 * deterministic provisioning simulator spanning AI development/models/agents,
 * developer APIs, compute (VPS/GPU/Kubernetes/containers/serverless), data
 * (databases/storage/networking), DevOps, observability, security, AI
 * governance, the data & knowledge platforms, automation, the marketplace,
 * developer tools, deployment, domains, enterprise applications, and billing —
 * all 24 product categories, every line item provisionable.
 *
 * This does not provision real infrastructure — it models the full product
 * surface and provisioning lifecycle (create → running → deprovision) with
 * deterministic, seeded specs/endpoints, exactly like this platform's other
 * simulated operational domains (DevOps pipelines, MLOps model lineage,
 * Digital Twin scenarios). It is the catalog + control-plane layer that a
 * real provisioner would sit behind.
 */

export type ResourceKind =
  | "vps" | "gpu" | "kubernetes" | "container" | "serverless"
  | "database" | "storage" | "network" | "domain" | "deployment"
  | "ai-tool" | "ai-model" | "ai-agent" | "api-service"
  | "devops-tool" | "observability-tool" | "security-tool" | "governance-tool"
  | "data-tool" | "knowledge-tool" | "automation-tool" | "developer-tool"
  | "enterprise-app" | "marketplace-item" | "billing-tool";

const KIND_BY_CATEGORY: Record<CatalogCategoryId, ResourceKind | undefined> = {
  "cloud-compute": undefined, // resolved per-subgroup below
  "ai-development": "ai-tool",
  "ai-models": "ai-model",
  "ai-agents": "ai-agent",
  "apis-developer-platform": "api-service",
  kubernetes: "kubernetes",
  containers: "container",
  serverless: "serverless",
  databases: "database",
  storage: "storage",
  networking: "network",
  devops: "devops-tool",
  observability: "observability-tool",
  security: "security-tool",
  "ai-governance": "governance-tool",
  "data-platform": "data-tool",
  "knowledge-platform": "knowledge-tool",
  automation: "automation-tool",
  marketplace: "marketplace-item",
  "developer-tools": "developer-tool",
  "deployment-platform": "deployment",
  "domain-ssl": "domain",
  "enterprise-applications": "enterprise-app",
  "billing-marketplace": "billing-tool",
};

function resolveKind(category: CatalogCategoryId, subgroup: string): ResourceKind {
  const direct = KIND_BY_CATEGORY[category];
  if (direct) return direct;
  if (category === "cloud-compute") {
    if (subgroup === "VPS Cloud") return "vps";
    return "gpu"; // GPU Types, GPU Services, AI Inference, Training all provision as gpu-class compute
  }
  return "deployment";
}

export interface ProvisionedResource {
  id: string; organizationId: string; kind: ResourceKind; category: CatalogCategoryId; subgroup: string;
  itemId: string; itemName: string;
  region: string; status: "provisioning" | "running" | "stopped" | "deprovisioned";
  specs: Record<string, unknown>; endpoint: string; hourlyRateUsd: number;
  createdAt: string; deprovisionedAt?: string;
}

export interface MarketplaceInstallation { id: string; organizationId: string; itemId: string; itemName: string; category: string; installedAt: string }

export interface InvoiceLineItem { resourceId: string; itemName: string; hours: number; amountUsd: number }
export interface Invoice { id: string; organizationId: string; periodStart: string; periodEnd: string; lineItems: InvoiceLineItem[]; totalUsd: number; generatedAt: string }

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];

export interface ResourceFilter { kind?: ResourceKind; category?: CatalogCategoryId }

export interface HiveForgeRepository {
  insertResource(r: ProvisionedResource): Promise<void>;
  updateResource(r: ProvisionedResource): Promise<void>;
  listResources(org: string, filter?: ResourceFilter): Promise<ProvisionedResource[]>;
  getResource(org: string, id: string): Promise<ProvisionedResource | undefined>;
  insertInstallation(i: MarketplaceInstallation): Promise<void>;
  listInstallations(org: string): Promise<MarketplaceInstallation[]>;
  insertInvoice(i: Invoice): Promise<void>;
  listInvoices(org: string): Promise<Invoice[]>;
}

export class InMemoryHiveForgeRepository implements HiveForgeRepository {
  resources = new Map<string, ProvisionedResource>();
  installations: MarketplaceInstallation[] = [];
  invoices: Invoice[] = [];

  async insertResource(r: ProvisionedResource) { this.resources.set(r.id, structuredClone(r)); }
  async updateResource(r: ProvisionedResource) { this.resources.set(r.id, structuredClone(r)); }
  async listResources(org: string, filter?: ResourceFilter) {
    return [...this.resources.values()].filter(r =>
      r.organizationId === org &&
      (!filter?.kind || r.kind === filter.kind) &&
      (!filter?.category || r.category === filter.category));
  }
  async getResource(org: string, id: string) { const r = this.resources.get(id); return r?.organizationId === org ? structuredClone(r) : undefined; }
  async insertInstallation(i: MarketplaceInstallation) { this.installations.push(i); }
  async listInstallations(org: string) { return this.installations.filter(i => i.organizationId === org); }
  async insertInvoice(i: Invoice) { this.invoices.push(i); }
  async listInvoices(org: string) { return this.invoices.filter(i => i.organizationId === org); }
}

function specsFor(kind: ResourceKind, itemId: string, rand: () => number): Record<string, unknown> {
  switch (kind) {
    case "vps": return { vcpu: [1, 2, 4, 8, 16][Math.floor(rand() * 5)], ramGb: [1, 2, 4, 8, 32][Math.floor(rand() * 5)], diskGb: 25 + Math.floor(rand() * 400) };
    case "gpu": return { gpuCount: [1, 2, 4, 8][Math.floor(rand() * 4)], vramGb: itemId.includes("h100") || itemId.includes("h200") ? 80 : itemId.includes("a100") ? 40 : 24, interconnect: rand() > 0.5 ? "NVLink" : "PCIe" };
    case "kubernetes": return { nodes: 3 + Math.floor(rand() * 12), version: "1.31", nodePoolType: rand() > 0.6 ? "gpu" : "cpu" };
    case "container": return { registry: "registry.hiveforge.dev", image: `hiveforge/${itemId}`, replicas: 1 + Math.floor(rand() * 5) };
    case "serverless": return { runtime: "node20", memoryMb: [128, 256, 512, 1024][Math.floor(rand() * 4)], coldStartMs: 40 + Math.floor(rand() * 200) };
    case "database": return { storageGb: 10 + Math.floor(rand() * 490), replicas: rand() > 0.5 ? 2 : 1, version: "latest" };
    case "storage": return { capacityGb: 100 + Math.floor(rand() * 9900), redundancy: rand() > 0.5 ? "multi-az" : "single-az" };
    case "network": return { bandwidthGbps: [1, 5, 10, 25][Math.floor(rand() * 4)] };
    case "domain": return { autoRenew: true, dnssec: rand() > 0.3 };
    case "deployment": return { framework: "auto-detect", buildMinutes: 1 + Math.floor(rand() * 6) };
    case "ai-tool": return { seatLicenses: 1 + Math.floor(rand() * 49), workspaces: 1 + Math.floor(rand() * 8), computeCreditsPerMonth: 1000 + Math.floor(rand() * 9000) };
    case "ai-model": return {
      parameters: ["7B", "13B", "34B", "70B", "405B"][Math.floor(rand() * 5)],
      contextWindowTokens: [8000, 32000, 128000, 200000][Math.floor(rand() * 4)],
      modality: itemId.includes("vision") ? "vision" : itemId.includes("audio") || itemId.includes("speech") ? "audio" : itemId.includes("embed") ? "embedding" : "text",
    };
    case "ai-agent": return { maxStepsPerRun: 5 + Math.floor(rand() * 45), toolsGranted: 1 + Math.floor(rand() * 12), memoryEnabled: rand() > 0.3 };
    case "api-service": return { rateLimitRpm: [60, 600, 6000, 60000][Math.floor(rand() * 4)], authMethod: rand() > 0.5 ? "api-key" : "oauth2", regionsServed: 1 + Math.floor(rand() * 4) };
    case "devops-tool": return { pipelinesActive: 1 + Math.floor(rand() * 20), buildMinutesIncluded: 500 + Math.floor(rand() * 9500), concurrency: 1 + Math.floor(rand() * 8) };
    case "observability-tool": return { retentionDays: [7, 14, 30, 90][Math.floor(rand() * 4)], ingestGbPerDay: 1 + Math.floor(rand() * 500), alertRules: Math.floor(rand() * 50) };
    case "security-tool": return { usersProtected: 10 + Math.floor(rand() * 990), mfaEnforced: rand() > 0.2, threatFeedsActive: 1 + Math.floor(rand() * 6) };
    case "governance-tool": return { policiesEnforced: 1 + Math.floor(rand() * 30), approvalSlaHours: [1, 4, 12, 24][Math.floor(rand() * 4)], auditRetentionDays: 365 };
    case "data-tool": return { pipelinesActive: 1 + Math.floor(rand() * 15), throughputMbps: 10 + Math.floor(rand() * 990), connectorsConfigured: 1 + Math.floor(rand() * 20) };
    case "knowledge-tool": return { documentsIndexed: 1000 + Math.floor(rand() * 999000), embeddingDims: [384, 768, 1536, 3072][Math.floor(rand() * 4)], refreshIntervalMin: [5, 15, 60, 1440][Math.floor(rand() * 4)] };
    case "automation-tool": return { workflowsActive: 1 + Math.floor(rand() * 40), runsPerDay: Math.floor(rand() * 5000), avgRunSeconds: 1 + Math.floor(rand() * 120) };
    case "developer-tool": return { seats: 1 + Math.floor(rand() * 50), buildMinutesIncluded: 100 + Math.floor(rand() * 4900) };
    case "enterprise-app": return { activeUsers: 10 + Math.floor(rand() * 4990), modulesEnabled: 1 + Math.floor(rand() * 10) };
    case "marketplace-item": return { installScope: rand() > 0.5 ? "organization" : "workspace", version: `${1 + Math.floor(rand() * 4)}.${Math.floor(rand() * 10)}.${Math.floor(rand() * 10)}` };
    case "billing-tool": return { billingCycle: rand() > 0.5 ? "monthly" : "usage-based", currency: "USD" };
  }
}

export class HiveForgeService {
  constructor(
    private readonly repo: HiveForgeRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  listCatalog(ctx: RequestContext, category?: CatalogCategoryId): CatalogCategory[] {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "catalog", organizationId: ctx.principal.organizationId });
    return category ? catalog.filter(c => c.id === category) : catalog;
  }

  async provision(ctx: RequestContext, input: { itemId: string; region?: string }): Promise<ProvisionedResource> {
    this.policy.assert(ctx.principal, "hiveforge:write", { kind: "resource", organizationId: ctx.principal.organizationId });
    const found = findCatalogItem(input.itemId);
    if (!found) throw PlatformError.notFound("catalog_item", input.itemId);
    if (!found.item.provisionable) throw PlatformError.validation(`"${found.item.name}" is not a provisionable resource`);
    const org = ctx.principal.organizationId;
    const id = newId("res");
    const rand = seededRandom(`${found.item.id}:${id}`);
    const kind = resolveKind(found.category, found.subgroup);
    const region = input.region ?? REGIONS[Math.floor(rand() * REGIONS.length)] ?? "us-east-1";
    const resource: ProvisionedResource = {
      id, organizationId: org, kind, category: found.category, subgroup: found.subgroup,
      itemId: found.item.id, itemName: found.item.name,
      region, status: "running", specs: specsFor(kind, found.item.id, rand),
      endpoint: `${kind}-${id.slice(-8)}.${region}.hiveforge.dev`,
      hourlyRateUsd: found.item.hourlyRateUsd ?? 0.05,
      createdAt: new Date().toISOString(),
    };
    await this.repo.insertResource(resource);
    await this.bus.publish(Subjects.hiveforge.resourceProvisioned, { resourceId: resource.id, kind: resource.kind, category: resource.category, itemId: resource.itemId }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return resource;
  }

  listResources(ctx: RequestContext, filter?: ResourceFilter): Promise<ProvisionedResource[]> {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "resource", organizationId: ctx.principal.organizationId });
    return this.repo.listResources(ctx.principal.organizationId, filter);
  }

  async deprovision(ctx: RequestContext, id: string): Promise<ProvisionedResource> {
    this.policy.assert(ctx.principal, "hiveforge:write", { kind: "resource", organizationId: ctx.principal.organizationId });
    const resource = await this.repo.getResource(ctx.principal.organizationId, id);
    if (!resource) throw PlatformError.notFound("resource", id);
    if (resource.status === "deprovisioned") return resource;
    resource.status = "deprovisioned";
    resource.deprovisionedAt = new Date().toISOString();
    await this.repo.updateResource(resource);
    await this.bus.publish(Subjects.hiveforge.resourceDeprovisioned, { resourceId: resource.id, kind: resource.kind }, { organizationId: resource.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return resource;
  }

  async installMarketplaceItem(ctx: RequestContext, itemId: string): Promise<MarketplaceInstallation> {
    this.policy.assert(ctx.principal, "hiveforge:write", { kind: "installation", organizationId: ctx.principal.organizationId });
    const found = findCatalogItem(itemId);
    if (!found) throw PlatformError.notFound("catalog_item", itemId);
    const org = ctx.principal.organizationId;
    const installation: MarketplaceInstallation = { id: newId("inst"), organizationId: org, itemId: found.item.id, itemName: found.item.name, category: found.category, installedAt: new Date().toISOString() };
    await this.repo.insertInstallation(installation);
    await this.bus.publish(Subjects.hiveforge.marketplaceInstalled, { installationId: installation.id, itemId: installation.itemId }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return installation;
  }

  listInstallations(ctx: RequestContext): Promise<MarketplaceInstallation[]> {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "installation", organizationId: ctx.principal.organizationId });
    return this.repo.listInstallations(ctx.principal.organizationId);
  }

  /** Cost explorer: sums active resources' accrued cost (hourly rate × age in hours) grouped by kind and by category. */
  async costExplorer(ctx: RequestContext): Promise<{ byKind: Record<string, number>; byCategory: Record<string, number>; totalUsd: number; resourceCount: number }> {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "billing", organizationId: ctx.principal.organizationId });
    const resources = await this.repo.listResources(ctx.principal.organizationId);
    const active = resources.filter(r => r.status !== "deprovisioned");
    const byKind: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalUsd = 0;
    const now = Date.now();
    for (const r of active) {
      const hours = Math.max((now - new Date(r.createdAt).getTime()) / 3_600_000, 1 / 60);
      const cost = Number((hours * r.hourlyRateUsd).toFixed(4));
      byKind[r.kind] = Number(((byKind[r.kind] ?? 0) + cost).toFixed(4));
      byCategory[r.category] = Number(((byCategory[r.category] ?? 0) + cost).toFixed(4));
      totalUsd = Number((totalUsd + cost).toFixed(4));
    }
    return { byKind, byCategory, totalUsd, resourceCount: active.length };
  }

  async generateInvoice(ctx: RequestContext): Promise<Invoice> {
    this.policy.assert(ctx.principal, "hiveforge:write", { kind: "billing", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const resources = (await this.repo.listResources(org)).filter(r => r.status !== "deprovisioned");
    const now = Date.now();
    const periodStart = new Date(now - 30 * 24 * 3_600_000).toISOString();
    const lineItems: InvoiceLineItem[] = resources.map(r => {
      const hours = Math.max((now - new Date(r.createdAt).getTime()) / 3_600_000, 1 / 60);
      return { resourceId: r.id, itemName: r.itemName, hours: Number(hours.toFixed(2)), amountUsd: Number((hours * r.hourlyRateUsd).toFixed(2)) };
    });
    const invoice: Invoice = {
      id: newId("inv"), organizationId: org, periodStart, periodEnd: new Date(now).toISOString(),
      lineItems, totalUsd: Number(lineItems.reduce((s, l) => s + l.amountUsd, 0).toFixed(2)), generatedAt: new Date(now).toISOString(),
    };
    await this.repo.insertInvoice(invoice);
    await this.bus.publish(Subjects.hiveforge.invoiceGenerated, { invoiceId: invoice.id, totalUsd: invoice.totalUsd }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return invoice;
  }

  listInvoices(ctx: RequestContext): Promise<Invoice[]> {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "billing", organizationId: ctx.principal.organizationId });
    return this.repo.listInvoices(ctx.principal.organizationId);
  }
}
