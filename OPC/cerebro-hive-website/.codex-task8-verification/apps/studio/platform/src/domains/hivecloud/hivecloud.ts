import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { seededRandom } from "../simulator/simulator.js";

/**
 * The Hive Infrastructure Suite — HiveCloud™, HiveStorage™, HiveCompute™, HiveNetwork™,
 * HiveIdentity™, HiveMonitor™, and HiveAPI™. Seven named enterprise cloud/infrastructure
 * products, implemented as one cohesive governed-simulation domain (the same pattern used by
 * cerebrogrowth.ts's Content Studio/CRM/Sales Copilot and cerebroforge.ts's Discovery/Scoring/
 * Product Generator — related capabilities under one service). Real provisioning against actual
 * AWS/Azure/GCP accounts needs live cloud credentials this platform doesn't have; what's built
 * here is the governed control-plane layer that would sit in front of that provisioning API:
 * deterministic cost estimation, compliance/risk scoring, and topology/observability modeling for
 * every resource an enterprise would provision. HiveShield™ is deliberately not included here —
 * today it's only marketing copy (lib/data/products/hive-shield.ts) with no backend behind it, and
 * this task didn't ask for it to be built.
 *
 * - HiveCloud™     — multi-cloud landing zone / account provisioning & compliance scoring
 * - HiveStorage™   — object/block storage provisioning, tiering, lifecycle policy
 * - HiveCompute™   — VM/container/serverless instance provisioning & utilization
 * - HiveNetwork™   — VPC/subnet topology, peering, latency & throughput modeling
 * - HiveIdentity™  — IAM roles, SSO/MFA posture, access risk scoring
 * - HiveMonitor™   — service health monitors, uptime, incident tracking
 * - HiveAPI™       — API gateway endpoint catalog, rate limits, latency/error metrics
 */

// ---------------------------------------------------------------------------------------------
// HiveCloud™ — multi-cloud landing zones
// ---------------------------------------------------------------------------------------------

export type CloudProvider = "aws" | "azure" | "gcp" | "on-prem";
export type CloudEnvironment = "production" | "staging" | "development";

export interface CloudAccount {
  id: string; organizationId: string; accountName: string; provider: CloudProvider;
  region: string; environment: CloudEnvironment; status: "active" | "provisioning";
  monthlyCostUsd: number; complianceScore: number; landingZoneComponents: string[];
  createdAt: string;
}

const LANDING_ZONE_COMPONENTS: Record<CloudProvider, string[]> = {
  aws: ["Organizations + SCPs", "Control Tower guardrails", "CloudTrail + Config", "VPC + Transit Gateway"],
  azure: ["Management Groups", "Azure Policy", "Activity Log + Monitor", "Hub-spoke VNet"],
  gcp: ["Resource Manager hierarchy", "Org Policy constraints", "Cloud Audit Logs", "Shared VPC"],
  "on-prem": ["vCenter resource pools", "Local IAM directory", "Syslog aggregation", "Physical network segmentation"],
};

function buildCloudAccount(input: { provider: CloudProvider; environment: CloudEnvironment }, rand: () => number): Pick<CloudAccount, "status" | "monthlyCostUsd" | "complianceScore" | "landingZoneComponents"> {
  const envBaseCost: Record<CloudEnvironment, number> = { production: 8000, staging: 2500, development: 800 };
  const monthlyCostUsd = Math.round((envBaseCost[input.environment] + rand() * 4000) / 50) * 50;
  const envBaseCompliance: Record<CloudEnvironment, number> = { production: 78, staging: 65, development: 55 };
  const complianceScore = Math.max(30, Math.min(99, Math.round(envBaseCompliance[input.environment] + rand() * 20)));
  return { status: "active", monthlyCostUsd, complianceScore, landingZoneComponents: LANDING_ZONE_COMPONENTS[input.provider] };
}

// ---------------------------------------------------------------------------------------------
// HiveStorage™ — object/block storage
// ---------------------------------------------------------------------------------------------

export type StorageTier = "hot" | "warm" | "cold" | "archive";

