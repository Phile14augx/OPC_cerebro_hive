// Cerebro Reasoning Engine — real heuristic strategy selection.
// Adaptive orchestration, not a single algorithm: classifies the incoming
// task and picks which reasoning strategy actually fits it.

import { ReasoningDecision } from "./types";
import { extractExpression } from "./tools";

const COMPARISON_WORDS = /\b(vs\.?|versus|compare|comparison|better than|pros and cons|which is|difference between)\b/i;
const MULTISTEP_WORDS = /\b(then|after that|next|first.*second|step \d|\d\.\s)/i;
const PRODUCT_WORDS = /\b(agentos|memory fabric|knowledge fabric|reasoning engine|cerebro|hivehive|platform|product|guard|eval|observatory|cortex|simulator)\b/i;

export function decideStrategy(input: string): ReasoningDecision {
  const signals: string[] = [];

  const expr = extractExpression(input);
  if (expr) {
    signals.push(`Detected arithmetic expression: '${expr}'`);
    return {
      strategy: "Tool-Augmented Reasoning",
      rationale: "Input contains a computable expression, so the Reasoning Engine routes directly to a tool call instead of reasoning in prose.",
      confidence: 0.95,
      signals,
    };
  }

  if (COMPARISON_WORDS.test(input)) {
    signals.push("Detected comparison / evaluation language");
    return {
      strategy: "Tree of Thoughts",
      rationale: "The request asks for a comparison between options, so multiple branches are enumerated and scored before picking one.",
      confidence: 0.82,
      signals,
    };
  }

  if (PRODUCT_WORDS.test(input)) {
    signals.push("Detected a question about the CerebroHive catalog");
    return {
      strategy: "ReAct",
      rationale: "The request is about specific CerebroHive products, so the engine retrieves evidence first (Act), then reasons over it (Reason), rather than answering from assumption.",
      confidence: 0.88,
      signals,
    };
  }

  if (MULTISTEP_WORDS.test(input) || input.split(/[.;]/).filter((s) => s.trim().length > 0).length >= 3) {
    signals.push("Detected multiple sequential sub-tasks");
    return {
      strategy: "Planner-Executor",
      rationale: "The request decomposes into an ordered sequence of sub-tasks, so the Planner splits it and the Scheduler executes each step.",
      confidence: 0.75,
      signals,
    };
  }

  signals.push("No specialized signal matched — falling back to general reasoning");
  return {
    strategy: "Chain of Thought",
    rationale: "No structural signal (math, comparison, catalog lookup, multi-step) was detected, so the engine defaults to straightforward step-by-step reasoning.",
    confidence: 0.6,
    signals,
  };
}
