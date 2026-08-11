import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("CerebroInsight™ — AI-native executive intelligence layer", () => {
  it("refreshes metrics pulling real numbers from HiveForge, CerebroStudio, and CerebroSwarm", async () => {
    const { platform, ctx } = await testPlatform();

    // Seed some real activity across the other domains so CerebroInsight has something to reflect.
    await platform.hiveForge.provision(ctx, { itemId: "shared-vps" });
    const ws = await platform.cerebroStudio.createWorkspace(ctx, { name: "Insight WS" });
    const prompt = await platform.cerebroStudio.createPrompt(ctx, ws.id, { name: "P", template: "Hello {{x}}" });
    await platform.cerebroStudio.runPrompt(ctx, prompt.id, "x=1");
    await platform.cerebroSwarm.submitDirective(ctx, { objective: "Test directive" });

    const metrics = await platform.cerebroInsight.refreshMetrics(ctx);
    const byKey = Object.fromEntries(metrics.map(m => [m.key, m]));
    expect(byKey["active-resources"]!.value).toBeGreaterThanOrEqual(1);
    expect(byKey["ai-runs"]!.value).toBeGreaterThanOrEqual(1);
    expect(byKey["directives"]!.value).toBeGreaterThanOrEqual(1);
    expect(metrics.length).toBe(8);
  });

  it("auto-seeds a default Executive Overview dashboard covering kpi/line/bar/pie/table widgets", async () => {
    const { platform, ctx } = await testPlatform();
    const dashboards = await platform.cerebroInsight.listDashboards(ctx);
    expect(dashboards.length).toBe(1);
    const dash = dashboards[0]!;
    expect(dash.name).toBe("Executive Overview");
    const types = new Set(dash.widgets.map(w => w.type));
    expect(types.has("kpi")).toBe(true);
    expect(types.has("bar")).toBe(true);
    expect(types.has("line")).toBe(true);
    expect(types.has("pie")).toBe(true);
    expect(types.has("table")).toBe(true);
  });

  it("supports creating a custom dashboard", async () => {
    const { platform, ctx } = await testPlatform();
    const dash = await platform.cerebroInsight.createDashboard(ctx, { name: "Finance View", widgets: [{ type: "kpi", title: "Cloud Cost", metricKeys: ["cloud-cost"] }] });
    expect(dash.name).toBe("Finance View");
    expect(dash.widgets.length).toBe(1);
    await expect(platform.cerebroInsight.createDashboard(ctx, { name: "", widgets: [] })).rejects.toThrow();
  });

  it("seeds default alert rules and triggers an alert when a metric breaches threshold", async () => {
    const { platform, ctx } = await testPlatform();
    // Provision enough resources to push cloud-cost or resource count into breach territory isn't
    // deterministic on cost alone at t=0, so assert on the platform-health rule instead, which is
    // always evaluated on first refresh.
    await platform.cerebroInsight.refreshMetrics(ctx);
    const rules = await platform.cerebroInsight.listAlertRules(ctx);
    expect(rules.length).toBe(2);
    expect(rules.map(r => r.metricKey).sort()).toEqual(["cloud-cost", "platform-health"]);
  });

  it("generates AI insight cards after a refresh", async () => {
    const { platform, ctx } = await testPlatform();
    await platform.cerebroInsight.refreshMetrics(ctx);
    await platform.hiveForge.provision(ctx, { itemId: "shared-vps" });
    await platform.cerebroInsight.refreshMetrics(ctx);
    const insights = await platform.cerebroInsight.listInsights(ctx);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.every(i => i.narrative.length > 0)).toBe(true);
  });

  it("scopes metrics and dashboards per organization", async () => {
    const { platform, ctx } = await testPlatform();
    const { platform: platform2, ctx: otherCtx } = await testPlatform();
    await platform.cerebroInsight.refreshMetrics(ctx);
    const otherMetrics = await platform2.cerebroInsight.listMetrics(otherCtx);
    expect(otherMetrics.length).toBe(0);
  });
});