export interface StorageBucket {
  id: string; organizationId: string; name: string; provider: CloudProvider; tier: StorageTier;
  sizeGb: number; encrypted: boolean; replicationFactor: number; monthlyCostUsd: number;
  lifecyclePolicy: string; createdAt: string;
}

const TIER_RATE_PER_GB: Record<StorageTier, number> = { hot: 0.023, warm: 0.0125, cold: 0.004, archive: 0.00099 };
const TIER_REPLICATION: Record<StorageTier, number> = { hot: 3, warm: 3, cold: 2, archive: 1 };
const TIER_LIFECYCLE: Record<StorageTier, string> = {
  hot: "Transition to Warm after 30 days, Cold after 90 days",
  warm: "Transition to Cold after 60 days, Archive after 180 days",
  cold: "Transition to Archive after 180 days",
  archive: "No further transitions — retained per compliance policy",
};

function buildStorageBucket(input: { provider: CloudProvider; tier: StorageTier; sizeGb: number }, rand: () => number): Pick<StorageBucket, "encrypted" | "replicationFactor" | "monthlyCostUsd" | "lifecyclePolicy"> {
  const monthlyCostUsd = Math.round(input.sizeGb * TIER_RATE_PER_GB[input.tier] * (0.9 + rand() * 0.2) * 100) / 100;
  return { encrypted: true, replicationFactor: TIER_REPLICATION[input.tier], monthlyCostUsd, lifecyclePolicy: TIER_LIFECYCLE[input.tier] };
}

// ---------------------------------------------------------------------------------------------
// HiveCompute™ — instance provisioning
// ---------------------------------------------------------------------------------------------

export type ComputeKind = "vm" | "container" | "serverless";
export type ComputeSizeTier = "small" | "medium" | "large" | "xlarge";

export interface ComputeInstance {
  id: string; organizationId: string; name: string; kind: ComputeKind; sizeTier: ComputeSizeTier;
  region: string; vcpu: number; memoryGb: number; utilizationPct: number; autoscaling: boolean;
  monthlyCostUsd: number; createdAt: string;
}

const SIZE_SPEC: Record<ComputeSizeTier, { vcpu: number; memoryGb: number }> = {
  small: { vcpu: 2, memoryGb: 4 }, medium: { vcpu: 4, memoryGb: 16 },
  large: { vcpu: 8, memoryGb: 32 }, xlarge: { vcpu: 16, memoryGb: 64 },
};
const KIND_RATE_MULTIPLIER: Record<ComputeKind, number> = { vm: 1, container: 0.75, serverless: 0.5 };

function buildComputeInstance(input: { kind: ComputeKind; sizeTier: ComputeSizeTier; autoscaling: boolean }, rand: () => number): Pick<ComputeInstance, "vcpu" | "memoryGb" | "utilizationPct" | "monthlyCostUsd"> {
  const spec = SIZE_SPEC[input.sizeTier];
  const utilizationPct = Math.round(30 + rand() * 60);
  const baseCost = (spec.vcpu * 28 + spec.memoryGb * 5) * KIND_RATE_MULTIPLIER[input.kind];
  const monthlyCostUsd = Math.round(baseCost * (input.autoscaling ? 0.7 + (utilizationPct / 100) * 0.4 : 1) * (0.95 + rand() * 0.1));
  return { vcpu: spec.vcpu, memoryGb: spec.memoryGb, utilizationPct, monthlyCostUsd };
}

// ---------------------------------------------------------------------------------------------
// HiveNetwork™ — network topology
// ---------------------------------------------------------------------------------------------

export interface NetworkTopology {
  id: string; organizationId: string; name: string; cidr: string; region: string;
  subnetCount: number; peeredWith: string[]; latencyMsEstimate: number; throughputGbps: number;
  monthlyCostUsd: number; createdAt: string;
}

function buildNetworkTopology(input: { subnetCount: number; peeredWith: string[] }, rand: () => number): Pick<NetworkTopology, "latencyMsEstimate" | "throughputGbps" | "monthlyCostUsd"> {
  const latencyMsEstimate = Math.round((2 + input.peeredWith.length * 4 + rand() * 6) * 10) / 10;
  const throughputGbps = Math.round((10 - input.peeredWith.length * 0.5 + rand() * 5) * 10) / 10;
  const monthlyCostUsd = Math.round((input.subnetCount * 45 + input.peeredWith.length * 120 + rand() * 200) / 10) * 10;
  return { latencyMsEstimate: Math.max(1, latencyMsEstimate), throughputGbps: Math.max(1, throughputGbps), monthlyCostUsd };
}

