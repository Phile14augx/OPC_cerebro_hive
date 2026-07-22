import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import type { PolicyEngine } from "../../kernel/policy/policy.js";
import type { XGateway } from "../../ai/x/gateway.js";
import { Planner, selectStrategy, type Plan, type StrategyDecision } from "../reasoning/reasoning.js";
import { FlowService, type Workflow, type WorkflowDefinition, type WorkflowRun } from "../flow/flow.js";

/**
 * Cerebro Compiler™ — the "AI Compiler" pillar of the Enterprise Cognitive
 * OS: natural language -> goals -> plans -> workflows -> execution graph ->
 * deployment. It reuses the Reasoning Engine's strategy selection + planner
 * to decompose a goal, lowers the resulting plan into a validated Flow
 * workflow definition (the platform's own execution-graph IR), and can
 * optionally register + run it immediately — turning a sentence into a
 * running, auditable, resumable workflow with zero hand-authored DAG.
 */

export interface CompiledProgram {
  id: string; organizationId: string; goal: string; strategy: StrategyDecision["strategy"]; mode: StrategyDecision["mode"];
  plan: Plan; definition: WorkflowDefinition; workflowId?: string; runId?: string; compiledAt: string;
}

export interface CompilerRepository {
  insert(p: CompiledProgram): Promise<void>;
  list(org: string, limit?: number): Promise<CompiledProgram[]>;
}

export class InMemoryCompilerRepository implements CompilerRepository {
  programs: CompiledProgram[] = [];
  async insert(p: CompiledProgram) { this.programs.push(p); }
  async list(org: string, limit = 50) { return this.programs.filter(p => p.organizationId === org).slice(-limit).reverse(); }
}

export class CompilerService {
  private readonly planner: Planner;

  constructor(
    private readonly repo: CompilerRepository,
    private readonly bus: EventBus,
    private readonly policy: PolicyEngine,
    private readonly x: XGateway,
    private readonly flow: FlowService,
  ) {
    this.planner = new Planner(x, bus);
  }

  /** Lower a Reasoning Engine Plan into a linear, validated Flow workflow-graph IR. */
  private lower(plan: Plan): WorkflowDefinition {
    const nodes = plan.steps.map((step, i) => ({
      id: `step-${step.id}`,
      type: "task" as const,
      name: step.description.slice(0, 200),
      config: { goal: step.description, tool: step.tool },
      next: i < plan.steps.length - 1 ? [`step-${plan.steps[i + 1]!.id}`] : [],
    }));
    return { entry: `step-${plan.steps[0]!.id}`, nodes, triggers: [{ type: "manual", config: {} }] };
  }

  /** Compile a natural-language goal into a runnable workflow. Optionally register + execute it immediately (`deploy`). */
  async compile(ctx: RequestContext, input: { goal: string; name?: string; deploy?: boolean; execute?: boolean; input?: Record<string, unknown> }): Promise<CompiledProgram> {
    this.policy.assert(ctx.principal, "compiler:write", { kind: "program", organizationId: ctx.principal.organizationId });
    const org = ctx.principal.organizationId;
    const decision = selectStrategy(input.goal);
    const plan = await this.planner.plan(org, input.goal, decision, ctx.traceId);
    const definition = this.lower(plan);

    const program: CompiledProgram = {
      id: newId("prog"), organizationId: org, goal: input.goal, strategy: decision.strategy, mode: decision.mode,
      plan, definition, compiledAt: new Date().toISOString(),
    };

    await this.bus.publish(Subjects.compiler.compiled, { programId: program.id, goal: input.goal, strategy: decision.strategy, steps: plan.steps.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    if (input.deploy ?? input.execute) {
      const wf: Workflow = await this.flow.create(ctx, { name: input.name ?? `compiled: ${input.goal.slice(0, 60)}`, definition });
      program.workflowId = wf.id;
      await this.bus.publish(Subjects.compiler.workflowGenerated, { programId: program.id, workflowId: wf.id }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

      if (input.execute) {
        const run: WorkflowRun = await this.flow.run(ctx, wf.id, input.input ?? {}, "compiler");
        program.runId = run.id;
      }
    }

    await this.repo.insert(program);
    return program;
  }

  list(ctx: RequestContext, limit?: number): Promise<CompiledProgram[]> {
    this.policy.assert(ctx.principal, "compiler:read", { kind: "program", organizationId: ctx.principal.organizationId });
    return this.repo.list(ctx.principal.organizationId, limit);
  }
}
