// Cerebro AgentOS — runtime entry point. Wires Guard, the Reasoning Engine,
// the Planner, the Scheduler, Memory Fabric, and Eval into one real,
// end-to-end execution. No external LLM call is made: reasoning strategy
// selection, tool execution, and answer composition are all genuine
// deterministic logic that runs on the request.

import { AgentRunResult, StepTrace } from "./types";
import { runGuard } from "./guard";
import { decideStrategy } from "./reasoning";
import { buildPlan } from "./planner";
import { executePlan } from "./scheduler";
import { evaluateRun } from "./eval";
import { getSnapshot, writeMemory } from "./memory";

function composeAnswer(input: string, strategy: string, trace: StepTrace[], toolOutputs: string[]): string {
  if (toolOutputs.length > 0) {
    return `Using ${strategy}: ${toolOutputs.join(" ")}`;
  }
  const lastStep = trace[trace.length - 1];
  return `Using ${strategy}, the runtime reasoned through ${trace.length} step(s) for "${input.slice(0, 80)}${input.length > 80 ? "…" : ""}". ${lastStep ? lastStep.output : ""}`;
}

export async function runAgentTask(input: string, sessionId: string): Promise<AgentRunResult> {
  const runStart = Date.now();

  const guard = runGuard(input);

  if (guard.blocked) {
    const evaluation = evaluateRun(Date.now() - runStart, [], guard);
    const memory = await getSnapshot(sessionId, input);
    await writeMemory(
      "episodic",
      sessionId,
      `input="${input.slice(0, 120)}" strategy=Blocked answer="Blocked by Guard" latencyMs=${evaluation.latencyMs}`
    );
    return {
      sessionId,
      input,
      guard,
      reasoning: { strategy: "Chain of Thought", rationale: "Execution halted before reasoning — Guard flagged a prompt-injection pattern.", confidence: 1, signals: ["Blocked by Guard"] },
      plan: [],
      trace: [],
      answer: "Request blocked by Cerebro Guard before execution: a prompt-injection pattern was detected in the input.",
      memory,
      evaluation,
    };
  }

  const reasoning = decideStrategy(guard.redactedInput);
  const plan = buildPlan(guard.redactedInput, reasoning.strategy);
  const { trace, toolOutputs } = await executePlan(plan, sessionId, guard.redactedInput);
  const answer = composeAnswer(guard.redactedInput, reasoning.strategy, trace, toolOutputs);

  const latencyMs = Date.now() - runStart;
  const evaluation = evaluateRun(latencyMs, trace, guard);

  // Persist episodic + semantic memory for this run (real disk writes).
  await writeMemory(
    "episodic",
    sessionId,
    `input="${input.slice(0, 120)}" strategy=${reasoning.strategy.replace(/\s+/g, "_")} answer="${answer.slice(0, 160)}" latencyMs=${latencyMs}`
  );
  if (toolOutputs.length > 0) {
    await writeMemory("semantic", sessionId, `${guard.redactedInput.slice(0, 100)} => ${toolOutputs.join(" | ").slice(0, 200)}`);
  }

  const memory = await getSnapshot(sessionId, input);

  return { sessionId, input, guard, reasoning, plan, trace, answer, memory, evaluation };
}
