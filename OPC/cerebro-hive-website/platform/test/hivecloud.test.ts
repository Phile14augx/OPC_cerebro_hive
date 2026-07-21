import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("Hive Infrastructure Suite — HiveCloud/HiveStorage/HiveCompute/HiveNetwork/HiveIdentity/HiveMonitor/HiveAPI", () => {
  describe("HiveCloud™", () => {
    it("provisions a cloud account with cost and compliance scoring", async () => {
      const { platform, ctx } = await testPlatform();
      const account = await platform.hiveCloud.provisionCloudAccount(ctx, { accountName: "acme-prod", provider: "aws", region: "us-east-1", environment: "production" });
      expect(account.status).toBe("active");
      expect(account.monthlyCostUsd).toBeGreaterThan(0);
      expect(account.complianceScore).toBeGreaterThanOrEqual(0);
      expect(account.complianceScore).toBeLessThanOrEqual(100);
      expect(account.landingZoneComponents.length).toBeGreaterThan(0);
    });

    it("scores production accounts with higher baseline compliance than development", async () => {
      const { platform, ctx } = await testPlatform();
      const prod = await platform.hiveCloud.provisionCloudAccount(ctx, { accountName: "prod-a", provider: "aws", region: "us-east-1", environment: "production" });
      const dev = await platform.hiveCloud.provisionCloudAccount(ctx, { accountName: "dev-a", provider: "aws", region: "us-east-1", environment: "development" });
      expect(prod.complianceScore).toBeGreaterThan(dev.complianceScore);
    });

    it("rejects an empty account name", async () => {
      const { platform, ctx } = await testPlatform();
      await expect(platform.hiveCloud.provisionCloudAccount(ctx, { accountName: "  ", provider: "aws", region: "us-east-1", environment: "production" })).rejects.toThrow();
    });

    it("scopes accounts per organization", async () => {
      const { platform, ctx } = await testPlatform();
      const { ctx: otherCtx } = await testPlatform();
      await platform.hiveCloud.provisionCloudAccount(ctx, { accountName: "scoped", provider: "gcp", region: "us-central1", environment: "staging" });
      const otherAccounts = await platform.hiveCloud.listCloudAccounts(otherCtx);
      expect(otherAccounts.length).toBe(0);
    });
  });

  describe("HiveStorage™", () => {
    it("provisions a storage bucket with tier-appropriate cost and lifecycle policy", async () => {
      const { platform, ctx } = await testPlatform();
      const hot = await platform.hiveCloud.provisionStorageBucket(ctx, { name: "hot-bucket", provider: "aws", tier: "hot", sizeGb: 1000 });
      const archive = await platform.hiveCloud.provisionStorageBucket(ctx, { name: "archive-bucket", provider: "aws", tier: "archive", sizeGb: 1000 });
      expect(hot.monthlyCostUsd).toBeGreaterThan(archive.monthlyCostUsd);
      expect(hot.replicationFactor).toBeGreaterThanOrEqual(archive.replicationFactor);
      expect(hot.lifecyclePolicy).toBeTruthy();
      expect(hot.encrypted).toBe(true);
    });

    it("rejects a non-positive size", async () => {
      const { platform, ctx } = await testPlatform();
      await expect(platform.hiveCloud.provisionStorageBucket(ctx, { name: "bad", provider: "aws", tier: "hot", sizeGb: 0 })).rejects.toThrow();
    });
  });

  describe("HiveCompute™", () => {
    it("provisions a compute instance with size-appropriate vcpu/memory", async () => {
      const { platform, ctx } = await testPlatform();
      const small = await platform.hiveCloud.provisionComputeInstance(ctx, { name: "small-vm", kind: "vm", sizeTier: "small", region: "us-east-1", autoscaling: false });
      const xlarge = await platform.hiveCloud.provisionComputeInstance(ctx, { name: "xlarge-vm", kind: "vm", sizeTier: "xlarge", region: "us-east-1", autoscaling: false });
      expect(xlarge.vcpu).toBeGreaterThan(small.vcpu);
      expect(xlarge.memoryGb).toBeGreaterThan(small.memoryGb);
      expect(xlarge.monthlyCostUsd).toBeGreaterThan(small.monthlyCostUsd);
      expect(small.utilizationPct).toBeGreaterThanOrEqual(0);
      expect(small.utilizationPct).toBeLessThanOrEqual(100);
    });
  });

  describe("HiveNetwork™", () => {
    it("provisions a network topology and increases latency estimate with more peering", async () => {
      const { platform, ctx } = await testPlatform();
      const isolated = await platform.hiveCloud.provisionNetworkTopology(ctx, { name: "isolated-net", cidr: "10.0.0.0/16", region: "us-east-1", subnetCount: 4 });
      const peered = await platform.hiveCloud.provisionNetworkTopology(ctx, { name: "peered-net", cidr: "10.1.0.0/16", region: "us-east-1", subnetCount: 4, peeredWith: ["vpc-a", "vpc-b", "vpc-c"] });
      expect(peered.latencyMsEstimate).toBeGreaterThan(isolated.latencyMsEstimate);
      expect(isolated.monthlyCostUsd).toBeGreaterThan(0);
    });

    it("rejects a missing cidr", async () => {
      const { platform, ctx } = await testPlatform();
      await expect(platform.hiveCloud.provisionNetworkTopology(ctx, { name: "bad-net", cidr: "", region: "us-east-1", subnetCount: 2 })).rejects.toThrow();
    });
  });

  describe("HiveIdentity™", () => {
    it("scores a role with wildcard permissions and no MFA as higher risk", async () => {
      const { platform, ctx } = await testPlatform();
      const risky = await platform.hiveCloud.createIdentityRole(ctx, { name: "risky-admin", permissions: ["admin:*"], mfaRequired: false, memberCount: 30 });
      const safe = await platform.hiveCloud.createIdentityRole(ctx, { name: "safe-reader", permissions: ["read:reports"], mfaRequired: true, ssoProvider: "Okta", memberCount: 3 });
      expect(risky.riskScore).toBeGreaterThan(safe.riskScore);
      expect(risky.riskFactors.length).toBeGreaterThan(0);
    });

    it("rejects a role with no permissions", async () => {
      const { platform, ctx } = await testPlatform();
      await expect(platform.hiveCloud.createIdentityRole(ctx, { name: "empty-role", permissions: [], mfaRequired: true, memberCount: 1 })).rejects.toThrow();
    });
  });

  describe("HiveMonitor™", () => {
    it("creates a monitor with a deterministic status derived from simulated uptime", async () => {
      const { platform, ctx } = await testPlatform();
      const monitor = await platform.hiveCloud.createMonitor(ctx, { serviceName: "checkout-api", metric: "latency_p99", thresholdWarning: 200, thresholdCritical: 500, alertChannels: ["#alerts"] });
      expect(["healthy", "degraded", "critical"]).toContain(monitor.status);
      expect(monitor.uptimePct).toBeGreaterThanOrEqual(95);
      expect(monitor.uptimePct).toBeLessThanOrEqual(100);
      expect(monitor.incidentsLast30d).toBeGreaterThanOrEqual(0);
    });

    it("is deterministic — same input produces the same status and uptime", async () => {
      const { platform, ctx } = await testPlatform();
      const a = await platform.hiveCloud.createMonitor(ctx, { serviceName: "svc-a", metric: "error_rate", thresholdWarning: 1, thresholdCritical: 5, alertChannels: [] });
      const b = await platform.hiveCloud.createMonitor(ctx, { serviceName: "svc-a", metric: "error_rate", thresholdWarning: 1, thresholdCritical: 5, alertChannels: [] });
      expect(a.uptimePct).toBe(b.uptimePct);
      expect(a.status).toBe(b.status);
    });
  });

  describe("HiveAPI™", () => {
    it("registers an API endpoint with auth-appropriate latency", async () => {
      const { platform, ctx } = await testPlatform();
      const endpoint = await platform.hiveCloud.registerApiEndpoint(ctx, { name: "get-orders", method: "GET", path: "/v1/orders", authType: "mtls", rateLimitPerMin: 600 });
      expect(endpoint.avgLatencyMs).toBeGreaterThan(0);
      expect(endpoint.monthlyCalls).toBeGreaterThan(0);
      expect(endpoint.errorRatePct).toBeGreaterThanOrEqual(0);
    });

    it("rejects a path that doesn't start with /", async () => {
      const { platform, ctx } = await testPlatform();
      await expect(platform.hiveCloud.registerApiEndpoint(ctx, { name: "bad-path", method: "GET", path: "orders", authType: "api-key", rateLimitPerMin: 100 })).rejects.toThrow();
    });

    it("scopes endpoints per organization", async () => {
      const { platform, ctx } = await testPlatform();
      const { ctx: otherCtx } = await testPlatform();
      await platform.hiveCloud.registerApiEndpoint(ctx, { name: "scoped-endpoint", method: "POST", path: "/v1/scoped", authType: "oauth2", rateLimitPerMin: 300 });
      const otherEndpoints = await platform.hiveCloud.listApiEndpoints(otherCtx);
      expect(otherEndpoints.length).toBe(0);
    });
  });
});
