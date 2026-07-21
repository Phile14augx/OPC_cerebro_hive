import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("CerebroForge™ — AI Innovation Factory Phase 1 (Discovery + Scoring + Product Opportunity/Spec Generator)", () => {
  it("ingests a research signal and scores it across nine dimensions", async () => {
    const { platform, ctx } = await testPlatform();
    const signal = await platform.cerebroForge.ingestSignal(ctx, {
      title: "A New Multimodal Reasoning Architecture",
      sourceType: "paper",
      category: "multimodal",
      summary: "We present a novel multimodal reasoning architecture that achieves state-of-the-art benchmark results in production settings.",
    });
    expect(signal.category).toBe("multimodal");
    expect(signal.score.overall).toBeGreaterThanOrEqual(0);
    expect(signal.score.overall).toBeLessThanOrEqual(100);
    expect(signal.score.factors.length).toBeGreaterThan(0);
    expect(signal.opportunities.length).toBeGreaterThan(0);
    for (const o of signal.opportunities) {
      expect(o.title).toBeTruthy();
      expect(o.rationale).toBeTruthy();
      expect(o.targetIndustries.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic — same input produces the same score and opportunities", async () => {
    const { platform, ctx } = await testPlatform();
    const input = { title: "Efficient RAG at Enterprise Scale", sourceType: "repo" as const, category: "rag" as const, summary: "An open-source retrieval pipeline with strong benchmark results and a permissive license." };
    const a = await platform.cerebroForge.ingestSignal(ctx, input);
    const b = await platform.cerebroForge.ingestSignal(ctx, input);
    expect(a.score).toEqual(b.score);
    expect(a.opportunities).toEqual(b.opportunities);
  });

  it("refuses an empty title or summary, or an unknown category", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.cerebroForge.ingestSignal(ctx, { title: "  ", sourceType: "paper", category: "agents", summary: "x" })).rejects.toThrow();
    await expect(platform.cerebroForge.ingestSignal(ctx, { title: "x", sourceType: "paper", category: "agents", summary: "  " })).rejects.toThrow();
    await expect(platform.cerebroForge.ingestSignal(ctx, { title: "x", sourceType: "paper", category: "not-a-category" as never, summary: "y" })).rejects.toThrow();
  });

  it("scores a production-ready enterprise repo higher on readiness than an experimental paper", async () => {
    const { platform, ctx } = await testPlatform();
    const ready = await platform.cerebroForge.ingestSignal(ctx, {
      title: "Production Agent Orchestration Framework", sourceType: "repo", category: "agents",
      summary: "An open-source, production-deployed agent orchestration framework used at enterprise scale with strong benchmarks.",
    });
    const experimental = await platform.cerebroForge.ingestSignal(ctx, {
      title: "Early Research Prototype for Agent Planning", sourceType: "paper", category: "agents",
      summary: "An early-stage, experimental research prototype exploring agent planning; proof of concept only.",
    });
    expect(ready.score.enterpriseReadiness).toBeGreaterThan(experimental.score.enterpriseReadiness);
  });

  it("generates a full product spec from a signal's opportunity", async () => {
    const { platform, ctx } = await testPlatform();
    const signal = await platform.cerebroForge.ingestSignal(ctx, {
      title: "New Agent Framework for Enterprise Workflows", sourceType: "repo", category: "agents",
      summary: "A production-ready agent framework for automating enterprise workflows, open source with strong adoption.",
    });
    const opportunityType = signal.opportunities[0]!.type;
    const spec = await platform.cerebroForge.generateProductSpec(ctx, signal.id, opportunityType);
    expect(spec.signalId).toBe(signal.id);
    expect(spec.features.length).toBeGreaterThan(0);
    expect(spec.targetCustomers.length).toBeGreaterThan(0);
    expect(spec.architecture.length).toBeGreaterThan(0);
    expect(spec.techStack.length).toBeGreaterThan(0);
    expect(spec.timelinePhases.length).toBeGreaterThan(0);
    expect(spec.buildTiers.length).toBe(3);
    expect(spec.buildTiers[0]!.estimatedCostUsd).toBeLessThan(spec.buildTiers[2]!.estimatedCostUsd);
  });

  it("404s generating a spec for an unknown signal, and rejects an opportunity type the signal doesn't have", async () => {
    const { platform, ctx } = await testPlatform();
    await expect(platform.cerebroForge.generateProductSpec(ctx, "does-not-exist", "api")).rejects.toThrow();
    const signal = await platform.cerebroForge.ingestSignal(ctx, {
      title: "World Model Simulation Advance", sourceType: "paper", category: "world-models",
      summary: "A new world model architecture for simulation-based planning.",
    });
    const missingType = (["saas-feature", "api", "sdk", "consulting", "copilot", "automation-agent", "whitepaper", "internal-tool", "infrastructure", "course"] as const)
      .find(t => !signal.opportunities.some(o => o.type === t))!;
    await expect(platform.cerebroForge.generateProductSpec(ctx, signal.id, missingType)).rejects.toThrow();
  });

  it("scopes signals and specs per organization", async () => {
    const { platform, ctx } = await testPlatform();
    const { ctx: otherCtx } = await testPlatform();
    const signal = await platform.cerebroForge.ingestSignal(ctx, { title: "Org Scoped Signal", sourceType: "news", category: "llms", summary: "A general LLM announcement relevant to enterprise adoption." });
    const otherSignals = await platform.cerebroForge.listSignals(otherCtx);
    expect(otherSignals.map(s => s.id)).not.toContain(signal.id);
    await expect(platform.cerebroForge.getSignal(otherCtx, signal.id)).rejects.toThrow();
  });

  it("lists signals sorted by overall score, descending", async () => {
    const { platform, ctx } = await testPlatform();
    await platform.cerebroForge.ingestSignal(ctx, { title: "Signal One", sourceType: "paper", category: "robotics", summary: "An early experimental robotics prototype." });
    await platform.cerebroForge.ingestSignal(ctx, { title: "Signal Two", sourceType: "repo", category: "agents", summary: "A production-ready, enterprise-deployed agent framework with strong benchmarks and open-source license." });
    const signals = await platform.cerebroForge.listSignals(ctx);
    expect(signals.length).toBe(2);
    for (let i = 1; i < signals.length; i++) expect(signals[i - 1]!.score.overall).toBeGreaterThanOrEqual(signals[i]!.score.overall);
  });
});
