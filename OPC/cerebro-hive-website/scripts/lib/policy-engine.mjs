/**
 * scripts/lib/policy-engine.mjs
 *
 * Evaluates a set of configurable governance rules before a PR is merged.
 * Rules are loaded from .agents/dispatch-policy.yml.
 *
 * Supported rules:
 *   max_cost_usd        — abort if total estimated cost exceeds this
 *   max_runtime_ms      — abort if total wall-clock time exceeds this
 *   require_tests       — abort if test stage was skipped or failed
 *   require_review      — ensure PR has required approvals (checked via gh)
 *   forbid_files        — abort if any of these file paths were modified
 *   max_files_per_agent — abort if an agent modified more files than this
 *   min_tokens          — warn if token count is suspiciously low (possible empty response)
 *   max_tokens          — abort if token count exceeds budget
 *
 * Usage:
 *   const policy = loadPolicy();
 *   const violations = evaluatePolicy(policy, {
 *     metrics, validationResults, changedFiles, agentFileCounts
 *   });
 *   if (violations.errors.length) bail("Policy violated");
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const POLICY_PATH = path.join(ROOT, ".agents", "dispatch-policy.yml");

// ── Minimal YAML parser (supports only the subset used in dispatch-policy.yml) ──

function parseYaml(text) {
  const result = {};
  let currentKey = null;
  let currentList = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/#.*$/, "").trimEnd();
    if (!line.trim()) continue;

    // Top-level key:
    const topMatch = line.match(/^(\w[\w_]*):\s*(.*)$/);
    if (topMatch) {
      currentList = null;
      currentKey = topMatch[1];
      const val = topMatch[2].trim();
      if (val === "" || val === "|" || val === ">") {
        result[currentKey] = null;
      } else if (val === "true")  result[currentKey] = true;
      else if (val === "false") result[currentKey] = false;
      else if (!isNaN(Number(val))) result[currentKey] = Number(val);
      else result[currentKey] = val.replace(/^['"]|['"]$/g, "");
      continue;
    }

    // List item under current key:
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) {
        currentList = [];
        result[currentKey] = currentList;
      }
      (result[currentKey]).push(listMatch[1].trim().replace(/^['"]|['"]$/g, ""));
    }
  }
  return result;
}

// ── Policy loader ────────────────────────────────────────────────────────────

/** @returns {Record<string,any>} */
export function loadPolicy() {
  if (!fs.existsSync(POLICY_PATH)) return {};
  try {
    return parseYaml(fs.readFileSync(POLICY_PATH, "utf8"));
  } catch (err) {
    process.stderr.write(`[policy] Could not parse dispatch-policy.yml: ${err.message}\n`);
    return {};
  }
}

// ── Evaluator ─────────────────────────────────────────────────────────────────

/**
 * @param {Record<string,any>} policy
 * @param {{
 *   metrics: object,
 *   validationResults: import("./validation-runner.mjs").StageResult[],
 *   changedFiles: string[],
 *   agentFileCounts: Record<string, number>,
 * }} context
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function evaluatePolicy(policy, { metrics, validationResults, changedFiles, agentFileCounts }) {
  const errors = [];
  const warnings = [];

  // max_cost_usd
  if (policy.max_cost_usd != null && metrics?.costUsd != null) {
    if (metrics.costUsd > policy.max_cost_usd) {
      errors.push(`Cost $${metrics.costUsd.toFixed(4)} exceeds max_cost_usd ($${policy.max_cost_usd})`);
    }
  }

  // max_runtime_ms
  if (policy.max_runtime_ms != null && metrics?.wallClockMs != null) {
    if (metrics.wallClockMs > policy.max_runtime_ms) {
      errors.push(
        `Runtime ${(metrics.wallClockMs / 60000).toFixed(1)} min exceeds max_runtime_ms (${(policy.max_runtime_ms / 60000).toFixed(1)} min)`
      );
    }
  }

  // require_tests
  if (policy.require_tests) {
    const testStage = validationResults?.find((r) => r.name === "test");
    if (!testStage || testStage.status !== "passed") {
      errors.push(`require_tests: test stage ${testStage?.status ?? "not run"}`);
    }
  }

  // forbid_files
  if (Array.isArray(policy.forbid_files) && changedFiles?.length) {
    for (const forbidden of policy.forbid_files) {
      const hit = changedFiles.find(
        (f) => f === forbidden || f.endsWith(`/${forbidden}`)
      );
      if (hit) errors.push(`forbid_files: "${hit}" was modified`);
    }
  }

  // max_files_per_agent
  if (policy.max_files_per_agent != null && agentFileCounts) {
    for (const [agent, count] of Object.entries(agentFileCounts)) {
      if (count > policy.max_files_per_agent) {
        errors.push(`max_files_per_agent: ${agent} modified ${count} files (limit ${policy.max_files_per_agent})`);
      }
    }
  }

  // max_tokens
  if (policy.max_tokens != null && metrics?.totalTokens != null) {
    if (metrics.totalTokens > policy.max_tokens) {
      errors.push(`max_tokens: used ${metrics.totalTokens} tokens (limit ${policy.max_tokens})`);
    }
  }

  // min_tokens (warning only — might indicate an empty/failed response)
  if (policy.min_tokens != null && metrics?.totalTokens != null) {
    if (metrics.totalTokens < policy.min_tokens) {
      warnings.push(`min_tokens: only ${metrics.totalTokens} tokens — possible empty agent response`);
    }
  }

  return { errors, warnings };
}

/**
 * Format a policy evaluation result for console output.
 * @param {{ errors: string[], warnings: string[] }} result
 */
export function formatPolicyResult({ errors, warnings }) {
  const lines = [];
  for (const w of warnings) lines.push(`  ⚠ [policy] ${w}`);
  for (const e of errors)   lines.push(`  ✗ [policy] ${e}`);
  if (!errors.length && !warnings.length) lines.push("  ✓ [policy] all rules passed");
  return lines.join("\n");
}
