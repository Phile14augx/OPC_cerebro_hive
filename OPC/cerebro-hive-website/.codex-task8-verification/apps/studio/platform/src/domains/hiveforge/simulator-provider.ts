import { seededRandom } from "../simulator/simulator.js";
import { SIZE_TIER_MULTIPLIER, type ResourceKind, type SizeTier } from "./hiveforge.js";
import type {
  HiveForgeProvider, ProviderIdentity, ProviderCapabilities, ProviderRegion,
  ProvisionSpec, ProvisionResult, CostEstimate,
} from "./provider.js";

/**
 * Phase 2 of docs/architecture/HIVEFORGE-CONSOLIDATION.md: the existing simulator's
 * spec-generation and region-selection logic, moved out of hiveforge.ts unchanged and
 * exposed behind HiveForgeProvider. Given the same {id, itemId} seed, produces byte-identical
 * output to the pre-consolidation inline code — this is a structural move, not a rewrite.
 */

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];

interface SpecsConfig { sizeTier: SizeTier; replicas?: number; options: string[] }

function specsFor(kind: ResourceKind, itemId: string, rand: () => number, config: SpecsConfig): Record<string, unknown> {
  const mult = SIZE_TIER_MULTIPLIER[config.sizeTier];
  const opts = config.options;
  switch (kind) {
    case "vps": return { vcpu: Math.max(1, Math.round(2 * mult)), ramGb: Math.max(1, Math.round(4 * mult)), diskGb: Math.max(20, Math.round(80 * mult)), options: opts };
    case "gpu": return { gpuCount: Math.max(1, Math.round(2 * mult)), vramGb: itemId.includes("h100") || itemId.includes("h200") ? 80 : itemId.includes("a100") ? 40 : 24, interconnect: rand() > 0.5 ? "NVLink" : "PCIe", options: opts };
    case "kubernetes": return { nodes: config.replicas ?? Math.max(1, Math.round(6 * mult)), version: "1.31", nodePoolType: opts.includes("gpu-pool") ? "gpu" : "cpu", options: opts };
    case "container": return { registry: "registry.hiveforge.dev", image: `hiveforge/${itemId}`, replicas: config.replicas ?? Math.max(1, Math.round(2 * mult)), options: opts };
    case "serverless": return { runtime: "node20", memoryMb: Math.max(128, Math.round(256 * mult)), coldStartMs: 40 + Math.floor(rand() * 200), options: opts };
    case "database": return { storageGb: Math.max(10, Math.round(100 * mult)), replicas: config.replicas ?? (mult >= 2 ? 2 : 1), version: "latest", options: opts };
    case "storage": return { capacityGb: Math.max(50, Math.round(1000 * mult)), redundancy: opts.includes("multi-az") || mult >= 2 ? "multi-az" : "single-az", options: opts };
    case "network": return { bandwidthGbps: Math.max(1, Math.round(5 * mult)), options: opts };
    case "domain": return { autoRenew: !opts.includes("no-auto-renew"), dnssec: opts.includes("dnssec") || rand() > 0.5, options: opts };
    case "deployment": return { framework: "auto-detect", buildMinutes: Math.max(1, Math.round(4 * mult)), options: opts };
    case "ai-tool": return { seatLicenses: Math.max(1, Math.round(10 * mult)), workspaces: Math.max(1, Math.round(2 * mult)), computeCreditsPerMonth: Math.round(2000 * mult), options: opts };
    case "ai-model": return {
      parameters: mult <= 0.5 ? "7B" : mult === 1 ? "34B" : mult === 2 ? "70B" : "405B",
      contextWindowTokens: mult <= 0.5 ? 8000 : mult === 1 ? 32000 : mult === 2 ? 128000 : 200000,
      modality: itemId.includes("vision") ? "vision" : itemId.includes("audio") || itemId.includes("speech") ? "audio" : itemId.includes("embed") ? "embedding" : "text",
      options: opts,
    };
    case "ai-agent": return { maxStepsPerRun: Math.max(5, Math.round(20 * mult)), toolsGranted: Math.max(1, Math.round(4 * mult)), memoryEnabled: !opts.includes("no-memory"), options: opts };
    case "api-service": return { rateLimitRpm: Math.max(60, Math.round(600 * mult)), authMethod: opts.includes("oauth2") ? "oauth2" : "api-key", regionsServed: Math.max(1, Math.round(2 * mult)), options: opts };
    case "devops-tool": return { pipelinesActive: Math.max(1, Math.round(5 * mult)), buildMinutesIncluded: Math.round(2000 * mult), concurrency: Math.max(1, Math.round(2 * mult)), options: opts };
    case "observability-tool": return { retentionDays: mult <= 0.5 ? 7 : mult === 1 ? 14 : mult === 2 ? 30 : 90, ingestGbPerDay: Math.round(50 * mult), alertRules: Math.round(10 * mult), options: opts };
    case "security-tool": return { usersProtected: Math.max(10, Math.round(100 * mult)), mfaEnforced: !opts.includes("no-mfa"), threatFeedsActive: Math.max(1, Math.round(2 * mult)), options: opts };
    case "governance-tool": return { policiesEnforced: Math.max(1, Math.round(6 * mult)), approvalSlaHours: mult <= 0.5 ? 24 : mult === 1 ? 12 : mult === 2 ? 4 : 1, auditRetentionDays: 365, options: opts };
    case "data-tool": return { pipelinesActive: Math.max(1, Math.round(4 * mult)), throughputMbps: Math.round(100 * mult), connectorsConfigured: Math.max(1, Math.round(4 * mult)), options: opts };
    case "knowledge-tool": return { documentsIndexed: Math.round(50_000 * mult), embeddingDims: mult <= 0.5 ? 384 : mult === 1 ? 768 : mult === 2 ? 1536 : 3072, refreshIntervalMin: mult <= 0.5 ? 1440 : mult === 1 ? 60 : mult === 2 ? 15 : 5, options: opts };
    case "automation-tool": return { workflowsActive: Math.max(1, Math.round(8 * mult)), runsPerDay: Math.round(500 * mult), avgRunSeconds: 1 + Math.floor(rand() * 60), options: opts };
    case "developer-tool": return { seats: Math.max(1, Math.round(10 * mult)), buildMinutesIncluded: Math.round(1000 * mult), options: opts };
    case "enterprise-app": return { activeUsers: Math.max(10, Math.round(500 * mult)), modulesEnabled: Math.max(1, Math.round(3 * mult)), options: opts };
    case "marketplace-item": return { installScope: opts.includes("workspace-scope") ? "workspace" : "organization", version: `${1 + Math.floor(rand() * 4)}.${Math.floor(rand() * 10)}.${Math.floor(rand() * 10)}`, options: opts };
    case "billing-tool": return { billingCycle: opts.includes("usage-based") ? "usage-based" : "monthly", currency: "USD", options: opts };
  }
}

