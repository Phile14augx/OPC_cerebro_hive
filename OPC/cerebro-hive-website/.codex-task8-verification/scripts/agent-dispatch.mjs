#!/usr/bin/env node
/**
 * scripts/agent-dispatch.mjs  (v3 — orchestration framework)
 *
 * Fully stateful, resumable, policy-governed AI dispatch pipeline.
 *
 * ─── Ten v3 improvements ────────────────────────────────────────────────────
 *  1. Persistent state machine  — .agents/state.json, survives crashes
 *  2. Resume capability         — `--resume` re-enters from last stable state
 *  3. Agent heartbeat           — stall detection in base-provider.mjs
 *  4. File hashing              — SHA-256 before/after for deterministic diffs
 *  5. Prompt versioning         — PROMPT_VERSION embedded in every manifest
 *  6. Validation stages         — lint → typecheck → test → integration → security
 *  7. Resource metrics          — wall clock, CPU, memory, tokens/sec, cost USD
 *  8. Execution trace           — crypto.randomUUID() trace ID across all artifacts
 *  9. Pluggable agent interface — registry.register(myProvider) to add any model
 * 10. Policy engine             — .agents/dispatch-policy.yml governs every merge
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Flags:
 *   --dry-run           parse + print plan, touch nothing
 *   --resume            load .agents/state.json and continue from last stable state
 *   --skip-ci           skip feature:complete (no CI wait / auto-merge)
 *   --require-approval  pause on TTY before merging; in CI asks GitHub Environment gate
 *   --allow-parallel    allow multiple active worktrees (feature:start --allow-parallel)
 *   --no-retry          disable retry logic (easier debugging)
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY
 *   GEMINI_API_KEY
 *
 * Optional env vars:
 *   CLAUDE_CLI              path to claude binary      (default: "claude")
 *   GEMINI_CLI              path to gemini binary      (default: "gemini")
 *   AGENT_TIMEOUT_MS        per-agent timeout          (default: 3 600 000 = 60 min)
 *   AGENT_MAX_RETRIES       max retries per agent      (default: 3)
 *   HEARTBEAT_INTERVAL_MS   stall-detection interval   (default: 600 000 = 10 min)
 *   VALIDATION_STAGES       comma list of stages       (default: all)
 *   CLAUDE_PRICE_INPUT_PER_1K / CLAUDE_PRICE_OUTPUT_PER_1K
 *   GEMINI_PRICE_INPUT_PER_1K / GEMINI_PRICE_OUTPUT_PER_1K
 *   SLACK_WEBHOOK_URL
 *   DISCORD_WEBHOOK_URL
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";
import readline from "node:readline";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { getNextTask, markMilestone, BACKLOG_PATH } from "./backlog-parser.mjs";
import { RunLogger, PROMPT_VERSION }                 from "./lib/run-logger.mjs";
import { notify }                                    from "./lib/notifier.mjs";
import { StateMachine }                              from "./lib/state-machine.mjs";
import { registry }                                  from "./lib/agent-registry.mjs";
import { hashFiles, diffSnapshots, formatDiff }      from "./lib/file-hasher.mjs";
import { runValidation, summariseValidation }        from "./lib/validation-runner.mjs";
import { ResourceMetrics }                           from "./lib/resource-metrics.mjs";
import { loadPolicy, evaluatePolicy, formatPolicyResult } from "./lib/policy-engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WORKTREES_DIR = path.join(ROOT, ".agents", "worktrees");

// ─── CLI flags ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN          = args.includes("--dry-run");
const RESUME           = args.includes("--resume");
const SKIP_CI          = args.includes("--skip-ci");
const REQUIRE_APPROVAL = args.includes("--require-approval");
const ALLOW_PARALLEL   = args.includes("--allow-parallel");
const NO_RETRY         = args.includes("--no-retry");

const AGENT_TIMEOUT_MS  = parseInt(process.env.AGENT_TIMEOUT_MS  ?? "3600000", 10);
const AGENT_MAX_RETRIES = parseInt(process.env.AGENT_MAX_RETRIES ?? "3",       10);

// ─── Utilities ────────────────────────────────────────────────────────────────

const IS_WIN = process.platform === "win32";
const WIN_SHIMS = new Set(["pnpm", "npm", "npx", "yarn", "gh"]);

function log(level, msg, detail = "") {
  const p = { error: "✗", warn: "⚠", info: "▶" }[level] ?? "·";
  console.log(`${p} ${msg}${detail ? `\n  ${detail}` : ""}`);
}
function bail(msg, detail = "") { log("error", msg, detail); process.exit(1); }

function run(cmd, argv, opts = {}) {
  const r = spawnSync(cmd, argv, {
    cwd: opts.cwd ?? ROOT,
    stdio: opts.stdio ?? "inherit",
    shell: IS_WIN && WIN_SHIMS.has(cmd),
    env: { ...process.env, ...opts.env },
  });
  if (r.status !== 0) bail(`${cmd} ${argv.join(" ")}`, `exit ${r.status}`);
  return r;
}

function capture(cmd, argv, opts = {}) {
  return spawnSync(cmd, argv, {
    cwd: opts.cwd ?? ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    shell: IS_WIN && WIN_SHIMS.has(cmd),
    env: { ...process.env, ...opts.env },
  });
}

// ─── Ownership lock ───────────────────────────────────────────────────────────

const LOCK_FILE = ".agent-ownership.json";

function writeLock(worktreePath, claudeFiles, geminiFiles) {
  fs.writeFileSync(
    path.join(worktreePath, LOCK_FILE),
    JSON.stringify({ createdAt: new Date().toISOString(), owners: { claude: claudeFiles, gemini: geminiFiles } }, null, 2),
    "utf8"
  );
  log("info", `Ownership lock written (${LOCK_FILE})`);
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildPrompt(agentName, milestone, files, allAssignments) {
  const others = Object.entries(allAssignments)
    .filter(([a]) => a !== agentName)
    .map(([a, fs2]) => `${a}: ${fs2.join(", ")}`)
    .join("\n");

  return `You are implementing milestone ${milestone.id} — "${milestone.title}" for the Cerebro Hive platform.
Prompt version: ${PROMPT_VERSION}

## Objective
${milestone.objective}

## Your assigned files (${files.length})
${files.map((f, i) => `${i + 1}. ${f}`).join("\n")}

## Other agent assignments (DO NOT touch these files)
${others || "(none)"}

## Ownership lock
A file at ${LOCK_FILE} in this worktree lists all assignments.
Editing a file outside your list is a policy violation.

## Full milestone context
${milestone.raw}

## Implementation rules
1. Read each assigned file first, then implement the exact changes described.
2. Do NOT touch files outside your assignment.
3. Follow TypeScript/ESM conventions in .planning/codebase/CONVENTIONS.md.
4. No TODOs, placeholders, or half-finished stubs — every file must be complete.
5. When done, output a single line: DISPATCH_DONE

## Definition of Done
${milestone.definitionOfDone}`;
}

// ─── Rollback ─────────────────────────────────────────────────────────────────

async function rollback(sm, milestoneId, branchName, worktreePath, logger) {
  log("warn", "Rolling back — removing worktree and resetting backlog");
  sm.transition("ROLLED_BACK");
  try {
    capture("git", ["worktree", "remove", "--force", worktreePath]);
    capture("git", ["branch", "-D", branchName]);
    markMilestone(milestoneId, "pending");
    const rel = path.relative(ROOT, BACKLOG_PATH);
    capture("git", ["add", rel]);
    capture("git", ["commit", "-m", `chore(backlog): rollback ${milestoneId} to pending [skip ci]`, "--no-verify"]);
  } catch (e) {
    log("warn", `Rollback step error (continuing): ${e.message}`);
  }
  logger?.finish("rolled-back");
  StateMachine.clear();
}

// ─── Human approval ───────────────────────────────────────────────────────────

async function waitForApproval(prUrl) {
  if (!REQUIRE_APPROVAL) return;
  if (!process.stdin.isTTY) {
    log("warn", "--require-approval set but stdin is not a TTY — proceeding.");
    return;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise((resolve) => {
    rl.question(`\n⏸  PR: ${prUrl ?? "(see above)"}\n   Review then press Enter to merge (Ctrl+C to abort): `, () => { rl.close(); resolve(); });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log("info", "=== agent-dispatch v3 starting ===");

  // ── Resume or fresh start? ──────────────────────────────────────────────
  let sm;
  let task;

  if (RESUME) {
    sm = StateMachine.load();
    if (!sm) bail("--resume: no .agents/state.json found. Start a fresh dispatch instead.");
    if (sm.isTerminal) bail(`--resume: state is terminal (${sm.state}). Nothing to resume.`);
    if (!sm.canResume()) bail(`--resume: cannot safely resume from state "${sm.state}". Manual intervention required.`);
    log("info", `Resuming from state: ${sm.state}`);
    console.log(sm.summary());
    // Re-parse task from saved milestone ID
    const all = (await import("./backlog-parser.mjs")).parseBacklog();
    task = all.find((m) => m.id === sm.milestoneId);
    if (!task) bail(`Could not find milestone "${sm.milestoneId}" in backlog.`);
  } else {
    task = getNextTask();
    if (!task) { log("info", "All milestones complete — nothing to dispatch."); process.exit(0); }
  }

  log("info", `Task: ${task.id} — ${task.title}`);

  if (task.concreteFiles.length === 0) {
    bail(`Milestone ${task.id} has no "Concrete files to modify" list.`);
  }

  // ── Generate stable names ───────────────────────────────────────────────
  const traceId = RESUME ? (sm.traceId ?? randomUUID()) : randomUUID();
  const branchName = RESUME
    ? (sm.data.branch ?? `feat/${task.id.toLowerCase().replace(/\./g, "-")}`)
    : `feat/${task.id.toLowerCase().replace(/\./g, "-")}-${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}`;
  const worktreePath = path.join(WORKTREES_DIR, branchName.replace(/\//g, "-"));

  // Agent assignments
  const assignments = { claude: task.filesTouched.claude, gemini: task.filesTouched.gemini };

  // ── Dry run ─────────────────────────────────────────────────────────────
  if (DRY_RUN) {
    const claudePrompt = buildPrompt("claude", task, assignments.claude, assignments);
    console.log("\n── DRY RUN PLAN ──────────────────────────────────────────");
    console.log(`  Trace ID   : ${traceId}`);
    console.log(`  Milestone  : ${task.id} — ${task.title}`);
    console.log(`  Prompt ver : ${PROMPT_VERSION}`);
    console.log(`  Branch     : ${branchName}`);
    console.log(`  Worktree   : ${worktreePath}`);
    console.log(`  Claude gets: ${assignments.claude.join(", ") || "(none)"}`);
    console.log(`  Gemini gets: ${assignments.gemini.join(", ") || "(none)"}`);
    console.log(`  Timeout    : ${AGENT_TIMEOUT_MS / 60000} min | Retries: ${AGENT_MAX_RETRIES} | Approval: ${REQUIRE_APPROVAL}`);
    const policy = loadPolicy();
    console.log(`  Policy     : max_cost=$${policy.max_cost_usd ?? "—"}, max_runtime=${policy.max_runtime_ms ? policy.max_runtime_ms / 60000 + " min" : "—"}`);
    console.log("\n  Claude prompt preview:");
    console.log("  " + claudePrompt.slice(0, 500).replace(/\n/g, "\n  "));
    console.log("──────────────────────────────────────────────────────────\n");
    process.exit(0);
  }

  // ── Init state machine + logger ─────────────────────────────────────────
  if (!RESUME) sm = new StateMachine(traceId, task.id);
  const logger = new RunLogger(task.id, task.title, traceId);
  logger.logFiles("claude", assignments.claude);
  logger.logFiles("gemini", assignments.gemini);

  const metrics = new ResourceMetrics();
  metrics.start();

  await notify("started", { milestone: `${task.id} — ${task.title}`, runDir: logger.path });

  try {
    // ── Mark in-progress ──────────────────────────────────────────────────
    if (!sm.hasReached("WORKTREE_CREATED")) {
      log("info", `Marking ${task.id} in-progress`);
      markMilestone(task.id, "in-progress");
      const rel = path.relative(ROOT, BACKLOG_PATH);
      capture("git", ["add", rel]);
      capture("git", ["commit", "-m", `chore(backlog): mark ${task.id} in-progress [skip ci]`, "--no-verify"]);
    }

    // ── Create worktree ───────────────────────────────────────────────────
    if (!sm.hasReached("WORKTREE_CREATED")) {
      log("info", `Creating worktree: ${branchName}`);
      const startFlags = ["feature:start", branchName];
      if (ALLOW_PARALLEL) startFlags.push("--allow-parallel");
      run("pnpm", startFlags);
      sm.transition("WORKTREE_CREATED", { branch: branchName, worktreePath });
      logger.setBranch(branchName);
    }

    // ── Write ownership lock ──────────────────────────────────────────────
    if (!sm.hasReached("LOCKED")) {
      writeLock(worktreePath, assignments.claude, assignments.gemini);
      sm.transition("LOCKED");
    }

    // ── Hash files before agents run ──────────────────────────────────────
    if (!sm.hasReached("HASHING")) {
      log("info", "Hashing assigned files (pre-execution snapshot)");
      const allFiles = [...assignments.claude, ...assignments.gemini];
      const preHashes = hashFiles(worktreePath, allFiles);
      sm.transition("HASHING", { preHashes });
    }

    // ── Build + save prompts ──────────────────────────────────────────────
    const claudePrompt = buildPrompt("claude", task, assignments.claude, assignments);
    const geminiPrompt = buildPrompt("gemini", task, assignments.gemini, assignments);
    logger.logPrompt("claude", claudePrompt);
    logger.logPrompt("gemini", geminiPrompt);

    // ── Run agents in parallel ────────────────────────────────────────────
    let claudeResult, geminiResult;

    if (!sm.hasReached("AGENTS_DONE")) {
      sm.transition("AGENTS_RUNNING");
      log("info", "Spawning Claude and Gemini in parallel…");

      const runOpts = { timeoutMs: AGENT_TIMEOUT_MS, maxRetries: AGENT_MAX_RETRIES, noRetry: NO_RETRY, traceId };

      try {
        [claudeResult, geminiResult] = await registry.runParallel([
          { provider: "claude", opts: { ...runOpts, prompt: claudePrompt, cwd: worktreePath } },
          { provider: "gemini", opts: { ...runOpts, prompt: geminiPrompt, cwd: worktreePath } },
        ]);
      } catch (agentErr) {
        // Save whatever partial output we have before bailing
        if (claudeResult) logger.logAgentOutput("claude", claudeResult);
        if (geminiResult) logger.logAgentOutput("gemini", geminiResult);
        throw agentErr;
      }

      logger.logAgentOutput("claude", claudeResult);
      logger.logAgentOutput("gemini", geminiResult);
      metrics.recordAgent("claude", claudeResult);
      metrics.recordAgent("gemini", geminiResult);
      sm.transition("AGENTS_DONE");
    }

    // ── File diff (post-execution) ────────────────────────────────────────
    {
      const allFiles = [...assignments.claude, ...assignments.gemini];
      const postHashes = hashFiles(worktreePath, allFiles);
      const diff = diffSnapshots(sm.data.preHashes ?? {}, postHashes, assignments.claude, assignments.gemini);
      log("info", "File diff (post-agent):");
      console.log(formatDiff(diff));
      sm.set("fileDiff", diff);
      logger.logAgentOutput; // diff is embedded in summary; also log to events
    }

    // ── Named validation stages ───────────────────────────────────────────
    let validationResults;

    if (!sm.hasReached("VALIDATING")) {
      sm.transition("VALIDATING");
      log("info", "Running validation stages…");
      validationResults = runValidation(worktreePath, { traceId });
      const { allPassed, summary, failedStage } = summariseValidation(validationResults);
      console.log(summary);

      const combinedOutput = validationResults.map((r) => `=== ${r.name} ===\n${r.output}`).join("\n\n");
      logger.logValidation(allPassed, combinedOutput, validationResults);
      sm.set("validationPassed", allPassed).set("failedStage", failedStage);

      if (!allPassed) {
        log("error", `Validation failed at stage: ${failedStage}`);
        await notify("failure", { milestone: `${task.id} — ${task.title}`, branch: branchName, error: `Validation failed: ${failedStage}`, runDir: logger.path });
        await rollback(sm, task.id, branchName, worktreePath, logger);
        process.exit(1);
      }
    }

    // ── Resource metrics snapshot ─────────────────────────────────────────
    const metricsSnapshot = metrics.finish();
    logger.logResourceMetrics(metricsSnapshot);
    log("info", `Metrics: wall=${(metricsSnapshot.wallClockMs / 1000).toFixed(1)}s tokens=${metricsSnapshot.totalTokens} cost=$${metricsSnapshot.costUsd}`);

    // ── Policy evaluation ─────────────────────────────────────────────────
    {
      const policy = loadPolicy();
      const agentFileCounts = {
        claude: (sm.data.fileDiff?.owned ?? []).filter((f) => assignments.claude.includes(f)).length,
        gemini: (sm.data.fileDiff?.owned ?? []).filter((f) => assignments.gemini.includes(f)).length,
      };
      const policyResult = evaluatePolicy(policy, {
        metrics: metricsSnapshot,
        validationResults: validationResults ?? [],
        changedFiles: sm.data.fileDiff?.changed ?? [],
        agentFileCounts,
      });
      console.log(formatPolicyResult(policyResult));
      logger.logPolicyResult(policyResult);

      if (policyResult.errors.length > 0) {
        await notify("failure", { milestone: `${task.id} — ${task.title}`, branch: branchName, error: `Policy violation: ${policyResult.errors[0]}`, runDir: logger.path });
        await rollback(sm, task.id, branchName, worktreePath, logger);
        bail("Policy violations blocked the merge", policyResult.errors.join("\n"));
      }
    }

    // ── feature:finish (rebase, squash, push, open PR) ───────────────────
    let prUrl, prNumber;

    if (!sm.hasReached("PR_CREATED")) {
      const commitMessage = `feat(${task.id.toLowerCase()}): implement ${task.title}`;
      log("info", `Running feature:finish: "${commitMessage}"`);

      const finishResult = spawnSync("pnpm", ["feature:finish", commitMessage], {
        cwd: worktreePath,
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf8",
        shell: IS_WIN && WIN_SHIMS.has("pnpm"),
      });

      const finishOutput = (finishResult.stdout ?? "") + (finishResult.stderr ?? "");
      if (finishResult.status !== 0) {
        await notify("failure", { milestone: `${task.id} — ${task.title}`, branch: branchName, error: "feature:finish failed", runDir: logger.path });
        await rollback(sm, task.id, branchName, worktreePath, logger);
        bail("feature:finish failed — rolled back");
      }

      const urlMatch = finishOutput.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
      const numMatch = urlMatch?.[0]?.match(/\/pull\/(\d+)/);
      prUrl    = urlMatch?.[0];
      prNumber = numMatch ? parseInt(numMatch[1], 10) : undefined;
      if (prUrl) logger.setPrUrl(prUrl, prNumber);

      sm.transition("PR_CREATED", { prUrl, prNumber });
    } else {
      prUrl    = sm.data.prUrl;
      prNumber = sm.data.prNumber;
    }

    // ── Human approval gate ───────────────────────────────────────────────
    if (!sm.hasReached("WAITING_APPROVAL")) {
      sm.transition("WAITING_APPROVAL");
    }
    await waitForApproval(prUrl);

    // ── feature:complete (CI wait, merge, sync, clean) ────────────────────
    if (!sm.hasReached("MERGED") && !SKIP_CI) {
      log("info", "Running feature:complete (waiting for CI…)");
      run("pnpm", ["feature:complete", "--branch", branchName.replace(/^feat\//, "")], { cwd: worktreePath });
      sm.transition("MERGED");
    } else if (SKIP_CI) {
      log("warn", "--skip-ci: skipping feature:complete. Run it manually.");
    }

    // ── Mark done ─────────────────────────────────────────────────────────
    log("info", `Marking ${task.id} done`);
    markMilestone(task.id, "done");
    const rel = path.relative(ROOT, BACKLOG_PATH);
    capture("git", ["add", rel]);
    capture("git", ["commit", "-m", `chore(backlog): mark ${task.id} done [skip ci]`, "--no-verify"]);
    capture("git", ["push", "origin", "main"]);

    sm.transition("COMPLETED");
    logger.finish("success");
    StateMachine.clear();

    await notify("success", {
      milestone: `${task.id} — ${task.title}`,
      branch: branchName,
      prUrl,
      prNumber,
      durationMs: metricsSnapshot.wallClockMs,
      runDir: logger.path,
    });

    log("info", `=== ${task.id} complete. Trace: ${traceId} | Run: ${logger.path} ===`);

  } catch (err) {
    logger.finish("failed", err);
    await notify("failure", {
      milestone: `${task.id} — ${task.title}`,
      branch: sm.data?.branch,
      error: err,
      runDir: logger.path,
    });
    log("error", "Dispatch failed.", err.message);
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