// ---------------------------------------------------------------------------------------------
// HiveIdentity™ — IAM
// ---------------------------------------------------------------------------------------------

export interface IdentityRole {
  id: string; organizationId: string; name: string; permissions: string[]; mfaRequired: boolean;
  ssoProvider?: string; memberCount: number; riskScore: number; riskFactors: string[]; createdAt: string;
}

function buildIdentityRole(input: { permissions: string[]; mfaRequired: boolean; ssoProvider?: string; memberCount: number }, rand: () => number): Pick<IdentityRole, "riskScore" | "riskFactors"> {
  let risk = 20 + Math.floor(rand() * 15);
  const factors: string[] = [`Baseline risk for a standard role: +${risk}`];
  const hasWildcard = input.permissions.some(p => p.includes("*") || /admin|owner/i.test(p));
  if (hasWildcard) { risk += 30; factors.push("Includes wildcard or admin-level permissions: +30"); }
  if (!input.mfaRequired) { risk += 20; factors.push("MFA not required for this role: +20"); }
  else { factors.push("MFA required: no additional risk"); }
  if (!input.ssoProvider) { risk += 10; factors.push("No SSO provider configured: +10"); }
  else { factors.push(`SSO via ${input.ssoProvider}: reduces credential risk`); }
  if (input.memberCount > 20) { risk += 10; factors.push(`Large membership (${input.memberCount}): +10 (broader blast radius)`); }
  risk = Math.max(5, Math.min(99, risk));
  return { riskScore: risk, riskFactors: factors };
}

// ---------------------------------------------------------------------------------------------
// HiveMonitor™ — observability
// ---------------------------------------------------------------------------------------------

export type MonitorStatus = "healthy" | "degraded" | "critical";

export interface Monitor {
  id: string; organizationId: string; serviceName: string; metric: string;
  thresholdWarning: number; thresholdCritical: number; status: MonitorStatus;
  uptimePct: number; incidentsLast30d: number; alertChannels: string[]; createdAt: string;
}

function buildMonitor(rand: () => number): Pick<Monitor, "status" | "uptimePct" | "incidentsLast30d"> {
  const uptimePct = Math.round((95 + rand() * 4.99) * 100) / 100;
  const incidentsLast30d = uptimePct < 98 ? 3 + Math.floor(rand() * 4) : uptimePct < 99.5 ? 1 + Math.floor(rand() * 3) : Math.floor(rand() * 2);
  const status: MonitorStatus = uptimePct < 98 ? "critical" : uptimePct < 99.5 ? "degraded" : "healthy";
  return { status, uptimePct, incidentsLast30d };
}

// ---------------------------------------------------------------------------------------------
// HiveAPI™ — API gateway
// ---------------------------------------------------------------------------------------------

export type ApiAuthType = "api-key" | "oauth2" | "mtls";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEndpoint {
  id: string; organizationId: string; name: string; method: HttpMethod; path: string;
  authType: ApiAuthType; rateLimitPerMin: number; monthlyCalls: number; avgLatencyMs: number;
  errorRatePct: number; createdAt: string;
}

const AUTH_LATENCY_OVERHEAD: Record<ApiAuthType, number> = { "api-key": 5, oauth2: 15, mtls: 25 };

function buildApiEndpoint(input: { authType: ApiAuthType; rateLimitPerMin: number }, rand: () => number): Pick<ApiEndpoint, "monthlyCalls" | "avgLatencyMs" | "errorRatePct"> {
  const monthlyCalls = Math.round(input.rateLimitPerMin * 60 * 24 * 30 * (0.1 + rand() * 0.4));
  const avgLatencyMs = Math.round(20 + AUTH_LATENCY_OVERHEAD[input.authType] + rand() * 80);
  const errorRatePct = Math.round(rand() * 4 * 100) / 100;
  return { monthlyCalls, avgLatencyMs, errorRatePct };
}

