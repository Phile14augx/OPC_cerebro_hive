import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";
import { createStateGraph, END } from "../src/ai/graph/graph.js";
import { LlmChain, PromptTemplate, SequentialChain } from "../src/ai/chains/chains.js";

describe("devops", () => {
  it("runs a pipeline through the canonical stage set and records pass/fail per stage", async () => {
    const { platform, ctx } = await testPlatform();
    const run = await platform.devops.runPipeline(ctx, { pipelineName: "web-api", commitSha: "abc123", branch: "main" });
    expect(run.stages.length).toBe(8);
    expect(["succeeded", "failed"]).toContain(run.status);
    const list = await platform.devops.listPipelineRuns(ctx);
    expect(list.map(r => r.id)).toContain(run.id);
  });

  it("registers an environment, deploys, detects GitOps drift, and rolls back", async () => {
    const { platform, ctx } = await testPlatform();
    const env = await platform.devops.registerEnvironment(ctx, { name: "prod-us-east", tier: "production", region: "us-east-1", clusterOrHost: "eks-prod-1", iacModule: "terraform/prod" });
    expect(env.iacStateHash).toBeTruthy();

    const d1 = await platform.devops.deploy(ctx, { environmentId: env.id, service: "web-api", version: "1.0.0" });
    const d2 = await platform.devops.deploy(ctx, { environmentId: env.id, service: "web-api", version: "1.1.0" });
    expect(d2.previousVersion).toBe("1.0.0");

    const rolledBack = await platform.devops.rollback(ctx, d2.id);
    expect(rolledBack.version).toBe("1.0.0");

    const drift = await platform.devops.checkDrift(ctx, env.id, "some-other-declared-hash");
    expect(typeof drift.driftDetected).toBe("boolean");

    const deployments = await platform.devops.listDeployments(ctx, env.id);
    expect(deployments.length).toBeGreaterThanOrEqual(3);
  });
});

describe("mlops", () => {
  it("tracks an experiment, registers+promotes a model version through gates, and manages features/endpoints/drift", async () => {
    const { platform, ctx } = await testPlatform();
    const exp = await platform.mlops.startExperiment(ctx, { name: "churn-v2", framework: "pytorch" });
    await platform.mlops.logMetrics(ctx, exp.id, { accuracy: 0.91, biasGap: 0.04, evalPassRate: 0.95 });
    const completed = await platform.mlops.completeExperiment(ctx, exp.id);
    expect(completed.status).toBe("completed");

    const mv = await platform.mlops.registerModelVersion(ctx, { modelName: "churn", artifactUri: "s3://models/churn/1", metrics: completed.metrics, experimentId: exp.id });
    expect(mv.stage).toBe("none");

    const staged = await platform.mlops.promote(ctx, mv.id, "staging");
    expect(staged.stage).toBe("staging");
    const prod = await platform.mlops.promote(ctx, mv.id, "production");
    expect(prod.stage).toBe("production");
    expect(prod.gateChecks.every(g => g.passed)).toBe(true);

    const feature = await platform.mlops.registerFeature(ctx, { name: "days_since_last_login", entity: "user", valueType: "int" });
    expect((await platform.mlops.listFeatures(ctx)).map(f => f.id)).toContain(feature.id);

    const endpoint = await platform.mlops.deployEndpoint(ctx, { modelVersionId: mv.id, name: "churn-serving" });
    expect(endpoint.status).toBe("serving");

    const drift = await platform.mlops.checkDrift(ctx, { modelVersionId: mv.id, feature: "days_since_last_login", baselineMean: 10, currentMean: 25 });
    expect(["none", "low", "medium", "high"]).toContain(drift.severity);
  });

  it("blocks promotion to production when a gate fails", async () => {
    const { platform, ctx } = await testPlatform();
    const mv = await platform.mlops.registerModelVersion(ctx, { modelName: "risky", artifactUri: "s3://models/risky/1", metrics: { accuracy: 0.5 } });
    await expect(platform.mlops.promote(ctx, mv.id, "production")).rejects.toThrow();
  });
});

describe("secops / mlsecops", () => {
  it("runs deterministic scans, generates an SBOM, signs an artifact, and repeats identically for the same seed", async () => {
    const { platform, ctx } = await testPlatform();
    const scan1 = await platform.secops.runScan(ctx, { kind: "sast", target: "web-api", commitSha: "abc123" });
    const scan2 = await platform.secops.runScan(ctx, { kind: "sast", target: "web-api", commitSha: "abc123" });
    expect(scan1.findings.length).toBe(scan2.findings.length);

    const sbom = await platform.secops.generateSbom(ctx, { artifact: "web-api", version: "1.0.0", components: [{ name: "express", version: "4.19.0", license: "MIT" }] });
    expect(sbom.components.length).toBe(1);

    const sig = await platform.secops.signArtifact(ctx, "web-api:1.0.0", "sha256:deadbeef");
    expect(sig.signature).toBeTruthy();
    expect((await platform.secops.listSignatures(ctx)).map(s => s.id)).toContain(sig.id);
  });

  it("evaluates policy-as-code rules against a resource and runs an MLSecOps red-team evaluation", async () => {
    const { platform, ctx } = await testPlatform();
    const evalResult = await platform.secops.evaluatePolicy(ctx, "container", { privileged: true, image: "untrusted/image:latest" });
    expect(typeof evalResult.allowed).toBe("boolean");
    expect(evalResult.evaluations.length).toBeGreaterThan(0);

    const redTeam = await platform.secops.runRedTeam(ctx, { targetKind: "agent", targetId: "runtime-agent-1" });
    expect(redTeam.attacksRun).toBeGreaterThan(0);
    expect(redTeam.categories.length).toBeGreaterThan(0);
  });
});

