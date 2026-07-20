import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";
import { InMemoryEventBus } from "../src/kernel/events/memory-bus.js";

describe("core consulting capabilities", () => {
  it("exposes all ten practice areas with deliverables and OS mappings", async () => {
    const { platform } = await testPlatform();
    const catalog = platform.consulting.catalog();
    expect(catalog.length).toBe(10);
    for (const c of catalog) {
      expect(c.deliverables.length).toBeGreaterThan(0);
      expect(c.poweredBy.length).toBeGreaterThan(0);
    }
    expect(catalog.map(c => c.id)).toContain("ai-governance-trust");
  });

  it("creates an engagement that compiles to an approval-gated Flow workflow", async () => {
    const { platform, ctx } = await testPlatform();
    const engagement = await platform.consulting.createEngagement(ctx, { capabilityId: "cerebroai-strategy", client: "Acme Health" });
    expect(engagement.phase).toBe("assess");
    expect(engagement.workflowId).toBeTruthy();
    const workflows = await platform.flow.list(ctx);
    const wf = workflows.find(w => w.id === engagement.workflowId)!;
    expect(wf.definition.nodes.some(n => n.type === "approval")).toBe(true);
    const bus = platform.bus as InMemoryEventBus;
    expect(bus.published.some(e => e.subject === "consulting.engagement.created")).toBe(true);
  });

  it("runs a readiness assessment: scoring, maturity level, gaps, searchable report", async () => {
    const { platform, ctx } = await testPlatform();
    const assessment = await platform.consulting.runAssessment(ctx, {
      client: "Acme Health",
      answers: { strategy: [3, 3, 2], data: [1, 1, 0], platform: [2, 1], talent: [2, 2], governance: [1, 0, 1] },
    });
    expect(assessment.overall).toBeGreaterThan(0);
    expect(assessment.overall).toBeLessThan(1);
    expect(["Nascent", "Emerging", "Operational", "Scaled", "Transformative"]).toContain(assessment.level);
    expect(assessment.gaps.some(g => g.dimension === "data")).toBe(true);
    expect(assessment.gaps[0]!.recommendation.length).toBeGreaterThan(10);
    // report is institutional knowledge now
    const search = await platform.knowledge.search(ctx, "readiness assessment Acme maturity");
    expect(search.hits.some(h => h.documentTitle.includes("Acme Health"))).toBe(true);
  });

  it("generates a gap-driven roadmap with simulator-projected maturity", async () => {
    const { platform, ctx } = await testPlatform();
    const engagement = await platform.consulting.createEngagement(ctx, { capabilityId: "enterprise-intelligence-modernization", client: "Globex" });
    await platform.consulting.runAssessment(ctx, { client: "Globex", engagementId: engagement.id, answers: { data: [1, 1], platform: [2], governance: [1] } });
    const roadmap = await platform.consulting.generateRoadmap(ctx, engagement.id, { horizonQuarters: 4 });
    expect(roadmap.initiatives.length).toBe(4);
    expect(roadmap.projectedMaturity.length).toBeGreaterThan(0);
    expect(roadmap.initiatives[0]!.kpi).toBeTruthy();
    const advanced = await platform.consulting.advancePhase(ctx, engagement.id, "assessment done");
    expect(advanced.phase).toBe("strategy");
  });
});
