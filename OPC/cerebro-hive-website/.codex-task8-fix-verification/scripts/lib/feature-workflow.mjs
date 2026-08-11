/**
 * scripts/lib/feature-workflow.mjs
 *
 * Shared primitives for scripts/feature-start.mjs, feature-finish.mjs,
 * and feature-complete.mjs — the CLI automation of the "Mandatory
 * Development Workflow" lifecycle documented in .agents/AGENTS.md.
 *
 * Design rules these scripts follow:
 *   - Fail safe: on any error, stop immediately and leave no partial
 *     git/GitHub state (rebases are aborted, no force-merge, no --admin).
 *   - Every step is logged to the console and appended as a structured
 *     JSONL record to .agents/logs/feature-workflow.log for audit.
 *   - No shell interpolation of user input — all subprocess args are
 *     passed as argv arrays, never concatenated into a shell string.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..");
export const WORKTREES_DIR = path.join(ROOT, ".agents", "worktrees");
const LOG_DIR = path.join(ROOT, ".agents", "logs");
const LOG_FILE = path.join(LOG_DIR, "feature-workflow.log");

export const COMMIT_TYPES = [
  "feat", "fix", "docs", "style", "refactor", "perf",
  "test", "build", "ci", "chore", "revert", "infra", "security",
];

export const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

// On Windows, package-manager CLIs are `.cmd` shims, not real .exe files.
// spawnSync can only launch a .cmd through cmd.exe, which means shell:true.
// That's only safe because every call site in this lib passes these commands
// nothing but static, hardcoded args ("run", "lint", etc.) — never a user- or
// git-derived string (branch names, commit messages) — those always go
// through `git`/`gh`, which are real .exe files spawned without a shell, so
// they can never be reinterpreted as shell syntax. Do not add a call that
// passes untrusted input to a WINDOWS_SHIM_COMMANDS command.
const WINDOWS_SHIM_COMMANDS = new Set(["pnpm", "npm", "npx", "yarn"]);
function needsShim(cmd) {
  return process.platform === "win32" && WINDOWS_SHIM_COMMANDS.has(cmd);
}

export class WorkflowError extends Error {
  constructor(message, { hint } = {}) {
    super(message);
    this.name = "WorkflowError";
    this.hint = hint;
  }
}

function ensureLogDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/** Append a structured, auditable record of one workflow step. */
export function logEvent(script, step, status, detail = "") {
  ensureLogDir();
  const record = { ts: new Date().toISOString(), script, step, status, detail };
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

let stepCounter = 0;

/** Print + log a step header. Call before doing the work for that step. */
export function step(script, description) {
  stepCounter += 1;
  console.log(`\n${c.bold(c.cyan(`▶ [${stepCounter}]`))} ${description}`);
  logEvent(script, description, "started");
}

export function ok(script, description, detail = "") {
  console.log(`  ${c.green("✓")} ${description}`);
  logEvent(script, description, "ok", detail);
}

export function warn(script, message) {
  console.log(`  ${c.yellow("!")} ${message}`);
  logEvent(script, message, "warn");
}

/** Run a command, streaming output. Throws WorkflowError on non-zero exit. */
export function run(script, cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", encoding: "utf8", shell: needsShim(cmd), ...opts });
  if (res.error) {
    logEvent(script, `${cmd} ${args.join(" ")}`, "error", res.error.message);
    throw new WorkflowError(`Failed to launch \`${cmd}\`: ${res.error.message}`);
  }
  if (res.status !== 0 && !opts.allowFailure) {
    logEvent(script, `${cmd} ${args.join(" ")}`, "failed", `exit ${res.status}`);
    throw new WorkflowError(`\`${cmd} ${args.join(" ")}\` exited with code ${res.status}`);
  }
  logEvent(script, `${cmd} ${args.join(" ")}`, res.status === 0 ? "ok" : "failed-allowed");
  return res;
}

/** Run a command and capture stdout (trimmed). Throws on non-zero unless allowFailure. */
export function capture(script, cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: needsShim(cmd), ...opts });
  if (res.error) {
    throw new WorkflowError(`Failed to launch \`${cmd}\`: ${res.error.message}`);
  }
  if (res.status !== 0 && !opts.allowFailure) {
    const detail = (res.stderr || res.stdout || "").trim();
    throw new WorkflowError(`\`${cmd} ${args.join(" ")}\` exited with code ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return { stdout: (res.stdout || "").trim(), status: res.status };
}

export function git(script, args, opts = {}) {
  return capture(script, "git", args, opts);
}

export function gitOk(script, args, opts = {}) {
  const res = capture(script, "git", args, { allowFailure: true, ...opts });
  return res.status === 0;
}

/** Parse `git worktree list --porcelain` into structured entries. */
export function listWorktrees(script) {
  const { stdout } = git(script, ["worktree", "list", "--porcelain"]);
  const entries = [];
  let current = null;
  for (const line of stdout.split("\n")) {
    if (line.startsWith("worktree ")) {
      if (current) entries.push(current);
      current = { path: line.slice("worktree ".length).trim() };
    } else if (line.startsWith("branch ")) {
      current.branch = line.slice("branch ".length).replace("refs/heads/", "").trim();
    } else if (line === "detached") {
      current.detached = true;
    }
  }
  if (current) entries.push(current);
  return entries;
}

export function findMainWorktree(script) {
  const entries = listWorktrees(script);
  const main = entries.find((e) => e.branch === "main");
  if (!main) {
    throw new WorkflowError("Could not locate the worktree checked out to `main`.", {
      hint: "Run `git worktree list` and confirm a `main` checkout exists.",
    });
  }
  return main;
}

export function currentBranch(script) {
  return git(script, ["rev-parse", "--abbrev-ref", "HEAD"]).stdout;
}

export function fail(scriptName, err) {
  console.error(`\n${c.bold(c.red("✗ Aborted"))} — ${err.message}`);
  if (err.hint) console.error(`  ${c.dim(err.hint)}`);
  logEvent(scriptName, "abort", "error", err.message);
  process.exit(1);
}
