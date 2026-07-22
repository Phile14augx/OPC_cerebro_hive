import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("Cerebro Router (multi-model intelligent routing)", () => {
  it("classifies intent/complexity/privacy and picks an explainable model deterministically", async () => {
    const { platform, ctx } = await testPlatform();
    const d1 = await platform.router.route(ctx, "Write a function to parse this JSON and fix the bug in the stack trace.");
    const d2 = await platform.router.route(ctx, "Write a function to parse this JSON and fix the bug in the stack trace.");
    expect(d1.intent).toBe("code");
    expect(d1.selectedModel).toBe(d2.selectedModel); // deterministic for identical input
    expect(d1.candidates.length).toBeGreaterThan(1);
    expect(d1.rationale).toContain(d1.selectedModel);
    expect(platform.router.catalog().length).toBeGreaterThanOrEqual(10);
  });

  it("routes restricted/PII-bearing text only to local models", async () => {
    const { platform, ctx } = await testPlatform();
    const decision = await platform.router.route(ctx, "Please update this record: SSN 123-45-6789, this is confidential.");
    expect(decision.privacyTier).toBe("restricted");
    const model = platform.router.catalog().find(m => m.id === decision.selectedModel);
    expect(model?.local).toBe(true);
  });

  it("executes a routed completion end-to-end through XGateway and records actual vs predicted", async () => {
    const { platform, ctx } = await testPlatform();
    const { decision, result } = await platform.router.execute(ctx, [{ role: "user", content: "Summarize: the sky is blue." }]);
    expect(decision.id).toBeTruthy();
    expect(typeof result.text).toBe("string");
    const history = await platform.router.history(ctx);
    expect(history.map(d => d.id)).toContain(decision.id);
  });
});

describe("Cerebro Compiler (NL goal -> plan -> workflow -> execution graph)", () => {
  it("compiles a goal into a validated workflow definition without deploying it", async () => {
    const { platform, ctx } = await testPlatform();
    const program = await platform.compiler.compile(ctx, { goal: "Research competitors, then draft a summary, then verify accuracy." });
    expect(program.plan.steps.length).toBeGreaterThan(0);
    expect(program.definition.nodes.length).toBe(program.plan.steps.length);
    expect(program.workflowId).toBeUndefined();
    const list = await platform.compiler.list(ctx);
    expect(list.map(p => p.id)).toContain(program.id);
  });

  it("deploys the compiled program as a real, runnable Flow workflow when deploy=true", async () => {
    const { platform, ctx } = await testPlatform();
    const program = await platform.compiler.compile(ctx, { goal: "Compute the ROI of a $10000 investment returning $14000.", deploy: true });
    expect(program.workflowId).toBeTruthy();
    const workflows = await platform.flow.list(ctx);
    expect(workflows.map(w => w.id)).toContain(program.workflowId);
  });

  it("compiles AND executes immediately when execute=true, producing a completed workflow run", async () => {
    const { platform, ctx } = await testPlatform();
    const program = await platform.compiler.compile(ctx, { goal: "Say hello.", execute: true });
    expect(program.workflowId).toBeTruthy();
    expect(program.runId).toBeTruthy();
  });
});

describe("Cerebro Swarm (multi-agent coordination protocol)", () => {
  it("runs the full Planner->Coordinator->Specialists->Critics->Judge->Consensus->Verifier->Auditor pipeline", async () => {
    const { platform, ctx } = await testPlatform();
    const run = await platform.swarm.run(ctx, "Research the topic, then write code for it, then review the code for security issues.");
    expect(run.roles.length).toBeGreaterThan(0);
    expect(run.consensus?.finalAnswer.length).toBeGreaterThan(0);
    expect(run.verifier).toBeTruthy();
    expect(run.status).toBe("completed");
    expect(run.auditTrail.length).toBeGreaterThanOrEqual(run.roles.length + 3); // planner+coordinator+judge+verifier+auditor+specialists
    const stages = run.auditTrail.map(a => a.stage);
    expect(stages).toContain("planner");
    expect(stages).toContain("coordinator");
    expect(stages).toContain("judge");
    expect(stages).toContain("verifier");
    expect(stages).toContain("auditor");
  });

  it("assigns sensible specialist roles based on subtask content", async () => {
    const { platform, ctx } = await testPlatform();
    const run = await platform.swarm.run(ctx, "Review this code for security vulnerabilities and check compliance with policy.");
    expect(run.roles.some(r => r.role === "security" || r.role === "reviewer")).toBe(true);
  });

  it("persists and lists swarm runs", async () => {
    const { platform, ctx } = await testPlatform();
    const run = await platform.swarm.run(ctx, "What is 5 + 5?");
    const fetched = await platform.swarm.get(ctx, run.id);
    expect(fetched?.id).toBe(run.id);
    const list = await platform.swarm.list(ctx);
    expect(list.map(r => r.id)).toContain(run.id);
  });
});

describe("Cerebro Actions (autonomous enterprise execution)", () => {
  it("executes a low-risk action immediately and records a deterministic simulated result", async () => {
    const { platform, ctx } = await testPlatform();
    const a1 = await platform.actions.execute(ctx, { kind: "create_jira_ticket", params: { project: "OPS" } });
    expect(a1.status).toBe("executed");
    expect(a1.result?.ticketId).toBeTruthy();
    const log = await platform.actions.list(ctx);
    expect(log.map(a => a.id)).toContain(a1.id);
  });

  it("gates high-blast-radius actions behind approval and only executes once approved=true", async () => {
    const { platform, ctx } = await testPlatform();
    const pending = await platform.actions.execute(ctx, { kind: "deploy_kubernetes", params: { deployment: "web-api" } });
    expect(pending.status).toBe("pending_approval");
    expect(pending.result).toBeUndefined();
    const approved = await platform.actions.execute(ctx, { kind: "deploy_kubernetes", params: { deployment: "web-api" }, approved: true });
    expect(approved.status).toBe("executed");
    expect(approved.result?.status).toBe("rolled_out");
  });

  it("exposes the full action catalog with approval requirements", async () => {
    const { platform } = await testPlatform();
    const catalog = platform.actions.catalog();
    expect(catalog.length).toBe(8);
    expect(catalog.find(a => a.kind === "provision_infrastructure")?.requiresApproval).toBe(true);
    expect(catalog.find(a => a.kind === "create_jira_ticket")?.requiresApproval).toBe(false);
  });

  it("really executes trigger_workflow against a live Flow workflow rather than simulating it", async () => {
    const { platform, ctx } = await testPlatform();
    const program = await platform.compiler.compile(ctx, { goal: "Say hi.", deploy: true });
    const executed = await platform.actions.execute(ctx, { kind: "trigger_workflow", params: { workflowId: program.workflowId } });
    expect(executed.status).toBe("executed");
    expect(executed.result?.runId).toBeTruthy();
  });
});
