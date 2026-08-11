// Cerebro Scheduler — executes the Planner's steps in order, invoking real
// tools and writing real memory records, with real wall-clock timing per step.

import { PlanStep, StepTrace } from "./types";
import { runTool } from "./tools";
import { writeMemory } from "./memory";

export async function executePlan(
  steps: PlanStep[],
  sessionId: string,
  originalInput: string
): Promise<{ trace: StepTrace[]; toolOutputs: string[] }> {
  const trace: StepTrace[] = [];
  const toolOutputs: string[] = [];

  for (const step of steps) {
    const startedAt = Date.now();
    let output: string;
    let toolCall: StepTrace["toolCall"];

    if (step.tool) {
      // Tools operate on the real user input, not the planner's step description —
      // the description is a human-readable label, not the payload to execute.
      const toolStart = Date.now();
      const toolOutput = runTool(step.tool, originalInput);
      const durationMs = Date.now() - toolStart;
      toolCall = { tool: step.tool, input: originalInput, output: toolOutput, durationMs };
      output = toolOutput;
      toolOutputs.push(toolOutput);
    } else {
      output = step.description;
    }

    const memoryWrites: string[] = [];
    const rec = await writeMemory("shortTerm", sessionId, `step ${step.id}: ${step.description} -> ${output}`);
    memoryWrites.push(rec.id);

    trace.push({
      step,
      startedAt,
      durationMs: Date.now() - startedAt,
      toolCall,
      memoryWrites,
      output,
    });
  }

  return { trace, toolOutputs };
}
