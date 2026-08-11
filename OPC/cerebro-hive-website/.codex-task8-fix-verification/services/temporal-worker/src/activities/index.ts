/**
 * Temporal activities — all concrete work units
 * Activities run in the worker process (not the sandboxed workflow runtime).
 * They can do I/O, use npm modules, call external APIs, etc.
 */

import { ApplicationFailure } from "@temporalio/activity";
import { executionRepository } from "@cerebro/db";
import { getPlatformApiConfig } from "@cerebro/config";

const cfg = getPlatformApiConfig();

// ── Types shared with the workflow ────────────────────────────────────────────

interface StepContext {
  stepId:    string;
  config:    Record<string, unknown>;
  variables: Record<string, unknown>;
}

interface AIStepContext extends StepContext {
  orgId:       string;
  executionId: string;
  testMode:    boolean;
}

interface StepResult {
  stepId:     string;
  status:     "completed" | "failed" | "skipped";
  output?:    unknown;
  error?:     string;
  durationMs: number;
  startedAt:  string;
}

// ── AI activity ───────────────────────────────────────────────────────────────

export async function executeAIStep(ctx: AIStepContext): Promise<unknown> {
  const {
    model        = "claude-sonnet-4-6",
    prompt       = "",
    systemPrompt = "",
    maxTokens    = 4096,
    temperature  = 0.7,
  } = ctx.config as {
    model?:        string;
    prompt?:       string;
    systemPrompt?: string;
    maxTokens?:    number;
    temperature?:  number;
  };

  // Interpolate variables into prompt
  const interpolatedPrompt = interpolateVars(prompt, ctx.variables);

  if (ctx.testMode) {
    return { text: `[TEST] AI response for step ${ctx.stepId}`, model, tokens: 0 };
  }

  const res = await fetch(`${cfg.AI_GATEWAY_URL}/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Org-ID":     ctx.orgId,
      "X-Step-ID":    ctx.stepId,
      "X-Exec-ID":    ctx.executionId,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: interpolatedPrompt }],
      ...(systemPrompt && { system: systemPrompt }),
      max_tokens:  maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw ApplicationFailure.nonRetryable(
      `AI gateway error: ${err.message ?? res.statusText}`,
      "AIProviderError",
    );
  }

  const data = await res.json() as {
    content?:      Array<{ text?: string }>;
    usage?:        { input_tokens: number; output_tokens: number };
    model?:        string;
  };

  return {
    text:   data.content?.[0]?.text ?? "",
    model:  data.model ?? model,
    tokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    usage:  data.usage,
  };
}

// ── Code activity ─────────────────────────────────────────────────────────────

export async function executeCodeStep(ctx: StepContext): Promise<unknown> {
  const { code = "", language = "javascript" } = ctx.config as { code?: string; language?: string };

  if (language !== "javascript" && language !== "typescript") {
    throw ApplicationFailure.nonRetryable(`Unsupported language: ${language}`, "ValidationError");
  }

  // Sandboxed execution via vm (simple use-case: pure transforms)
  const { runInNewContext } = await import("node:vm");
  const script = `(function(variables) { ${code} })(variables)`;

  try {
    const result = runInNewContext(script, { variables: { ...ctx.variables } }, {
      timeout:     5000, // 5s hard limit
      displayErrors: true,
    });
    return result;
  } catch (err) {
    throw ApplicationFailure.retryable(`Code execution failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ── HTTP activity ─────────────────────────────────────────────────────────────

export async function executeHTTPStep(ctx: StepContext): Promise<unknown> {
  const {
    url     = "",
    method  = "GET",
    headers = {},
    body,
    timeoutMs = 30_000,
  } = ctx.config as {
    url?:       string;
    method?:    string;
    headers?:   Record<string, string>;
    body?:      unknown;
    timeoutMs?: number;
  };

  const interpolatedUrl = interpolateVars(url, ctx.variables);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(interpolatedUrl, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      signal: controller.signal,
    });

    const responseBody = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(responseBody); } catch { parsed = responseBody; }

    return {
      status:  res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body:    parsed,
      ok:      res.ok,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Transform activity ────────────────────────────────────────────────────────

export async function executeTransformStep(ctx: StepContext): Promise<unknown> {
  const { expression = "", outputKey } = ctx.config as { expression?: string; outputKey?: string };

  const fn = new Function("variables", `"use strict"; return (${expression})`);
  const result = fn(ctx.variables) as unknown;

  if (outputKey) return { [outputKey]: result };
  return result;
}

// ── Decision activity ─────────────────────────────────────────────────────────

export async function executeDecisionStep(ctx: StepContext): Promise<unknown> {
  const { condition: condExpr = "true" } = ctx.config as { condition?: string };

  const fn = new Function("variables", `"use strict"; return !!(${condExpr})`);
  const result = fn(ctx.variables) as boolean;

  return { decision: result, condition: condExpr };
}

// ── Sub-workflow activity ─────────────────────────────────────────────────────

export async function executeSubWorkflowStep(ctx: AIStepContext): Promise<unknown> {
  const { workflowId, input = {} } = ctx.config as { workflowId?: string; input?: Record<string, unknown> };

  if (!workflowId) throw ApplicationFailure.nonRetryable("workflowId is required for subworkflow step", "ValidationError");

  // Trigger via platform-api
  const res = await fetch(`${cfg.AI_GATEWAY_URL.replace("4010", "4000")}/v1/workflows/${workflowId}/execute`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ input: { ...ctx.variables, ...input }, parentExecutionId: ctx.executionId }),
  });

  if (!res.ok) throw ApplicationFailure.retryable(`Sub-workflow trigger failed: ${res.statusText}`);

  const data = await res.json() as { id: string };
  return { subExecutionId: data.id, workflowId };
}