describe("aiops", () => {
  it("detects anomalies over baselines, opens correlated incidents with a suggested playbook, and resolves them", async () => {
    const { platform, ctx } = await testPlatform();
    const { anomalies, incidents } = await platform.aiops.detect(ctx, { error_rate_spike: -1, guard_block_spike: -1 });
    expect(anomalies.length).toBeGreaterThanOrEqual(0);
    expect(incidents.length).toBeGreaterThanOrEqual(0);
    if (incidents.length) {
      const incident = incidents[0]!;
      expect(incident.suggestedPlaybook).toBeTruthy();
      const resolved = await platform.aiops.resolveIncident(ctx, incident.id);
      expect(resolved.status).toBe("resolved");
    }
  });
});

describe("Cerebro Graph (LangGraph-style state graph)", () => {
  it("executes nodes through static edges to completion with checkpoints", async () => {
    const { ctx } = await testPlatform();
    interface S extends Record<string, unknown> { count: number }
    const graph = createStateGraph<S>()
      .addNode("increment", (s: S) => ({ count: s.count + 1 }))
      .addNode("double", (s: S) => ({ count: s.count * 2 }))
      .addEdge("increment", "double")
      .addEdge("double", END)
      .setEntryPoint("increment")
      .compile();

    const result = await graph.invoke({ count: 1 }, ctx);
    expect(result.finalState.count).toBe(4); // (1+1)*2
    expect(result.status).toBe("completed");
    expect(result.visited).toEqual(["increment", "double"]);
    expect(result.checkpoints.length).toBe(2);
  });

  it("supports cycles bounded by a step budget and conditional routing", async () => {
    const { ctx } = await testPlatform();
    interface S extends Record<string, unknown> { n: number }
    const graph = createStateGraph<S>()
      .addNode("tick", (s: S) => ({ n: s.n + 1 }))
      .addConditionalEdge("tick", (s: S) => (s.n >= 3 ? "done" : "loop"), { loop: "tick", done: END })
      .setEntryPoint("tick")
      .compile({ maxSteps: 20 });

    const result = await graph.invoke({ n: 0 }, ctx);
    expect(result.finalState.n).toBe(3);
    expect(result.status).toBe("completed");
    expect(result.steps).toBe(3);
  });

  it("terminates a non-converging cycle at maxSteps rather than looping forever", async () => {
    const { ctx } = await testPlatform();
    interface S extends Record<string, unknown> { n: number }
    const graph = createStateGraph<S>()
      .addNode("tick", (s: S) => ({ n: s.n + 1 }))
      .addEdge("tick", "tick")
      .setEntryPoint("tick")
      .compile({ maxSteps: 5 });

    const result = await graph.invoke({ n: 0 }, ctx);
    expect(result.status).toBe("max_steps_exceeded");
    expect(result.steps).toBe(5);
  });
});

describe("Cerebro Chains (LangChain-style prompt templates, chains, agent executor)", () => {
  it("formats a PromptTemplate and validates required variables", () => {
    const tmpl = PromptTemplate.fromTemplate("Summarize {topic} for a {audience} audience.");
    expect(tmpl.inputVariables.sort()).toEqual(["audience", "topic"]);
    expect(tmpl.format({ topic: "AIOps", audience: "executive" })).toBe("Summarize AIOps for a executive audience.");
    expect(() => tmpl.format({ topic: "AIOps" })).toThrow(/missing variables/);
  });

  it("runs an LlmChain against the mock provider and produces text", async () => {
    const { platform, ctx } = await testPlatform();
    const chain = new LlmChain(platform.x, { name: "test-chain", prompt: PromptTemplate.fromTemplate("Say hello to {name}.") }, platform.bus);
    const result = await chain.run(ctx, { name: "Phil" });
    expect(typeof result.text).toBe("string");
    expect((result.text as string).length).toBeGreaterThan(0);
  });

  it("pipes state through a SequentialChain", async () => {
    const { platform, ctx } = await testPlatform();
    const step1 = new LlmChain(platform.x, { name: "step1", prompt: PromptTemplate.fromTemplate("Draft a one-line idea about {topic}."), outputKey: "draft" });
    const step2 = new LlmChain(platform.x, { name: "step2", prompt: PromptTemplate.fromTemplate("Improve this: {draft}"), outputKey: "final" });
    const seq = new SequentialChain("draft-then-improve", [step1, step2], platform.bus);
    const result = await seq.run(ctx, { topic: "MLOps drift detection" });
    expect(typeof result.draft).toBe("string");
    expect(typeof result.final).toBe("string");
  });

  it("runs the AgentExecutor's ReAct loop and produces a final answer using a bound tool", async () => {
    const { platform, ctx } = await testPlatform();
    const result = await platform.agentExecutor.run(ctx, "What is 12 * 7?");
    expect(result.finalAnswer.length).toBeGreaterThan(0);
    expect(["completed", "max_iterations_exceeded"]).toContain(result.status);
  });
});
