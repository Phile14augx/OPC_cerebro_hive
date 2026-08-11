/**
 * Temporal workflow — cerebroWorkflow
 *
 * Orchestrates multi-step AI workflow execution:
 *   - Sequential/parallel step execution
 *   - Human-in-the-loop (waits for approval signal)
 *   - Retry + compensation (saga pattern)
 *   - Sub-workflow delegation
 *   - State queryable at any point
 */

import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  sleep,
  continueAsNew,
  workflowInfo,
} from "@temporalio/workflow";

import type * as activities from "../activities/index.js";

// ── Activity proxy ────────────────────────────────────────────────────────────

const {
  executeAIStep,
  executeCodeStep,
  executeHTTPStep,
  executeTransformStep,
  executeDecisionStep,
  executeSubWorkflowStep,
  recordStepResult,
  sendHumanApprovalRequest,
  applyCompensation,
  updateExecutionStatus,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "30 minutes",
  retry: {
    maximumAttempts:  5,
    backoffCoefficient: 2,
    initialInterval:  "1s",
    maximumInterval:  "30s",
    nonRetryableErrorTypes: ["ValidationError", "ForbiddenError", "QuotaExceededError"],
  },
});

// ── Signals ───────────────────────────────────────────────────────────────────

export const approvalSignal  = defineSignal<[{ approved: boolean; comment?: string; approvedBy: string }]>("approval");
export const cancelSignal    = defineSignal<[]>("cancel");
export const pauseSignal     = defineSignal<[]>("pause");
export const resumeSignal    = defineSignal<[]>("resume");

// ── Queries ───────────────────────────────────────────────────────────────────

export const stateQuery      = defineQuery<WorkflowState>("state");
export const currentStepQuery = defineQuery<string | null>("currentStep");

// ── Types ─────────────────────────────────────────────────────────────────────

export type StepType =
  | "ai_prompt" | "code" | "http_request" | "transform"
  | "decision" | "human_in_the_loop" | "subworkflow" | "delay";

export interface WorkflowStep {
  id:          string;
  type:        StepType;
  name:        string;
  config:      Record<string, unknown>;
  dependsOn?:  string[];
  retryPolicy?: { maxAttempts: number; backoffMs: number };
  timeout?:    string;
}

export interface WorkflowInput {
  workflowId:  string;
  executionId: string;
  orgId:       string;
  userId?:     string;
  input:       Record<string, unknown>;
  steps:       WorkflowStep[];
  testMode:    boolean;
}

export interface StepResult {
  stepId:     string;
  status:     "completed" | "failed" | "skipped";
  output?:    unknown;
  error?:     string;
  durationMs: number;
  startedAt:  string;
}

export interface WorkflowState {
  executionId:  string;
  status:       "running" | "paused" | "cancelled" | "completed" | "failed";
  currentStep:  string | null;
  completedSteps: string[];
  failedSteps:  string[];
  stepResults:  StepResult[];
  startedAt:    string;
  variables:    Record<string, unknown>;
}

// ── Workflow ──────────────────────────────────────────────────────────────────

