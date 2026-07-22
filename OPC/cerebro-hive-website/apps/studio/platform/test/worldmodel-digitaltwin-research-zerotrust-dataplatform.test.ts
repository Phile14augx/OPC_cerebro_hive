import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("Enterprise World Model — entity taxonomy + graph", () => {
  it("projects the extended enterprise entity kinds and links them into a graph", async () => {
    const { platform, ctx } = await testPlatform();
    const org = ctx.principal.organizationId;
    const dept = await platform.world.project(org, "department", "dept-eng", "Engineering", {});
    const emp = await platform.world.project(org, "user", "emp-1", "Jane Doe", {});
    const risk = await platform.world.project(org, "risk", "risk-1", "Key vendor concentration", {});
    const edge = platform.world.link(org, emp.id, dept.id, "belongs_to");
    expect(edge.relationship).toBe("belongs_to");
    const neighborhood = platform.world.neighborhood(org, emp.id);
    expect(neighborhood.map(e => e.id)).toContain(edge.id);
    const graph = platform.world.graph(org);
    expect(graph.edges.length).toBeGreaterThanOrEqual(1);
    expect(risk.kind).toBe("risk");
  });
});

describe("Cerebro Digital Twin — named enterprise scenarios", () => {
  it("simulates supply chain disruption deterministically and writes back to the World Model", async () => {
    const { platform, ctx } = await testPlatform();
    const r1 = await platform.digitalTwin.supplyChain(ctx, { suppliers: 20, disruptionProbability: 0.3, avgLeadTimeDays: 14, seed: "test" });
    const r2 = await platform.digitalTwin.supplyChain(ctx, { suppliers: 20, disruptionProbability: 0.3, avgLeadTimeDays: 14, seed: "test" });
    expect(r1.result).toEqual(r2.result);
    const snapshot = await platform.world.snapshot(ctx.principal.organizationId);
    expect(snapshot.process).toBeGreaterThanOrEqual(1);
  });

  it("simulates cyber attack risk with criticality-weighted breach probability", async () => {
    const { platform, ctx } = await testPlatform();
    const low = await platform.digitalTwin.cyberAttack(ctx, { attackVector: "phishing", assetCriticality: "low", mttdHours: 4, mttrHours: 8, seed: "x" });
    const critical = await platform.digitalTwin.cyberAttack(ctx, { attackVector: "phishing", assetCriticality: "critical", mttdHours: 4, mttrHours: 8, seed: "x" });
    expect((critical.result.breachProbability as number)).toBeGreaterThan(low.result.breachProbability as number);
  });

  it("runs financial forecast and sales pipeline scenarios and lists all runs", async () => {
    const { platform, ctx } = await testPlatform();
    await platform.digitalTwin.financialForecast(ctx, { revenueUsd: 100_000, expensesUsd: 80_000, monthlyGrowthPct: 5, horizonMonths: 6 });
    await platform.digitalTwin.salesPipeline(ctx, { stages: [{ name: "lead", count: 100, conversion: 0.3 }, { name: "qualified", count: 0, conversion: 0.4 }], avgDealSizeUsd: 5000 });
    const all = await platform.digitalTwin.list(ctx);
    expect(all.length).toBeGreaterThanOrEqual(2);
    const onlyFinance = await platform.digitalTwin.list(ctx, "financial_forecast");
    expect(onlyFinance.every(r => r.kind === "financial_forecast")).toBe(true);
  });
});

describe("Cerebro Research — prompt/agent versioning, A/B testing, leaderboards", () => {
  it("versions prompts and agents incrementally per name", async () => {
    const { platform, ctx } = await testPlatform();
    const v1 = await platform.research.registerPrompt(ctx, { name: "grounded-qa", template: "Answer from: {{sources}}" });
    const v2 = await platform.research.registerPrompt(ctx, { name: "grounded-qa", template: "Answer strictly from: {{sources}}" });
    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);
    const versions = await platform.research.listPrompts(ctx, "grounded-qa");
    expect(versions.length).toBe(2);

    const agentV1 = await platform.research.registerAgent(ctx, { name: "researcher-agent", config: { model: "gpt-4o-mini" } });
    expect(agentV1.version).toBe(1);
  });

  it("runs an A/B test across providers via Cerebro Eval and records experiment provenance", async () => {
    const { platform, ctx } = await testPlatform();
    const { ranking, experiment } = await platform.research.runAbTest(ctx, {
      name: "provider-shootout",
      cases: [{ id: "c1", input: "What is 2+2?" }],
      providers: ["mock"],
    });
    expect(ranking.length).toBe(1);
    expect(experiment.name).toBe("provider-shootout");
    const experiments = await platform.research.listExperiments(ctx);
    expect(experiments.map(e => e.id)).toContain(experiment.id);
  });
});

