import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";
import { catalog, findCatalogItem, type CatalogCategory, type CatalogCategoryId } from "./catalog.js";

/**
 * HiveForge™ — the Enterprise AI Cloud Marketplace. A governed catalog +
 * deterministic provisioning simulator spanning compute (VPS/GPU/Kubernetes/
 * containers/serverless), data (databases/storage/networking), a deployment
 * platform, domains, and a marketplace, plus usage-based billing.
 *
 * This does not provision real infrastructure — it models the full product
 * surface and provisioning lifecycle (create → running → deprovision) with
 * deterministic, seeded specs/endpoints, exactly like this platform's other
 * simulated operational domains (DevOps pipelines, MLOps model lineage,
 * Digital Twin scenarios). It is the catalog + control-plane layer that a
 * real provisioner would sit behind.
 */

export type ResourceKind = "vps" | "gpu" | "kubernetes" | "container" | "serverless" | "database" | "storage" | "network" | "domain" | "deployment";

const KIND_BY_CATEGORY: Record<CatalogCategoryId, ResourceKind | undefined> = {
  "cloud-compute": undefined, // resolved per-subgroup below
  kubernetes: "kubernetes",
  serverless: "serverless",
  databases: "database",
  storage: "storage",
  networking: "network",
  "deployment-platform": "deployment",
  "domain-ssl": "domain",
  "ai-development": undefined, "ai-models": undefined, "ai-agents": undefined,
  "apis-developer-platform": undefined, containers: "container", devops: undefined,
  observability: undefined, security: undefined, "ai-governance": undefined,
  "data-platform": undefined, "knowledge-platform": undefined, automation: undefined,
  marketplace: undefined, "developer-tools": undefined, "enterprise-applications": undefined,
  "billing-marketplace": undefined,
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
  id: string; organizationId: string; kind: ResourceKind; itemId: string; itemName: string;
  region: string; status: "provisioning" | "running" | "stopped" | "deprovisioned";
  specs: Record<string, unknown>; endpoint: string; hourlyRateUsd: number;
  createdAt: string; deprovisionedAt?: string;
}

export interface MarketplaceInstallation { id: string; organizationId: string; itemId: string; itemName: string; category: string; installedAt: string }

export interface InvoiceLineItem { resourceId: string; itemName: string; hours: number; amountUsd: number }
export interface Invoice { id: string; organizationId: string; periodStart: string; periodEnd: string; lineItems: InvoiceLineItem[]; totalUsd: number; generatedAt: string }

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];

export interface HiveForgeRepository {
  insertResource(r: ProvisionedResource): Promise<void>;
  updateResource(r: ProvisionedResource): Promise<void>;
  listResources(org: string, kind?: ResourceKind): Promise<ProvisionedResource[]>;
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
  async listResources(org: string, kind?: ResourceKind) { return [...this.resources.values()].filter(r => r.organizationId === org && (!kind || r.kind === kind)); }
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
      id, organizationId: org, kind, itemId: found.item.id, itemName: found.item.name,
      region, status: "running", specs: specsFor(kind, found.item.id, rand),
      endpoint: `${kind}-${id.slice(-8)}.${region}.hiveforge.dev`,
      hourlyRateUsd: found.item.hourlyRateUsd ?? 0.05,
      createdAt: new Date().toISOString(),
    };
    await this.repo.insertResource(resource);
    await this.bus.publish(Subjects.hiveforge.resourceProvisioned, { resourceId: resource.id, kind: resource.kind, itemId: resource.itemId }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return resource;
  }

  listResources(ctx: RequestContext, kind?: ResourceKind): Promise<ProvisionedResource[]> {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "resource", organizationId: ctx.principal.organizationId });
    return this.repo.listResources(ctx.principal.organizationId, kind);
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

  /** Cost explorer: sums active resources' accrued cost (hourly rate × age in hours) grouped by kind. */
  async costExplorer(ctx: RequestContext): Promise<{ byKind: Record<string, number>; totalUsd: number; resourceCount: number }> {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "billing", organizationId: ctx.principal.organizationId });
    const resources = await this.repo.listResources(ctx.principal.organizationId);
    const active = resources.filter(r => r.status !== "deprovisioned");
    const byKind: Record<string, number> = {};
    let totalUsd = 0;
    const now = Date.now();
    for (const r of active) {
      const hours = Math.max((now - new Date(r.createdAt).getTime()) / 3_600_000, 1 / 60);
      const cost = Number((hours * r.hourlyRateUsd).toFixed(4));
      byKind[r.kind] = Number(((byKind[r.kind] ?? 0) + cost).toFixed(4));
      totalUsd = Number((totalUsd + cost).toFixed(4));
    }
    return { byKind, totalUsd, resourceCount: active.length };
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
