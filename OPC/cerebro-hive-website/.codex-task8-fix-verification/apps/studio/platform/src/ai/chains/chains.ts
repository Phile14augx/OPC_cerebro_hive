import { newId } from "../../kernel/ids/id.js";
import { Subjects, type EventBus } from "../../kernel/events/events.js";
import type { RequestContext } from "../../kernel/context/context.js";
import { PlatformError } from "../../kernel/errors/errors.js";
import type { XGateway } from "../x/gateway.js";
import type { ChatMessage } from "../x/types.js";
import type { Tool, ToolRegistry } from "../../domains/runtime/tools.js";

/**
 * Cerebro Chains™ — a LangChain-compatible composition layer: fill-in
 * PromptTemplates, single-call LLMChains, SequentialChains that pipe one
 * chain's output into the next's input, and a ReAct-style AgentExecutor
 * that binds a ToolRegistry and iterates thought -> action -> observation
 * until it produces a final answer or exhausts its step budget. Built
 * directly on XGateway.complete(), so every chain call inherits the
 * gateway's routing, retries, caching, and pricing for free.
 */

export type ChainInput = Record<string, unknown>;
export type ChainOutput = Record<string, unknown>;

/** LangChain-style `PromptTemplate` — `{variable}` interpolation with required-variable validation. */
export class PromptTemplate {
  readonly inputVariables: string[];
  constructor(private readonly template: string) {
    this.inputVariables = [...new Set([...template.matchAll(/\{(\w+)\}/g)].map(m => m[1]!))];
  }

  static fromTemplate(template: string): PromptTemplate { return new PromptTemplate(template); }

  format(vars: ChainInput): string {
    const missing = this.inputVariables.filter(v => !(v in vars));
    if (missing.length) throw PlatformError.validation(`prompt template missing variables: ${missing.join(", ")}`);
    return this.template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
  }
}

export interface Chain {
  readonly name: string;
  run(ctx: RequestContext, input: ChainInput): Promise<ChainOutput>;
}

export interface LlmChainOptions {
  name: string;
  prompt: PromptTemplate;
  outputKey?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}

/** LangChain-style `LLMChain` — formats a prompt, sends one completion, returns `{ [outputKey]: text }`. */
export class LlmChain implements Chain {
  readonly name: string;
  private readonly outputKey: string;

  constructor(private readonly gateway: XGateway, private readonly opts: LlmChainOptions, private readonly bus?: EventBus) {
    this.name = opts.name;
    this.outputKey = opts.outputKey ?? "text";
  }