// ── Human approval activity ───────────────────────────────────────────────────

export async function sendHumanApprovalRequest(ctx: {
  stepId:      string;
  config:      Record<string, unknown>;
  variables:   Record<string, unknown>;
  orgId:       string;
  executionId: string;
  workflowId:  string;
}): Promise<void> {
  const { approvers = [], message = "Approval required" } = ctx.config as {
    approvers?: string[];
    message?:   string;
  };

  // In production: send email/Slack notification to approvers
  // Here we log it — integrate with notification service
  console.info("[approval] Pending approval:", {
    executionId: ctx.executionId,
    stepId:      ctx.stepId,
    approvers,
    message:     interpolateVars(message, ctx.variables),
  });
}

// ── Compensation activity ─────────────────────────────────────────────────────

export async function applyCompensation(ctx: {
  executionId:    string;
  failedStepId:   string;
  completedSteps: string[];
  orgId:          string;
}): Promise<void> {
  // Reverse completed steps (saga pattern) — in production, run compensating transactions
  console.info("[compensation] Applying rollback for execution", ctx.executionId, {
    failedStep:     ctx.failedStepId,
    completedSteps: ctx.completedSteps,
  });
}

// ── Status update activity ────────────────────────────────────────────────────

export async function recordStepResult(ctx: { executionId: string; result: StepResult }): Promise<void> {
  const execution = await executionRepository.findById(ctx.executionId, "system");
  if (!execution) return;

  const existing = (execution.stepExecutions as StepResult[] | null) ?? [];
  await executionRepository.update(ctx.executionId, {
    stepExecutions: [...existing, ctx.result],
  });
}

export async function updateExecutionStatus(ctx: {
  executionId: string;
  orgId:       string;
  status:      string;
  stepResults?: StepResult[];
  output?:     unknown;
  completedAt?: string;
}): Promise<void> {
  await executionRepository.update(ctx.executionId, {
    status:         ctx.status,
    ...(ctx.output      && { output:      ctx.output }),
    ...(ctx.stepResults && { stepExecutions: ctx.stepResults }),
    ...(ctx.completedAt && { completedAt: new Date(ctx.completedAt) }),
    ...(ctx.completedAt && { durationMs:  Date.now() - 0 }), // Will be set properly via start time
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function interpolateVars(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
    const val = variables[key.trim()];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}