describe("Cerebro Zero Trust — tool grants, MCP governance, capability tokens", () => {
  it("denies tool use by default and allows only after an explicit grant", async () => {
    const { platform, ctx } = await testPlatform();
    const before = await platform.zeroTrust.canUseTool(ctx, "agent-1", "deploy_kubernetes");
    expect(before).toBe(false);
    await platform.zeroTrust.grantTool(ctx, { agentId: "agent-1", tool: "deploy_kubernetes", allow: true });
    const after = await platform.zeroTrust.canUseTool(ctx, "agent-1", "deploy_kubernetes");
    expect(after).toBe(true);
    await platform.zeroTrust.grantTool(ctx, { agentId: "agent-1", tool: "deploy_kubernetes", allow: false });
    const revoked = await platform.zeroTrust.canUseTool(ctx, "agent-1", "deploy_kubernetes");
    expect(revoked).toBe(false);
  });

  it("auto-approves low-risk MCP servers and requires review for higher risk tiers", async () => {
    const { platform, ctx } = await testPlatform();
    const low = await platform.zeroTrust.registerMcpServer(ctx, { name: "internal-tools", url: "https://mcp.internal", riskTier: "low", capabilities: ["read"] });
    expect(low.status).toBe("approved");
    const high = await platform.zeroTrust.registerMcpServer(ctx, { name: "external-scraper", url: "https://mcp.external", riskTier: "high", capabilities: ["write", "execute"] });
    expect(high.status).toBe("pending");
    const reviewed = await platform.zeroTrust.reviewMcpServer(ctx, high.id, "approved");
    expect(reviewed.status).toBe("approved");
    expect(reviewed.reviewedBy).toBeTruthy();
  });

  it("issues a scoped, short-lived capability token and validates it correctly", async () => {
    const { platform, ctx } = await testPlatform();
    const token = await platform.zeroTrust.issueCapabilityToken(ctx, { agentId: "agent-2", tools: ["calculator"], ttlMinutes: 5 });
    const validForScoped = await platform.zeroTrust.validateCapabilityToken(ctx, token.id, "calculator");
    expect(validForScoped.valid).toBe(true);
    const invalidForOther = await platform.zeroTrust.validateCapabilityToken(ctx, token.id, "deploy_kubernetes");
    expect(invalidForOther.valid).toBe(false);
  });
});

describe("Cerebro Data Platform — asset catalog, lineage, semantic layer", () => {
  it("registers assets, links lineage, and traverses upstream/downstream", async () => {
    const { platform, ctx } = await testPlatform();
    const raw = await platform.dataPlatform.registerAsset(ctx, { name: "raw_events", kind: "stream", owner: "data-eng", freshnessSlaMinutes: 15 });
    const curated = await platform.dataPlatform.registerAsset(ctx, { name: "curated_events", kind: "table", owner: "data-eng", freshnessSlaMinutes: 60 });
    await platform.dataPlatform.link(ctx, { from: raw.id, to: curated.id, transform: "dedupe+enrich" });
    const lineage = await platform.dataPlatform.lineage(ctx, curated.id);
    expect(lineage.upstream.map(a => a.id)).toContain(raw.id);
  });

  it("flags a freshness SLA breach", async () => {
    const { platform, ctx } = await testPlatform();
    const asset = await platform.dataPlatform.registerAsset(ctx, { name: "stale_table", kind: "table", owner: "data-eng", freshnessSlaMinutes: 0 });
    await new Promise(r => setTimeout(r, 5));
    const check = await platform.dataPlatform.checkFreshness(ctx, asset.id);
    expect(check.withinSla).toBe(false);
  });

  it("defines a semantic-layer metric with a single definition of truth", async () => {
    const { platform, ctx } = await testPlatform();
    const metric = await platform.dataPlatform.defineMetric(ctx, { name: "mrr", definition: "Sum of active subscription value, normalized to 30-day periods", unit: "usd", owner: "finance" });
    const metrics = await platform.dataPlatform.listMetrics(ctx);
    expect(metrics.map(m => m.id)).toContain(metric.id);
  });
});
