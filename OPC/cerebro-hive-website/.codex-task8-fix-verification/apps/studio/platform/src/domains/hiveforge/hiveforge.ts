import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { catalog, findCatalogItem, type CatalogCategoryId } from "./catalog.js";
import type { HiveForgeProvider } from "./provider.js";

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

/** Size tier chosen in the provisioning wizard — scales specs and hourly rate via SIZE_TIER_MULTIPLIER. */
export type SizeTier = "small" | "medium" | "large" | "xlarge";

export const SIZE_TIER_MULTIPLIER: Record<SizeTier, number> = { small: 0.5, medium: 1, large: 2, xlarge: 4 };

export interface ProvisionInput {
  itemId: string;
  region?: string;
  sizeTier?: SizeTier;
  replicas?: number;
  options?: string[];
}

export interface ProvisionedResource {
  id: string; organizationId: string; kind: ResourceKind; category: CatalogCategoryId; subgroup: string;
  itemId: string; itemName: string;
  region: string; status: "provisioning" | "running" | "stopped" | "deprovisioned";
  sizeTier: SizeTier; replicas?: number; options: string[];
  specs: Record<string, unknown>; endpoint: string; hourlyRateUsd: number;
  createdAt: string; deprovisionedAt?: string;
}

export interface MarketplaceInstallation { id: string; organizationId: string; itemId: string; itemName: string; category: string; installedAt: string }

export interface InvoiceLineItem { resourceId: string; itemName: string; hours: number; amountUsd: number }
export interface Invoice { id: string; organizationId: string; periodStart: string; periodEnd: string; lineItems: InvoiceLineItem[]; totalUsd: number; generatedAt: string }

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

export class HiveForgeService {
  constructor(
    private readonly repo: HiveForgeRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    /** Phase 2 of docs/architecture/HIVEFORGE-CONSOLIDATION.md — provision()/deprovision() delegate here. Always SimulatorProvider today; the seam a real cloud provider plugs into later. */
    private readonly provider: HiveForgeProvider,
  ) {}

  /**
   * Browsable catalog, with each item annotated with the ResourceKind it will provision as.
   * The frontend wizard uses this to render a kind-specific configuration step (a GPU item gets
   * GPU-shaped fields, an AI model gets model-shaped fields, a database gets database-shaped
   * fields, etc.) instead of one generic form for all 230+ line items.
   */
  listCatalog(ctx: RequestContext, category?: CatalogCategoryId) {
    this.policy.assert(ctx.principal, "hiveforge:read", { kind: "catalog", organizationId: ctx.principal.organizationId });
    const cats = category ? catalog.filter(c => c.id === category) : catalog;
    return cats.map(c => ({
      ...c,
      subgroups: c.subgroups.map(sg => ({
        ...sg,
        items: sg.items.map(item => ({ ...item, kind: resolveKind(c.id, sg.name) })),
      })),
    }));
  }

  async provision(ctx: RequestContext, input: ProvisionInput): Promise<ProvisionedResource> {
    this.policy.assert(ctx.principal, "hiveforge:write", { kind: "resource", organizationId: ctx.principal.organizationId });
    const found = findCatalogItem(input.itemId);
    if (!found) throw PlatformError.notFound("catalog_item", input.itemId);
    if (!found.item.provisionable) throw PlatformError.validation(`"${found.item.name}" is not a provisionable resource`);
    const org = ctx.principal.organizationId;
    const id = newId("res");
    const kind = resolveKind(found.category, found.subgroup);
    const sizeTier: SizeTier = input.sizeTier ?? "medium";
    const options = input.options ?? [];
    const result = await this.provider.provision({
      id, itemId: found.item.id, kind, region: input.region, sizeTier, replicas: input.replicas, options,
      baseHourlyRateUsd: found.item.hourlyRateUsd,
    });
    const resource: ProvisionedResource = {
      id, organizationId: org, kind, category: found.category, subgroup: found.subgroup,
      itemId: found.item.id, itemName: found.item.name,
      region: result.region, status: "running", sizeTier, replicas: input.replicas, options,
      specs: result.specs,
      endpoint: result.endpoint,
      hourlyRateUsd: result.hourlyRateUsd,
      createdAt: new Date().toISOString(),
    };
    await this.repo.insertResource(resource);
    await this.bus.publish(Subjects.hiveforge.resourceProvisioned, { resourceId: resource.id, kind: resource.kind, category: resource.category, itemId: resource.itemId, sizeTier: resource.sizeTier }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
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
    await this.provider.deprovision(resource.id);
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