// ---------------------------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------------------------

export interface HiveCloudRepository {
  insertCloudAccount(a: CloudAccount): Promise<void>; listCloudAccounts(org: string): Promise<CloudAccount[]>;
  insertStorageBucket(b: StorageBucket): Promise<void>; listStorageBuckets(org: string): Promise<StorageBucket[]>;
  insertComputeInstance(c: ComputeInstance): Promise<void>; listComputeInstances(org: string): Promise<ComputeInstance[]>;
  insertNetworkTopology(n: NetworkTopology): Promise<void>; listNetworkTopologies(org: string): Promise<NetworkTopology[]>;
  insertIdentityRole(r: IdentityRole): Promise<void>; listIdentityRoles(org: string): Promise<IdentityRole[]>;
  insertMonitor(m: Monitor): Promise<void>; listMonitors(org: string): Promise<Monitor[]>;
  insertApiEndpoint(e: ApiEndpoint): Promise<void>; listApiEndpoints(org: string): Promise<ApiEndpoint[]>;
}

export class InMemoryHiveCloudRepository implements HiveCloudRepository {
  cloudAccounts = new Map<string, CloudAccount>();
  storageBuckets = new Map<string, StorageBucket>();
  computeInstances = new Map<string, ComputeInstance>();
  networkTopologies = new Map<string, NetworkTopology>();
  identityRoles = new Map<string, IdentityRole>();
  monitors = new Map<string, Monitor>();
  apiEndpoints = new Map<string, ApiEndpoint>();

