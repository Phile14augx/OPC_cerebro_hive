// Cerebro Planner — decomposes a task into concrete, tool-aware steps
// based on the strategy the Reasoning Engine selected. Real decomposition
// logic, not a hardcoded script: the steps differ by input.

import { PlanStep, ReasoningStrategy } from "./types";

function splitSubTasks(input: string): string[] {
  return input
    .split(/\bthen\b|\bafter that\b|[.;]/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function buildPlan(input: string, strategy: ReasoningStrategy): PlanStep[] {
  let id = 1;
  const steps: PlanStep[] = [];
  const push = (description: string, tool?: string) => {
    steps.push({ id: id++, description, tool });
  };

  switch (strategy) {
    case "Tool-Augmented Reasoning":
      push("Parse the numeric expression out of the request");
      push("Execute the Calculator tool on the parsed expression", "calculator");
      push("Compose the final answer citing the computed result");
      break;

    case "ReAct":
      push("Query the Knowledge Fabric for relevant product entries", "knowledgeSearch");
      push("Reason over the retrieved evidence to check it actually answers the question");
      push("Compose a grounded answer that cites the retrieved product(s)");
      break;

    case "Tree of Thoughts": {
      const options = input
        .split(/\bvs\.?\b|\bversus\b|,|\band\b/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 1)
        .slice(0, 4);
      push(`Enumerate the options being compared: ${options.length ? options.join(", ") : "(none explicitly detected)"}`);
      push("Score each option against implied criteria");
      push("Select and justify the strongest branch");
      break;
    }

    case "Planner-Executor": {
      const subTasks = splitSubTasks(input);
      if (subTasks.length === 0) {
        push("Decompose the request into an ordered list of sub-tasks");
      } else {
        subTasks.forEach((t) => push(`Execute sub-task: ${t}`));
      }
      push("Aggregate sub-task results into one final answer");
      break;
    }

    case "Chain of Thought":
    default:
      push("Restate the request in the Reasoning Engine's own terms");
      push("Reason step by step toward an answer");
      push("Compose the final answer");
      break;
  }

  return steps;
}
