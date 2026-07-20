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

  it("refuses to provision a non-provisionable catalog item", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.hiveForge.provision(ctx, { itemId: "cerebro-studio" })).rejects.toThrow();
  });

  it("deprovisions a resource and it no longer accrues cost", async () => {
    const { platform, ctx } = await testPlatform();
    const resource = await platform.hiveForge.provision(ctx, { itemId: "redis" });
    const deprovisioned = await platform.hiveForge.deprovision(ctx, resource.id);
    expect(deprovisioned.status).toBe("deprovisioned");
    const cost = await platform.hiveForge.costExplorer(ctx);
    expect(cost.resourceCount).toBe(0);
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
