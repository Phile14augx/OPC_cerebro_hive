import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import { systemContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { Telemetry } from "../../kernel/telemetry/telemetry.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { Planner, Critic, ReasoningGraph, selectStrategy, type Plan } from "../reasoning/reasoning.js";
import type { ToolRegistry } from "./tools.js";
import type { MemoryFabric } from "../memory/memory.js";
import type { GuardService } from "../guard/guard.js";

export type ExecutionStatus =
  | "queued" | "planning" | "running" | "waiting" | "tool_call"
  | "completed" | "failed" | "cancelled" | "timed_out";

const TRANSITIONS: Record<ExecutionStatus, ExecutionStatus[]> = {
  queued: ["planning", "cancelled"],
  planning: ["running", "failed", "cancelled"],
  running: ["waiting", "tool_call", "completed", "failed", "cancelled", "timed_out"],
  waiting: ["running", "cancelled", "timed_out"],
  tool_call: ["running", "failed", "cancelled", "timed_out"],
  completed: [], failed: ["queued"], cancelled: [], timed_out: ["queued"],
};

export interface Execution {
  id: string; organizationId: string; workspaceId?: string; agentId?: string;
  goal: string; status: ExecutionStatus; input: Record<string, unknown>;
  result?: { output: string; verification: { ok: boolean; score: number; issues: string[] }; reasoningGraph?: unknown };
  error?: string; plan?: Plan; checkpoints: { at: string; step: number; note: string }[];
  attempts: number; maxAttempts: number; queuedAt: string; startedAt?: string; finishedAt?: string; traceId?: string;
}

export interface ExecutionStep {
  id: string; executionId: string; organizationId: string; seq: number; name: string;
  status: "running" | "completed" | "failed"; tool?: string; input?: string; output?: string;
  startedAt: string; finishedAt?: string;
}

export interface RuntimeRepository {
  insert(exec: Execution): Promise<void>;
  update(exec: Execution): Promise<void>;
  get(organizationId: string, id: string): Promise<Execution | undefined>;
  list(organizationId: string, opts?: { status?: ExecutionStatus; limit?: number }): Promise<Execution[]>;
  nextQueued(): Promise<Execution | undefined>;
  insertStep(step: ExecutionStep): Promise<void>;
  updateStep(step: ExecutionStep): Promise<void>;
  steps(executionId: string): Promise<ExecutionStep[]>;
  insertArtifact(a: { id: string; organizationId: string; executionId?: string; name: string; contentType: string; content: string }): Promise<void>;
  artifacts(organizationId: string, executionId: string): Promise<{ id: string; name: string; contentType: string; content: string }[]>;
}

export class InMemoryRuntimeRepository implements RuntimeRepository {
  executions = new Map<string, Execution>();
  stepRows = new Map<string, ExecutionStep>();
  artifactRows: { id: string; organizationId: string; executionId?: string; name: string; contentType: string; content: string }[] = [];

  async insert(exec: Execution): Promise<void> { this.executions.set(exec.id, structuredClone(exec)); }
  async update(exec: Execution): Promise<void> { this.executions.set(exec.id, structuredClone(exec)); }
  async get(org: string, id: string): Promise<Execution | undefined> {
    const e = this.executions.get(id);
    return e && e.organizationId === org ? structuredClone(e) : undefined;
  }
  async list(org: string, opts?: { status?: ExecutionStatus; limit?: number }): Promise<Execution[]> {
    let out = [...this.executions.values()].filter(e => e.organizationId === org);
    if (opts?.status) out = out.filter(e => e.status === opts.status);
    out.sort((a, b) => b.queuedAt.localeCompare(a.queuedAt));
    return out.slice(0, opts?.limit ?? 50).map(e => structuredClone(e));
  }
  async nextQueued(): Promise<Execution | undefined> {
    const queued = [...this.executions.values()].filter(e => e.status === "queued").sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
    return queued[0] ? structuredClone(queued[0]) : undefined;
  }
  async insertStep(step: ExecutionStep): Promise<void> { this.stepRows.set(step.id, structuredClone(step)); }
  async updateStep(step: ExecutionStep): Promise<void> { this.stepRows.set(step.id, structuredClone(step)); }
  async steps(executionId: string): Promise<ExecutionStep[]> {
    return [...this.stepRows.values()].filter(s => s.executionId === executionId).sort((a, b) => a.seq - b.seq);
  }
  async insertArtifact(a: { id: string; organizationId: string; executionId?: string; name: string; contentType: string; content: string }): Promise<void> { this.artifactRows.push(a); }
  async artifacts(org: string, executionId: string) {
    return this.artifactRows.filter(a => a.organizationId === org && a.executionId === executionId);
  }
}

export interface RuntimeDeps {
  repo: RuntimeRepository;
  bus: EventBus;
  x: XGateway;
  tools: ToolRegistry;
  memory: MemoryFabric;
  guard: GuardService;
  policy: PolicyEngine;
  telemetry: Telemetry;
}

/**
 * Cerebro AgentOS™ — the execution runtime. State-machine governed, checkpointed,
 * guarded, streamed over the event bus, with retry + cancellation + verification.
 */
export class RuntimeService {
  private planner: Planner;
  private critic: Critic;
  private cancellations = new Set<string>();

  constructor(private readonly deps: RuntimeDeps) {
    this.planner = new Planner(deps.x, deps.bus);
    this.critic = new Critic(deps.x);
  }

  async submit(ctx: RequestContext, input: { goal: string; workspaceId?: string; agentId?: string; input?: Record<string, unknown>; maxAttempts?: number }): Promise<Execution> {
    this.deps.policy.assert(ctx.principal, "runtime:run", { kind: "execution", organizationId: ctx.principal.organizationId, workspaceId: input.workspaceId });
    const guarded = await this.deps.guard.inspectInput(ctx, input.goal);
    if (guarded.blocked) throw new PlatformError("guard_blocked", `input blocked by Cerebro Guard (risk ${guarded.riskScore})`, { details: guarded.findings });
    const exec: Execution = {
      id: newId("exe"), organizationId: ctx.principal.organizationId, workspaceId: input.workspaceId,
      agentId: input.agentId, goal: guarded.redacted, status: "queued", input: input.input ?? {},
      checkpoints: [], attempts: 0, maxAttempts: input.maxAttempts ?? 3,
      queuedAt: new Date().toISOString(), traceId: ctx.traceId,
    };
    await this.deps.repo.insert(exec);
    await this.deps.bus.publish(Subjects.runtime.executionQueued, { executionId: exec.id, goal: exec.goal }, { organizationId: exec.organizationId, actor: ctx.principal.userId, traceId: ctx.traceId });
    return exec;
  }

  async cancel(ctx: RequestContext, id: string): Promise<Execution> {
    const exec = await this.mustGet(ctx, id);
    if (["completed", "failed", "cancelled"].includes(exec.status)) throw new PlatformError("precondition_failed", `execution already ${exec.status}`);
    this.cancellations.add(id);
    if (exec.status === "queued") {
      this.transition(exec, "cancelled");
      exec.finishedAt = new Date().toISOString();
      await this.deps.repo.update(exec);
      await this.deps.bus.publish(Subjects.runtime.executionCancelled, { executionId: id }, { organizationId: exec.organizationId, traceId: exec.traceId });
    }
    return (await this.deps.repo.get(ctx.principal.organizationId, id))!;
  }

  async get(ctx: RequestContext, id: string): Promise<Execution & { steps: ExecutionStep[] }> {
    const exec = await this.mustGet(ctx, id);
    const steps = await this.deps.repo.steps(id);
    return { ...exec, steps };
  }

  list(ctx: RequestContext, opts?: { status?: ExecutionStatus; limit?: number }): Promise<Execution[]> {
    this.deps.policy.assert(ctx.principal, "runtime:read", { kind: "execution", organizationId: ctx.principal.organizationId });
    return this.deps.repo.list(ctx.principal.organizationId, opts);
  }

  private async mustGet(ctx: RequestContext, id: string): Promise<Execution> {
    this.deps.policy.assert(ctx.principal, "runtime:read", { kind: "execution", organizationId: ctx.principal.organizationId });
    const exec = await this.deps.repo.get(ctx.principal.organizationId, id);
    if (!exec) throw PlatformError.notFound("execution", id);
    return exec;
  }

  private transition(exec: Execution, to: ExecutionStatus): void {
    if (!TRANSITIONS[exec.status].includes(to)) {
      throw new PlatformError("precondition_failed", `illegal transition ${exec.status} -> ${to}`);
    }
    exec.status = to;
  }

  /** Execute one queued execution end-to-end. Returns false when queue is empty. */
  async tick(): Promise<boolean> {
    const exec = await this.deps.repo.nextQueued();
    if (!exec) return false;
    await this.execute(exec);
    return true;
  }

  async execute(exec: Execution, opts?: { timeoutMs?: number }): Promise<Execution> {
    const { repo, bus, telemetry } = this.deps;
    const ctx = systemContext(exec.id);
    ctx.principal = { ...ctx.principal, organizationId: exec.organizationId, workspaceId: exec.workspaceId };
    ctx.traceId = exec.traceId;
    const deadline = Date.now() + (opts?.timeoutMs ?? 120_000);
    const graph = new ReasoningGraph();
    graph.add("goal", exec.goal);

    try {
      exec.attempts += 1;
      this.transition(exec, "planning");
      exec.startedAt = new Date().toISOString();
      await repo.update(exec);
      await bus.publish(Subjects.runtime.executionStarted, { executionId: exec.id, goal: exec.goal, attempt: exec.attempts }, { organizationId: exec.organizationId, traceId: exec.traceId });

      const decision = selectStrategy(exec.goal);
      graph.add("decision", `strategy=${decision.strategy} mode=${decision.mode} :: ${decision.rationale}`);
      const plan = await this.planner.plan(exec.organizationId, exec.goal, decision, exec.traceId);
      exec.plan = plan;
      this.transition(exec, "running");
      await repo.update(exec);

      const outputs: string[] = [];
      for (const step of plan.steps) {
        if (this.cancellations.has(exec.id)) {
          this.transition(exec, "cancelled");
          exec.finishedAt = new Date().toISOString();
          await repo.update(exec);
          await bus.publish(Subjects.runtime.executionCancelled, { executionId: exec.id }, { organizationId: exec.organizationId, traceId: exec.traceId });
          this.cancellations.delete(exec.id);
          return exec;
        }
        if (Date.now() > deadline) {
          this.transition(exec, "timed_out");
          exec.finishedAt = new Date().toISOString();
          await repo.update(exec);
          await bus.publish(Subjects.runtime.executionFailed, { executionId: exec.id, reason: "timeout" }, { organizationId: exec.organizationId, traceId: exec.traceId });
          return exec;
        }

        const row: ExecutionStep = {
          id: newId("stp"), executionId: exec.id, organizationId: exec.organizationId,
          seq: step.id, name: step.description, status: "running", startedAt: new Date().toISOString(),
        };
        await repo.insertStep(row);
        graph.add("thought", step.description);

        const tool = step.tool ? this.deps.tools.get(step.tool) ?? this.deps.tools.infer(step.description) : this.deps.tools.infer(step.description);
        let stepOutput: string;
        if (tool) {
          this.transition(exec, "tool_call");
          await repo.update(exec);
          const toolInput = `${exec.goal}\n${outputs.join("\n")}`.trim();
          const result = await telemetry.tracer.withSpan(`tool.${tool.name}`, async () => tool.invoke(ctx, toolInput));
          row.tool = tool.name;
          row.input = toolInput.slice(0, 400);
          stepOutput = result.output;
          graph.add("action", `${tool.name}(${toolInput.slice(0, 80)})`);
          graph.add("observation", stepOutput.slice(0, 300));
          this.transition(exec, "running");
        } else {
          const res = await this.deps.x.complete(exec.organizationId, {
            messages: [
              { role: "system", content: `You are executing step ${step.id} of a plan. Prior outputs:\n${outputs.join("\n").slice(0, 2000) || "(none)"}` },
              { role: "user", content: `Goal: ${exec.goal}\nStep: ${step.description}\nProduce the step output.` },
            ],
            metadata: { purpose: "runtime:step" },
          }, { traceId: exec.traceId });
          stepOutput = res.text;
          graph.add("observation", stepOutput.slice(0, 300));
        }

        row.output = stepOutput.slice(0, 4000);
        row.status = "completed";
        row.finishedAt = new Date().toISOString();
        await repo.updateStep(row);
        outputs.push(stepOutput);
        exec.checkpoints.push({ at: new Date().toISOString(), step: step.id, note: `completed: ${step.description.slice(0, 60)}` });
        await repo.update(exec);
        await bus.publish(Subjects.runtime.executionStep, { executionId: exec.id, step: step.id, name: step.description, tool: row.tool ?? null, output: stepOutput.slice(0, 500) }, { organizationId: exec.organizationId, traceId: exec.traceId });
      }

      // Verifier selects the strongest candidate output (tool results beat
      // weak verbal restatements); later steps win ties.
      let finalOutput = outputs[outputs.length - 1] ?? "";
      let verification = this.critic.verify(exec.goal, finalOutput);
      for (let i = outputs.length - 2; i >= 0; i--) {
        const candidate = this.critic.verify(exec.goal, outputs[i]!);
        if (candidate.score > verification.score + 0.05) { finalOutput = outputs[i]!; verification = candidate; }
      }
      if (!verification.ok && exec.attempts <= exec.maxAttempts) {
        const correction = await this.critic.reflect(exec.organizationId, exec.goal, finalOutput, verification, exec.traceId);
        graph.add("reflection", correction.slice(0, 300));
        await bus.publish(Subjects.reasoning.reflectionRecorded, { executionId: exec.id, issues: verification.issues }, { organizationId: exec.organizationId, traceId: exec.traceId });
        const retry = await this.deps.x.complete(exec.organizationId, {
          messages: [
            { role: "system", content: "Apply the correction to produce an improved final answer." },
            { role: "user", content: `Goal: ${exec.goal}\nPrevious: ${finalOutput}\nCorrection: ${correction}` },
          ],
          metadata: { purpose: "runtime:self-correct" },
        }, { traceId: exec.traceId });
        const improved = this.critic.verify(exec.goal, retry.text);
        if (improved.score >= verification.score) { finalOutput = retry.text; verification = improved; }
      }

      const guarded = await this.deps.guard.inspectOutput(ctx, finalOutput);
      finalOutput = guarded.redacted;

      exec.result = { output: finalOutput, verification: { ok: verification.ok, score: verification.score, issues: verification.issues }, reasoningGraph: graph.toJSON() };
      this.transition(exec, "completed");
      exec.finishedAt = new Date().toISOString();
      await repo.update(exec);
      await repo.insertArtifact({ id: newId("art"), organizationId: exec.organizationId, executionId: exec.id, name: "final-output.txt", contentType: "text/plain", content: finalOutput });
      await this.deps.memory.write(ctx, { tier: "episodic", scopeKey: exec.workspaceId ?? "org", content: `Execution ${exec.id}: goal="${exec.goal.slice(0, 120)}" outcome="${finalOutput.slice(0, 200)}"`, workspaceId: exec.workspaceId, importance: 0.6 });
      await bus.publish(Subjects.runtime.executionCompleted, { executionId: exec.id, goal: exec.goal, score: verification.score }, { organizationId: exec.organizationId, traceId: exec.traceId });
      telemetry.metrics.increment("runtime.execution.completed");
      return exec;
    } catch (err) {
      exec.error = err instanceof Error ? err.message : String(err);
      if (exec.attempts < exec.maxAttempts && !["cancelled", "timed_out"].includes(exec.status)) {
        exec.status = "queued";
        exec.checkpoints.push({ at: new Date().toISOString(), step: -1, note: `retry after error: ${exec.error.slice(0, 80)}` });
        await repo.update(exec);
        return exec;
      }
      if (!["cancelled", "timed_out"].includes(exec.status)) exec.status = "failed";
      exec.finishedAt = new Date().toISOString();
      await repo.update(exec);
      await bus.publish(Subjects.runtime.executionFailed, { executionId: exec.id, error: exec.error }, { organizationId: exec.organizationId, traceId: exec.traceId });
      telemetry.metrics.increment("runtime.execution.failed");
      return exec;
    }
  }
}

/** In-process scheduler: polls the queue with bounded concurrency. */
export class Scheduler {
  private running = 0;
  private stopped = false;
  private timer?: ReturnType<typeof setInterval>;
  constructor(private readonly runtime: RuntimeService, private readonly concurrency = 2, private readonly intervalMs = 500) {}
  start(): void {
    this.timer = setInterval(() => { void this.pump(); }, this.intervalMs);
  }
  private async pump(): Promise<void> {
    while (!this.stopped && this.running < this.concurrency) {
      this.running += 1;
      try { if (!(await this.runtime.tick())) { this.running -= 1; break; } }
      catch { /* execution errors handled inside */ }
      finally { if (this.running > 0) this.running -= 1; }
    }
  }
  async drain(): Promise<void> { while (await this.runtime.tick()) { /* run all queued */ } }
  stop(): void { this.stopped = true; if (this.timer) clearInterval(this.timer); }
}