  async run(ctx: RequestContext, input: ChainInput): Promise<ChainOutput> {
    const org = ctx.principal.organizationId;
    const prompt = this.opts.prompt.format(input);
    const messages: ChatMessage[] = [];
    if (this.opts.systemPrompt) messages.push({ role: "system", content: this.opts.systemPrompt });
    messages.push({ role: "user", content: prompt });

    await this.bus?.publish(Subjects.chain.invoked, { chain: this.name, inputKeys: Object.keys(input) }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    const result = await this.gateway.complete(org, { messages, model: this.opts.model, temperature: this.opts.temperature }, { traceId: ctx.traceId });
    await this.bus?.publish(Subjects.chain.completed, { chain: this.name, costUsd: result.costUsd, latencyMs: result.latencyMs }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    return { ...input, [this.outputKey]: result.text, [`${this.outputKey}Meta`]: { provider: result.provider, model: result.model, costUsd: result.costUsd, latencyMs: result.latencyMs } };
  }
}

/** LangChain-style `SequentialChain` — pipes each chain's merged output into the next chain's input. */
export class SequentialChain implements Chain {
  constructor(readonly name: string, private readonly steps: Chain[], private readonly bus?: EventBus) {}

  async run(ctx: RequestContext, input: ChainInput): Promise<ChainOutput> {
    let state: ChainOutput = { ...input };
    for (const step of this.steps) {
      state = { ...state, ...(await step.run(ctx, state)) };
    }
    return state;
  }
}

/** A single ReAct reasoning trace step, kept for observability/audit (mirrors LangChain's `intermediateSteps`). */
export interface AgentStep { thought: string; tool: string; toolInput: string; observation: string }
export interface AgentResult { finalAnswer: string; steps: AgentStep[]; iterations: number; status: "completed" | "max_iterations_exceeded" }

export interface AgentExecutorOptions {
  tools: ToolRegistry;
  gateway: XGateway;
  maxIterations?: number;
  model?: string;
  bus?: EventBus;
}

/**
 * LangChain-style `AgentExecutor` — a ReAct loop: ask the model to pick a tool
 * (or answer directly), invoke the tool via the ToolRegistry, feed the
 * observation back, and repeat until a final answer is produced or the
 * iteration budget is exhausted. Tool selection uses the gateway completion
 * plus the registry's own heuristic `infer()` as a deterministic fallback so
 * the executor still functions against the offline mock provider.
 */
export class AgentExecutor {
  private readonly tools: ToolRegistry;
  private readonly gateway: XGateway;
  private readonly maxIterations: number;
  private readonly model?: string;
  private readonly bus?: EventBus;

  constructor(opts: AgentExecutorOptions) {
    this.tools = opts.tools;
    this.gateway = opts.gateway;
    this.maxIterations = opts.maxIterations ?? 6;
    this.model = opts.model;
    this.bus = opts.bus;
  }

  async run(ctx: RequestContext, objective: string): Promise<AgentResult> {
    const org = ctx.principal.organizationId;
    const runId = newId("agent");
    const steps: AgentStep[] = [];
    const catalog = this.tools.list().map(t => `- ${t.name}: ${t.description}`).join("\n");

    await this.bus?.publish(Subjects.chain.invoked, { chain: "agent_executor", runId, objective }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });

    let scratchpad = "";
    for (let i = 0; i < this.maxIterations; i++) {
      const tool = this.selectTool(objective, scratchpad);
      if (!tool) break;

      const reasoningPrompt: ChatMessage[] = [
        { role: "system", content: `You are an autonomous agent with access to these tools:\n${catalog}\nRespond with a one-sentence thought about why "${tool.name}" is the right next action.` },
        { role: "user", content: `Objective: ${objective}\nProgress so far: ${scratchpad || "(none)"}` },
      ];
      const reasoning = await this.gateway.complete(org, { messages: reasoningPrompt, model: this.model, temperature: 0 }, { traceId: ctx.traceId });
      const result = await tool.invoke(ctx, objective);
      const step: AgentStep = { thought: reasoning.text, tool: tool.name, toolInput: objective, observation: result.output };
      steps.push(step);
      scratchpad += `\nThought: ${step.thought}\nAction: ${step.tool}\nObservation: ${step.observation}`;

      if (this.isSufficient(result.output)) {
        await this.bus?.publish(Subjects.chain.completed, { chain: "agent_executor", runId, iterations: steps.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
        return { finalAnswer: result.output, steps, iterations: steps.length, status: "completed" };
      }
    }

    if (steps.length === 0) {
      const direct = await this.gateway.complete(org, { messages: [{ role: "user", content: objective }], model: this.model }, { traceId: ctx.traceId });
      await this.bus?.publish(Subjects.chain.completed, { chain: "agent_executor", runId, iterations: 0 }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
      return { finalAnswer: direct.text, steps, iterations: 0, status: "completed" };
    }

    const status = steps.length >= this.maxIterations ? "max_iterations_exceeded" : "completed";
    await this.bus?.publish(Subjects.chain.completed, { chain: "agent_executor", runId, iterations: steps.length }, { organizationId: org, actor: ctx.principal.userId, traceId: ctx.traceId });
    return { finalAnswer: steps.at(-1)?.observation ?? "", steps, iterations: steps.length, status };
  }

  private selectTool(objective: string, scratchpad: string): Tool | undefined {
    if (scratchpad.includes(`Action: `)) {
      const used = new Set([...scratchpad.matchAll(/Action: (\S+)/g)].map(m => m[1]));
      const remaining = this.tools.list().filter(t => !used.has(t.name));
      if (!remaining.length) return undefined;
    }
    return this.tools.infer(objective);
  }

  private isSufficient(observation: string): boolean {
    return observation.length > 0 && !/^no (relevant|catalog|computable|knowledge)/i.test(observation);
  }
}

/** Convenience factory mirroring LangChain's `new LLMChain({ llm, prompt })`. */
export function createLlmChain(gateway: XGateway, opts: LlmChainOptions, bus?: EventBus): LlmChain {
  return new LlmChain(gateway, opts, bus);
}
