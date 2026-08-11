import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("HiveForge — Enterprise AI Cloud Marketplace catalog + provisioning", () => {
  it("browses the full 24-category catalog and can filter by category", async () => {
    const { platform, ctx } = await testPlatform();
    const all = platform.hiveForge.listCatalog(ctx);
    expect(all.length).toBe(24);
    const compute = platform.hiveForge.listCatalog(ctx, "cloud-compute");
    expect(compute.length).toBe(1);
    expect(compute[0].subgroups.some(sg => sg.name === "GPU Types")).toBe(true);
  });

  it("provisions a VPS and a GPU resource with distinct deterministic-shaped specs", async () => {
    const { platform, ctx } = await testPlatform();
    const vps = await platform.hiveForge.provision(ctx, { itemId: "shared-vps" });
    expect(vps.kind).toBe("vps");
    expect(vps.status).toBe("running");
    expect(vps.specs).toHaveProperty("vcpu");
    expect(vps.hourlyRateUsd).toBeGreaterThan(0);

    const gpu = await platform.hiveForge.provision(ctx, { itemId: "nvidia-h100" });
    expect(gpu.kind).toBe("gpu");
    expect(gpu.specs).toMatchObject({ vramGb: 80 });

    const resources = await platform.hiveForge.listResources(ctx);
    expect(resources.map(r => r.id)).toEqual(expect.arrayContaining([vps.id, gpu.id]));
  });

  it("refuses to provision an unknown catalog item id", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.hiveForge.provision(ctx, { itemId: "does-not-exist-xyz" })).rejects.toThrow();
  });

  it("every one of the 24 catalog categories has at least one provisionable item, and provisioning one from each of a sample set succeeds", async () => {
    const { platform, ctx } = await testPlatform();
    const categories = platform.hiveForge.listCatalog(ctx);
    expect(categories.length).toBe(24);
    for (const c of categories) {
      const provisionableItems = c.subgroups.flatMap(sg => sg.items).filter(i => i.provisionable);
      expect(provisionableItems.length).toBeGreaterThan(0);
    }
    const sample = ["cerebro-studio", "foundation-models", "customer-support", "chat-api", "docker-registry", "metrics", "iam", "ai-policies", "etl", "knowledge-graph", "workflow-builder", "browser-ide", "hivepulse", "subscription-management"];
    for (const itemId of sample) {
      const resource = await platform.hiveForge.provision(ctx, { itemId });
      expect(resource.status).toBe("running");
      expect(resource.category).toBeDefined();
    }
  });

  it("filters resources by category", async () => {
    const { platform, ctx } = await testPlatform();
    await platform.hiveForge.provision(ctx, { itemId: "chat-api" });
    await platform.hiveForge.provision(ctx, { itemId: "shared-vps" });
    const apiOnly = await platform.hiveForge.listResources(ctx, { category: "apis-developer-platform" });
    expect(apiOnly.length).toBe(1);
    expect(apiOnly[0]!.itemId).toBe("chat-api");
  });

  it("deprovisions a resource and it no longer accrues cost", async () => {
    const { platform, ctx } = await testPlatform();
    const resource = await platform.hiveForge.provision(ctx, { itemId: "redis" });
    const deprovisioned = await platform.hiveForge.deprovision(ctx, resource.id);
    expect(deprovisioned.status).toBe("deprovisioned");
    const cost = await platform.hiveForge.costExplorer(ctx);
    expect(cost.resourceCount).toBe(0);
  });

  it("wizard config (sizeTier/replicas/options) meaningfully scales specs and hourly rate", async () => {
    const { platform, ctx } = await testPlatform();
    const small = await platform.hiveForge.provision(ctx, { itemId: "enterprise-vps", sizeTier: "small" });
    const xlarge = await platform.hiveForge.provision(ctx, { itemId: "premium-vps", sizeTier: "xlarge" });
    expect((xlarge.specs as { vcpu: number }).vcpu).toBeGreaterThan((small.specs as { vcpu: number }).vcpu);
    expect(xlarge.hourlyRateUsd).toBeGreaterThan(small.hourlyRateUsd);

    const withReplicas = await platform.hiveForge.provision(ctx, { itemId: "postgresql", replicas: 7 });
    expect((withReplicas.specs as { replicas: number }).replicas).toBe(7);

    const withOptions = await platform.hiveForge.provision(ctx, { itemId: "object-storage", options: ["multi-az"] });
    expect((withOptions.specs as { redundancy: string }).redundancy).toBe("multi-az");
    expect(withOptions.options).toEqual(["multi-az"]);
  });

  it("installs a marketplace item and lists installations", async () => {
    const { platform, ctx } = await testPlatform();
    const install = await platform.hiveForge.installMarketplaceItem(ctx, "ai-agents");
    const installations = await platform.hiveForge.listInstallations(ctx);
    expect(installations.map(i => i.id)).toContain(install.id);
  });

  it("computes cost explorer totals across kinds and generates an invoice", async () => {
    const { platform, ctx } = await testPlatform();
    await platform.hiveForge.provision(ctx, { itemId: "shared-vps" });
    await platform.hiveForge.provision(ctx, { itemId: "postgresql" });
    const cost = await platform.hiveForge.costExplorer(ctx);
    expect(cost.resourceCount).toBe(2);
    expect(cost.totalUsd).toBeGreaterThanOrEqual(0);
    expect(Object.keys(cost.byKind).sort()).toEqual(["database", "vps"]);

    const invoice = await platform.hiveForge.generateInvoice(ctx);
    expect(invoice.lineItems.length).toBe(2);
    const invoices = await platform.hiveForge.listInvoices(ctx);
    expect(invoices.map(i => i.id)).toContain(invoice.id);
  });
});
