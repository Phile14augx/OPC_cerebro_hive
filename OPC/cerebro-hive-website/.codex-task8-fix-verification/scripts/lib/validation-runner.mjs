/**
 * scripts/lib/validation-runner.mjs
 *
 * Runs named validation stages sequentially.  Each stage is a pnpm script.
 * Results are returned as an array of StageResult so the manifest can record
 * exactly which phase failed.
 *
 * Default stages (configurable via VALIDATION_STAGES env var as comma list):
 *   lint → typecheck → test → test:integration → security
 *
 * Each stage can be:
 *   - skipped:  not listed in the active stages
 *   - passed:   exit code 0
 *   - failed:   exit code non-zero
 *   - skipped:  marked optional and failed (non-blocking)
 *
 * Usage:
 *   const results = await runValidation(worktreePath, { traceId });
 *   const allPassed = results.every(r => r.status === "passed" || r.status === "skipped");
 */

import { spawnSync } from "node:child_process";

const IS_WIN = process.platform === "win32";

/** Default ordered stages. Override with VALIDATION_STAGES=lint,typecheck,test */
export const DEFAULT_STAGES = [
  { name: "lint",             cmd: "lint",             optional: false },
  { name: "typecheck",        cmd: "typecheck",        optional: false },
  { name: "test",             cmd: "test",             optional: false },
  { name: "test:integration", cmd: "test:integration", optional: true  },
  { name: "security",         cmd: "validate:security",optional: true  },
];

/**
 * @typedef {{ name: string, status: "passed"|"failed"|"skipped", durationMs: number, output: string }} StageResult
 */

/**
 * Run all configured validation stages in the given worktree directory.
 *
 * @param {string} cwd  absolute path to the worktree
 * @param {{ traceId?: string, stages?: typeof DEFAULT_STAGES }} opts
 * @returns {StageResult[]}
 */
export function runValidation(cwd, opts = {}) {
  const { traceId = "", stages: customStages } = opts;

  // Allow env override: VALIDATION_STAGES=lint,typecheck,test
  const enabledNames = process.env.VALIDATION_STAGES
    ? new Set(process.env.VALIDATION_STAGES.split(",").map((s) => s.trim()))
    : null;

  const stages = (customStages ?? DEFAULT_STAGES).filter(
    (s) => enabledNames === null || enabledNames.has(s.name)
  );

  /** @type {StageResult[]} */
  const results = [];
  let aborted = false;

  for (const stage of stages) {
    if (aborted && !stage.optional) {
      results.push({ name: stage.name, status: "skipped", durationMs: 0, output: "Skipped (earlier stage failed)" });
      continue;
    }

    const label = `[validate:${stage.name}]`;
    process.stdout.write(`${label} starting…\n`);
    const t0 = Date.now();

    const result = spawnSync("pnpm", [stage.cmd], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      shell: IS_WIN,
      env: { ...process.env, AGENT_TRACE_ID: traceId },
    });

    const durationMs = Date.now() - t0;
    const output = ((result.stdout ?? "") + (result.stderr ?? "")).trim();
    const passed = result.status === 0;

    process.stdout.write(
      `${label} ${passed ? "✓ passed" : "✗ failed"} in ${(durationMs / 1000).toFixed(1)}s\n`
    );

    const status = passed ? "passed" : stage.optional ? "skipped" : "failed";
    results.push({ name: stage.name, status, durationMs, output });

    // Non-optional failure stops subsequent non-optional stages
    if (!passed && !stage.optional) aborted = true;
  }

  return results;
}

/**
 * Summarise stage results for the run log.
 * @param {StageResult[]} results
 * @returns {{ allPassed: boolean, summary: string, failedStage: string|null }}
 */
export function summariseValidation(results) {
  const failed = results.filter((r) => r.status === "failed");
  const allPassed = failed.length === 0;
  const rows = results.map(
    (r) => `  ${r.status === "passed" ? "✓" : r.status === "skipped" ? "–" : "✗"} ${r.name} (${(r.durationMs / 1000).toFixed(1)}s)`
  );
  return {
    allPassed,
    summary: rows.join("\n"),
    failedStage: failed[0]?.name ?? null,
  };
}
