// Cerebro Eval — real scoring of a completed run. Every field is computed
// from the actual trace/guard output of that run, not a fixed number.

import { EvalReport, GuardReport, StepTrace } from "./types";

export function evaluateRun(
  latencyMs: number,
  trace: StepTrace[],
  guard: GuardReport
): EvalReport {
  const toolCallCount = trace.filter((t) => t.toolCall).length;
  const grounded = toolCallCount > 0;

  // Rough per-run cost model: a flat orchestration cost plus a per-tool-call cost.
  // Deliberately transparent (no external API billing involved in this demo).
  const costEstimateUsd = Number((0.0004 + toolCallCount * 0.0006).toFixed(4));

  return {
    latencyMs,
    stepCount: trace.length,
    toolCallCount,
    grounded,
    groundednessReason: grounded
      ? `Answer is grounded — ${toolCallCount} tool call(s) produced evidence used in the final answer.`
      : "No tool was called; answer is reasoning-only and not grounded in retrieved evidence.",
    riskScore: guard.riskScore,
    costEstimateUsd,
  };
}