  async insertCloudAccount(a: CloudAccount) { this.cloudAccounts.set(a.id, structuredClone(a)); }
  async listCloudAccounts(org: string) { return [...this.cloudAccounts.values()].filter(a => a.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertStorageBucket(b: StorageBucket) { this.storageBuckets.set(b.id, structuredClone(b)); }
  async listStorageBuckets(org: string) { return [...this.storageBuckets.values()].filter(b => b.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertComputeInstance(c: ComputeInstance) { this.computeInstances.set(c.id, structuredClone(c)); }
  async listComputeInstances(org: string) { return [...this.computeInstances.values()].filter(c => c.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertNetworkTopology(n: NetworkTopology) { this.networkTopologies.set(n.id, structuredClone(n)); }
  async listNetworkTopologies(org: string) { return [...this.networkTopologies.values()].filter(n => n.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertIdentityRole(r: IdentityRole) { this.identityRoles.set(r.id, structuredClone(r)); }
  async listIdentityRoles(org: string) { return [...this.identityRoles.values()].filter(r => r.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertMonitor(m: Monitor) { this.monitors.set(m.id, structuredClone(m)); }
  async listMonitors(org: string) { return [...this.monitors.values()].filter(m => m.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async insertApiEndpoint(e: ApiEndpoint) { this.apiEndpoints.set(e.id, structuredClone(e)); }
  async listApiEndpoints(org: string) { return [...this.apiEndpoints.values()].filter(e => e.organizationId === org).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
}

// ---------------------------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------------------------

export class HiveCloudService {
  constructor(
    private readonly repo: HiveCloudRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
  ) {}

  // --- HiveCloud™ ---
  async provisionCloudAccount(ctx: RequestContext, input: { accountName: string; provider: CloudProvider; region: string; environment: CloudEnvironment }): Promise<CloudAccount> {
    this.policy.assert(ctx.principal, "hivecloud:write", { kind: "cloud-account", organizationId: ctx.principal.organizationId });
    if (!input.accountName.trim()) throw PlatformError.validation("accountName is required");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.accountName}:${input.provider}:${input.environment}`);
    const built = buildCloudAccount(input, rand);
    const account: CloudAccount = { id: newId("cla"), organizationId: org, accountName: input.accountName, provider: input.provider, region: input.region, environment: input.environment, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertCloudAccount(account);
    await this.bus.publish(Subjects.hivecloud.accountProvisioned, { accountId: account.id, provider: input.provider }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return account;
  }
  listCloudAccounts(ctx: RequestContext): Promise<CloudAccount[]> {
    this.policy.assert(ctx.principal, "hivecloud:read", { kind: "cloud-account", organizationId: ctx.principal.organizationId });
    return this.repo.listCloudAccounts(ctx.principal.organizationId);
  }

  // --- HiveStorage™ ---
  async provisionStorageBucket(ctx: RequestContext, input: { name: string; provider: CloudProvider; tier: StorageTier; sizeGb: number }): Promise<StorageBucket> {
    this.policy.assert(ctx.principal, "hivestorage:write", { kind: "bucket", organizationId: ctx.principal.organizationId });
    if (!input.name.trim()) throw PlatformError.validation("name is required");
    if (input.sizeGb <= 0) throw PlatformError.validation("sizeGb must be positive");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.name}:${input.tier}:${input.sizeGb}`);
    const built = buildStorageBucket(input, rand);
    const bucket: StorageBucket = { id: newId("stb"), organizationId: org, name: input.name, provider: input.provider, tier: input.tier, sizeGb: input.sizeGb, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertStorageBucket(bucket);
    await this.bus.publish(Subjects.hivecloud.bucketProvisioned, { bucketId: bucket.id, tier: input.tier }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return bucket;
  }
  listStorageBuckets(ctx: RequestContext): Promise<StorageBucket[]> {
    this.policy.assert(ctx.principal, "hivestorage:read", { kind: "bucket", organizationId: ctx.principal.organizationId });
    return this.repo.listStorageBuckets(ctx.principal.organizationId);
  }

  // --- HiveCompute™ ---
  async provisionComputeInstance(ctx: RequestContext, input: { name: string; kind: ComputeKind; sizeTier: ComputeSizeTier; region: string; autoscaling: boolean }): Promise<ComputeInstance> {
    this.policy.assert(ctx.principal, "hivecompute:write", { kind: "instance", organizationId: ctx.principal.organizationId });
    if (!input.name.trim()) throw PlatformError.validation("name is required");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.name}:${input.kind}:${input.sizeTier}`);
    const built = buildComputeInstance(input, rand);
    const instance: ComputeInstance = { id: newId("cpi"), organizationId: org, name: input.name, kind: input.kind, sizeTier: input.sizeTier, region: input.region, autoscaling: input.autoscaling, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertComputeInstance(instance);
    await this.bus.publish(Subjects.hivecloud.instanceProvisioned, { instanceId: instance.id, kind: input.kind }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return instance;
  }
  listComputeInstances(ctx: RequestContext): Promise<ComputeInstance[]> {
    this.policy.assert(ctx.principal, "hivecompute:read", { kind: "instance", organizationId: ctx.principal.organizationId });
    return this.repo.listComputeInstances(ctx.principal.organizationId);
  }

  // --- HiveNetwork™ ---
  async provisionNetworkTopology(ctx: RequestContext, input: { name: string; cidr: string; region: string; subnetCount: number; peeredWith?: string[] }): Promise<NetworkTopology> {
    this.policy.assert(ctx.principal, "hivenetwork:write", { kind: "network", organizationId: ctx.principal.organizationId });
    if (!input.name.trim()) throw PlatformError.validation("name is required");
    if (!input.cidr.trim()) throw PlatformError.validation("cidr is required");
    const org = ctx.principal.organizationId;
    const peeredWith = input.peeredWith ?? [];
    const rand = seededRandom(`${org}:${input.name}:${input.cidr}:${input.subnetCount}`);
    const built = buildNetworkTopology({ subnetCount: input.subnetCount, peeredWith }, rand);
    const network: NetworkTopology = { id: newId("net"), organizationId: org, name: input.name, cidr: input.cidr, region: input.region, subnetCount: input.subnetCount, peeredWith, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertNetworkTopology(network);
    await this.bus.publish(Subjects.hivecloud.networkProvisioned, { networkId: network.id }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return network;
  }
  listNetworkTopologies(ctx: RequestContext): Promise<NetworkTopology[]> {
    this.policy.assert(ctx.principal, "hivenetwork:read", { kind: "network", organizationId: ctx.principal.organizationId });
    return this.repo.listNetworkTopologies(ctx.principal.organizationId);
  }

  // --- HiveIdentity™ ---
  async createIdentityRole(ctx: RequestContext, input: { name: string; permissions: string[]; mfaRequired: boolean; ssoProvider?: string; memberCount: number }): Promise<IdentityRole> {
    this.policy.assert(ctx.principal, "hiveidentity:write", { kind: "role", organizationId: ctx.principal.organizationId });
    if (!input.name.trim()) throw PlatformError.validation("name is required");
    if (input.permissions.length === 0) throw PlatformError.validation("at least one permission is required");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.name}:${input.permissions.join(",")}:${input.memberCount}`);
    const built = buildIdentityRole(input, rand);
    const role: IdentityRole = { id: newId("rol"), organizationId: org, name: input.name, permissions: input.permissions, mfaRequired: input.mfaRequired, ssoProvider: input.ssoProvider, memberCount: input.memberCount, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertIdentityRole(role);
    await this.bus.publish(Subjects.hivecloud.roleCreated, { roleId: role.id, riskScore: built.riskScore }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return role;
  }
  listIdentityRoles(ctx: RequestContext): Promise<IdentityRole[]> {
    this.policy.assert(ctx.principal, "hiveidentity:read", { kind: "role", organizationId: ctx.principal.organizationId });
    return this.repo.listIdentityRoles(ctx.principal.organizationId);
  }

  // --- HiveMonitor™ ---
  async createMonitor(ctx: RequestContext, input: { serviceName: string; metric: string; thresholdWarning: number; thresholdCritical: number; alertChannels: string[] }): Promise<Monitor> {
    this.policy.assert(ctx.principal, "hivemonitor:write", { kind: "monitor", organizationId: ctx.principal.organizationId });
    if (!input.serviceName.trim()) throw PlatformError.validation("serviceName is required");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.serviceName}:${input.metric}`);
    const built = buildMonitor(rand);
    const monitor: Monitor = { id: newId("mon"), organizationId: org, serviceName: input.serviceName, metric: input.metric, thresholdWarning: input.thresholdWarning, thresholdCritical: input.thresholdCritical, alertChannels: input.alertChannels, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertMonitor(monitor);
    await this.bus.publish(Subjects.hivecloud.monitorCreated, { monitorId: monitor.id, status: built.status }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return monitor;
  }
  listMonitors(ctx: RequestContext): Promise<Monitor[]> {
    this.policy.assert(ctx.principal, "hivemonitor:read", { kind: "monitor", organizationId: ctx.principal.organizationId });
    return this.repo.listMonitors(ctx.principal.organizationId);
  }

  // --- HiveAPI™ ---
  async registerApiEndpoint(ctx: RequestContext, input: { name: string; method: HttpMethod; path: string; authType: ApiAuthType; rateLimitPerMin: number }): Promise<ApiEndpoint> {
    this.policy.assert(ctx.principal, "hiveapi:write", { kind: "endpoint", organizationId: ctx.principal.organizationId });
    if (!input.name.trim()) throw PlatformError.validation("name is required");
    if (!input.path.startsWith("/")) throw PlatformError.validation("path must start with /");
    const org = ctx.principal.organizationId;
    const rand = seededRandom(`${org}:${input.name}:${input.method}:${input.path}`);
    const built = buildApiEndpoint(input, rand);
    const endpoint: ApiEndpoint = { id: newId("api"), organizationId: org, name: input.name, method: input.method, path: input.path, authType: input.authType, rateLimitPerMin: input.rateLimitPerMin, ...built, createdAt: new Date().toISOString() };
    await this.repo.insertApiEndpoint(endpoint);
    await this.bus.publish(Subjects.hivecloud.endpointRegistered, { endpointId: endpoint.id, path: input.path }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return endpoint;
  }
  listApiEndpoints(ctx: RequestContext): Promise<ApiEndpoint[]> {
    this.policy.assert(ctx.principal, "hiveapi:read", { kind: "endpoint", organizationId: ctx.principal.organizationId });
    return this.repo.listApiEndpoints(ctx.principal.organizationId);
  }
}
