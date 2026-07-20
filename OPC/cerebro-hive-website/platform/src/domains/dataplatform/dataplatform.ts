import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";

/**
 * Cerebro Data Platform™ — the Data Platform pillar's governed control
 * plane: an asset catalog spanning the streaming/batch/lakehouse/warehouse/
 * vector/graph/time-series/object-storage surface named in the vision doc,
 * lineage edges between assets, and a semantic layer of named business
 * metrics with a single definition of truth. This is a catalog and
 * governance layer, not a data-processing engine — it registers and tracks
 * the assets the platform's other domains (MLOps feature store, Knowledge
 * Fabric, World Model) already produce and consume.
 */

export type DataAssetKind = "table" | "stream" | "lakehouse" | "warehouse" | "vector_index" | "graph" | "time_series" | "object_store" | "feature_view";

export interface DataAsset {
  id: string; organizationId: string; name: string; kind: DataAssetKind; owner: string;
  freshnessSlaMinutes: number; tags: string[]; schema: string[]; lastUpdatedAt?: string; createdAt: string;
}

export interface LineageEdge { id: string; organizationId: string; from: string; to: string; transform: string; createdAt: string }

export interface SemanticMetric { id: string; organizationId: string; name: string; definition: string; sourceAssetId?: string; unit: string; owner: string; createdAt: string }

export interface DataPlatformRepository {
  insertAsset(a: DataAsset): Promise<void>;
  updateAsset(a: DataAsset): Promise<void>;
  listAssets(org: string, kind?: DataAssetKind): Promise<DataAsset[]>;
  getAsset(org: string, id: string): Promise<DataAsset | undefined>;
  insertEdge(e: LineageEdge): Promise<void>;
  listEdges(org: string): Promise<LineageEdge[]>;
  insertMetric(m: SemanticMetric): Promise<void>;
  listMetrics(org: string): Promise<SemanticMetric[]>;
}

export class InMemoryDataPlatformRepository implements DataPlatformRepository {
  assets = new Map<string, DataAsset>();
  edges: LineageEdge[] = [];
  metrics: SemanticMetric[] = [];

  async insertAsset(a: DataAsset) { this.assets.set(a.id, structuredClone(a)); }
  async updateAsset(a: DataAsset) { this.assets.set(a.id, structuredClone(a)); }
  async listAssets(org: string, kind?: DataAssetKind) { return [...this.assets.values()].filter(a => a.organizationId === org && (!kind || a.kind === kind)); }
  async getAsset(org: string, id: string) { const a = this.assets.get(id); return a?.organizationId === org ? structuredClone(a) : undefined; }
  async insertEdge(e: LineageEdge) { this.edges.push(e); }
  async listEdges(org: string) { return this.edges.filter(e => e.organizationId === org); }
  async insertMetric(m: SemanticMetric) { this.metrics.push(m); }
  async listMetrics(org: string) { return this.metrics.filter(m => m.organizationId === org); }
}

