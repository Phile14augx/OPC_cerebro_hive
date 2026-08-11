import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";
import { deterministicEmbedding, cosine } from "../src/ai/x/mock-provider.js";
import { HashedProjectionModel, AnomalyDetector } from "../src/ai/representation/representation.js";

describe("cerebro x + ai layer", () => {
  it("completes via gateway with cost + telemetry and caches deterministic calls", async () => {
    const { platform, ctx } = await testPlatform();
    const req = { messages: [{ role: "user" as const, content: "What is 6 * 7?" }] };
    const first = await platform.x.complete(ctx.principal.organizationId, req);
    expect(first.text).toContain("42");
    expect(first.provider).toBe("mock");
    const second = await platform.x.complete(ctx.principal.organizationId, req);
    expect(second.cached).toBe(true);
    const usage = await platform.x.usage(ctx.principal.organizationId);
    expect(usage.calls).toBeGreaterThanOrEqual(1);
  });

  it("embeddings are deterministic and semantically ordered", () => {
    const a = deterministicEmbedding("kubernetes container orchestration platform");
    const b = deterministicEmbedding("kubernetes cluster orchestration");
    const c = deterministicEmbedding("chocolate cake recipe with strawberries");
    expect(cosine(a, b)).toBeGreaterThan(cosine(a, c));
  });

  it("prompt registry renders versioned templates and enforces variables", async () => {
    const { platform, ctx } = await testPlatform();
    platform.x.prompts.register(ctx.principal.organizationId, "greet", "Hello {{name}}!");
    expect(platform.x.prompts.render(ctx.principal.organizationId, "greet", { name: "Phil" })).toBe("Hello Phil!");
    expect(() => platform.x.prompts.render(ctx.principal.organizationId, "greet", {})).toThrow(/missing prompt variables/);
  });

  it("mixture of experts routes by task signals", async () => {
    const { platform, ctx } = await testPlatform();
    const routed = platform.moe.route("Fix this typescript function bug in the api code");
    expect(routed[0]!.expert.id).toBe("coding");
    const res = await platform.moe.run(ctx.principal.organizationId, "Assess the security vulnerability risk of this policy");
    expect(res.experts.some(e => e.id === "security")).toBe(true);
    expect(res.answer.length).toBeGreaterThan(10);
  });

  it("JEPA representation layer predicts trajectories and flags anomalies", () => {
    const model = new HashedProjectionModel();
    const detector = new AnomalyDetector(model, 0.3);
    const history = ["deploy web service", "deploy api service", "deploy worker service"];
    const normal = detector.assess(history, "deploy queue service");
    const weird = detector.assess(history, "bake a chocolate cake with sprinkles");
    expect(normal.score).toBeLessThan(weird.score);
  });

  it("world model projects events and answers semantic queries", async () => {
    const { platform, ctx } = await testPlatform();
    await platform.world.project(ctx.principal.organizationId, "project", "p1", "Enterprise RAG Pipeline", { status: "active" });
    await platform.world.project(ctx.principal.organizationId, "project", "p2", "Payroll migration", { status: "done" });
    const res = await platform.world.semanticQuery(ctx.principal.organizationId, "retrieval augmented generation pipeline", { limit: 2 });
    expect(res[0]!.name).toBe("Enterprise RAG Pipeline");
  });
});