export class SimulatorProvider implements HiveForgeProvider {
  readonly identity: ProviderIdentity = { id: "hiveforge-simulator", vendor: "HiveForge", version: "1.0.0" };
  readonly capabilities: ProviderCapabilities = {}; // no supportedCategories restriction — simulates every category
  readonly regions: ProviderRegion[] = REGIONS.map(id => ({ id, name: id, availabilityZones: [`${id}a`, `${id}b`], latencyTier: "low" }));

  async estimateCost(spec: ProvisionSpec): Promise<CostEstimate> {
    const hourly = Number(((spec.baseHourlyRateUsd ?? 0.05) * SIZE_TIER_MULTIPLIER[spec.sizeTier]).toFixed(4));
    return { currency: "USD", hourlyAmount: hourly, monthlyAmount: Number((hourly * 730).toFixed(2)) };
  }

  async provision(spec: ProvisionSpec): Promise<ProvisionResult> {
    const rand = seededRandom(`${spec.itemId}:${spec.id}`);
    const region = spec.region ?? REGIONS[Math.floor(rand() * REGIONS.length)] ?? "us-east-1";
    const mult = SIZE_TIER_MULTIPLIER[spec.sizeTier];
    const specs = specsFor(spec.kind, spec.itemId, rand, { sizeTier: spec.sizeTier, replicas: spec.replicas, options: spec.options });
    const endpoint = `${spec.kind}-${spec.id.slice(-8)}.${region}.hiveforge.dev`;
    const hourlyRateUsd = Number(((spec.baseHourlyRateUsd ?? 0.05) * mult).toFixed(4));
    return { region, specs, endpoint, hourlyRateUsd, initialState: "Running" };
  }

  /** No-op: the simulator holds no external resource to release. Real providers do actual teardown here. */
  async deprovision(): Promise<void> {}

  async getStatus(): Promise<{ state: "Running"; health: "Healthy" }> {
    return { state: "Running", health: "Healthy" };
  }
}