export async function cerebroWorkflow(input: WorkflowInput): Promise<{ output: unknown; stepResults: StepResult[] }> {
  // ── State ─────────────────────────────────────────────────────────────────

  const state: WorkflowState = {
    executionId:    input.executionId,
    status:         "running",
    currentStep:    null,
    completedSteps: [],
    failedSteps:    [],
    stepResults:    [],
    startedAt:      new Date().toISOString(),
    variables:      { ...input.input },
  };

  let pendingApproval: { approved: boolean; comment?: string; approvedBy: string } | null = null;
  let cancelled = false;
  let paused    = false;

  // ── Signal handlers ───────────────────────────────────────────────────────

  setHandler(approvalSignal, (data) => { pendingApproval = data; });
  setHandler(cancelSignal,   () => { cancelled = true; state.status = "cancelled"; });
  setHandler(pauseSignal,    () => { paused = true; });
  setHandler(resumeSignal,   () => { paused = false; });

  // ── Query handlers ────────────────────────────────────────────────────────

  setHandler(stateQuery,       () => ({ ...state }));
  setHandler(currentStepQuery, () => state.currentStep);

  // ── Update execution to RUNNING ───────────────────────────────────────────

  await updateExecutionStatus({
    executionId: input.executionId,
    orgId:       input.orgId,
    status:      "RUNNING",
  });

  // ── Step execution ────────────────────────────────────────────────────────

  const stepResultMap = new Map<string, StepResult>();
  const completedIds  = new Set<string>();

  const executeStep = async (step: WorkflowStep): Promise<StepResult> => {
    // Check cancellation
    if (cancelled) {
      return {
        stepId:     step.id,
        status:     "skipped",
        durationMs: 0,
        startedAt:  new Date().toISOString(),
      };
    }

    // Pause support
    if (paused) {
      await condition(() => !paused || cancelled, "24h");
    }

    state.currentStep = step.id;
    const startedAt = Date.now();

    try {
      let output: unknown;

      switch (step.type) {
        case "ai_prompt":
          output = await executeAIStep({
            stepId:      step.id,
            config:      step.config,
            variables:   state.variables,
            orgId:       input.orgId,
            executionId: input.executionId,
            testMode:    input.testMode,
          });
          break;

        case "code":
          output = await executeCodeStep({
            stepId:    step.id,
            config:    step.config,
            variables: state.variables,
          });
          break;

        case "http_request":
          output = await executeHTTPStep({
            stepId:    step.id,
            config:    step.config,
            variables: state.variables,
          });
          break;

        case "transform":
          output = await executeTransformStep({
            stepId:    step.id,
            config:    step.config,
            variables: state.variables,
          });
          break;

        case "decision":
          output = await executeDecisionStep({
            stepId:    step.id,
            config:    step.config,
            variables: state.variables,
          });
          break;

        case "subworkflow":
          output = await executeSubWorkflowStep({
            stepId:      step.id,
            config:      step.config,
            variables:   state.variables,
            orgId:       input.orgId,
            executionId: input.executionId,
          });
          break;

        case "human_in_the_loop": {
          // Notify approvers + wait for signal (up to 7 days)
          pendingApproval = null;

          await sendHumanApprovalRequest({
            stepId:      step.id,
            config:      step.config,
            variables:   state.variables,
            orgId:       input.orgId,
            executionId: input.executionId,
            workflowId:  input.workflowId,
          });

          const approved = await condition(
            () => pendingApproval !== null || cancelled,
            "7 days",
          );

          if (!approved || cancelled || !pendingApproval) {
            throw Object.assign(new Error("Human approval timed out or workflow cancelled"), {
              __type: "ApprovalTimeout",
            });
          }

          if (!pendingApproval.approved) {
            throw Object.assign(new Error("Human approval rejected"), {
              __type: "ApprovalRejected",
              comment: pendingApproval.comment,
              rejectedBy: pendingApproval.approvedBy,
            });
          }

          output = { approved: true, approvedBy: pendingApproval.approvedBy, comment: pendingApproval.comment };
          break;
        }

        case "delay": {
          const delayMs = (step.config["delayMs"] as number | undefined) ?? 1000;
          await sleep(delayMs);
          output = { delayed: delayMs };
          break;
        }

        default:
          throw new Error(`Unknown step type: ${String(step.type)}`);
      }

      // Merge step output into shared variables
      if (output && typeof output === "object") {
        Object.assign(state.variables, { [`step_${step.id}`]: output });
      }

      const result: StepResult = {
        stepId:     step.id,
        status:     "completed",
        output,
        durationMs: Date.now() - startedAt,
        startedAt:  new Date(startedAt).toISOString(),
      };

      await recordStepResult({ executionId: input.executionId, result });
      state.completedSteps.push(step.id);
      completedIds.add(step.id);

      return result;
    } catch (err) {
      const result: StepResult = {
        stepId:     step.id,
        status:     "failed",
        error:      err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
        startedAt:  new Date(startedAt).toISOString(),
      };

      await recordStepResult({ executionId: input.executionId, result });
      state.failedSteps.push(step.id);

      return result;
    }
  };

  // ── Topological execution with parallelism ────────────────────────────────

  const steps      = input.steps;
  const remaining  = new Set(steps.map(s => s.id));

  while (remaining.size > 0 && !cancelled) {
    // Find steps whose dependencies are all complete
    const ready = steps.filter(s =>
      remaining.has(s.id) &&
      (s.dependsOn ?? []).every(dep => completedIds.has(dep))
    );

    if (ready.length === 0) break; // No progress possible (cyclic dep or all blocked)

    // Execute all ready steps in parallel
    const results = await Promise.all(ready.map(executeStep));

    for (const result of results) {
      state.stepResults.push(result);
      stepResultMap.set(result.stepId, result);
      remaining.delete(result.stepId);

      // If any step failed and we're not in test mode, apply compensation
      if (result.status === "failed" && !input.testMode) {
        state.status = "failed";
        await applyCompensation({
          executionId:    input.executionId,
          failedStepId:   result.stepId,
          completedSteps: state.completedSteps,
          orgId:          input.orgId,
        });
        break;
      }
    }

    if (state.status === "failed") break;
  }

  // ── Finalize ──────────────────────────────────────────────────────────────

  const finalStatus = cancelled ? "CANCELLED"
                    : state.failedSteps.length > 0 ? "FAILED"
                    : "COMPLETED";

  state.status    = finalStatus.toLowerCase() as WorkflowState["status"];
  state.currentStep = null;

  await updateExecutionStatus({
    executionId: input.executionId,
    orgId:       input.orgId,
    status:      finalStatus,
    stepResults: state.stepResults,
    output:      state.variables,
    completedAt: new Date().toISOString(),
  });

  return {
    output:      state.variables,
    stepResults: state.stepResults,
  };
}