export class DataPlatformService {
  constructor(
    private readonly repo: DataPlatformRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  async registerAsset(ctx: RequestContext, input: { name: string; kind: DataAssetKind; owner: string; freshnessSlaMinutes: number; tags?: string[]; schema?: string[] }): Promise<DataAsset> {
    this.policy.assert(ctx.principal, "dataplatform:write", { kind: "asset", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const asset: DataAsset = {
      id: newId("asset"), organizationId: org, name: input.name, kind: input.kind, owner: input.owner,
      freshnessSlaMinutes: input.freshnessSlaMinutes, tags: input.tags ?? [], schema: input.schema ?? [],
      lastUpdatedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    await this.repo.insertAsset(asset);
    await this.bus.publish(Subjects.dataplatform.assetRegistered, { assetId: asset.id, name: asset.name, kind: asset.kind }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return asset;
  }

  listAssets(ctx: RequestContext, kind?: DataAssetKind): Promise<DataAsset[]> {
    this.policy.assert(ctx.principal, "dataplatform:read", { kind: "asset", organizationId: ctx.principal.organizationId });
    return this.repo.listAssets(ctx.principal.organizationId, kind);
  }

  /** Touch an asset's freshness clock (e.g. after a pipeline run lands new data) and evaluate its SLA. */
  async touchAsset(ctx: RequestContext, id: string): Promise<{ asset: DataAsset; withinSla: boolean }> {
    this.policy.assert(ctx.principal, "dataplatform:write", { kind: "asset", organizationId: ctx.principal.organizationId });
    const asset = await this.repo.getAsset(ctx.principal.organizationId, id);
    if (!asset) throw PlatformError.notFound("data_asset", id);
    asset.lastUpdatedAt = new Date().toISOString();
    await this.repo.updateAsset(asset);
    return { asset, withinSla: true };
  }

  async checkFreshness(ctx: RequestContext, id: string): Promise<{ assetId: string; ageMinutes: number; withinSla: boolean }> {
    this.policy.assert(ctx.principal, "dataplatform:read", { kind: "asset", organizationId: ctx.principal.organizationId });
    const asset = await this.repo.getAsset(ctx.principal.organizationId, id);
    if (!asset) throw PlatformError.notFound("data_asset", id);
    const ageMs = asset.lastUpdatedAt ? Date.now() - new Date(asset.lastUpdatedAt).getTime() : Infinity;
    const ageMinutes = Math.round(ageMs / 60_000);
    const withinSla = ageMs <= asset.freshnessSlaMinutes * 60_000;
    if (!withinSla) await this.bus.publish(Subjects.dataplatform.freshnessBreached, { assetId: id, ageMinutes, slaMinutes: asset.freshnessSlaMinutes }, { organizationId: asset.organizationId, traceId: ctx.traceId });
    return { assetId: id, ageMinutes, withinSla };
  }

  async link(ctx: RequestContext, input: { from: string; to: string; transform: string }): Promise<LineageEdge> {
    this.policy.assert(ctx.principal, "dataplatform:write", { kind: "lineage", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const [from, to] = await Promise.all([this.repo.getAsset(org, input.from), this.repo.getAsset(org, input.to)]);
    if (!from) throw PlatformError.notFound("data_asset", input.from);
    if (!to) throw PlatformError.notFound("data_asset", input.to);
    const edge: LineageEdge = { id: newId("lin"), organizationId: org, from: input.from, to: input.to, transform: input.transform, createdAt: new Date().toISOString() };
    await this.repo.insertEdge(edge);
    await this.bus.publish(Subjects.dataplatform.lineageLinked, { edgeId: edge.id, from: edge.from, to: edge.to }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return edge;
  }

  async lineage(ctx: RequestContext, assetId: string): Promise<{ upstream: DataAsset[]; downstream: DataAsset[] }> {
    this.policy.assert(ctx.principal, "dataplatform:read", { kind: "lineage", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const edges = await this.repo.listEdges(org);
    const upstreamIds = edges.filter(e => e.to === assetId).map(e => e.from);
    const downstreamIds = edges.filter(e => e.from === assetId).map(e => e.to);
    const [upstream, downstream] = await Promise.all([
      Promise.all(upstreamIds.map(id => this.repo.getAsset(org, id))),
      Promise.all(downstreamIds.map(id => this.repo.getAsset(org, id))),
    ]);
    return { upstream: upstream.filter((a): a is DataAsset => !!a), downstream: downstream.filter((a): a is DataAsset => !!a) };
  }

  async defineMetric(ctx: RequestContext, input: { name: string; definition: string; sourceAssetId?: string; unit: string; owner: string }): Promise<SemanticMetric> {
    this.policy.assert(ctx.principal, "dataplatform:write", { kind: "metric", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const metric: SemanticMetric = { id: newId("metric"), organizationId: org, ...input, createdAt: new Date().toISOString() };
    await this.repo.insertMetric(metric);
    await this.bus.publish(Subjects.dataplatform.metricDefined, { metricId: metric.id, name: metric.name }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return metric;
  }

  listMetrics(ctx: RequestContext): Promise<SemanticMetric[]> {
    this.policy.assert(ctx.principal, "dataplatform:read", { kind: "metric", organizationId: ctx.principal.organizationId });
    return this.repo.listMetrics(ctx.principal.organizationId);
  }
}
