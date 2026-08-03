#!/usr/bin/env node
/**
 * scripts/feature-start.mjs — Step 1 of .agents/AGENTS.md "Mandatory Development Workflow".
 *
 * Creates an isolated git worktree + branch for one feature, off origin/main.
 * Enforces the "at most one active feature branch" rule from step 12 unless
 * --allow-parallel is passed.
 *
 * Usage:
 *   pnpm feature:start feat/agent-memory-sync
 *   pnpm feature:start -- fix/gate-c-flake --allow-parallel
 */
import path from "node:path";
import {
  ROOT,
  WORKTREES_DIR,
  COMMIT_TYPES,
  c,
  step,
  ok,
  warn,
  run,
  git,
  gitOk,
  listWorktrees,
  fail,
} from "./lib/feature-workflow.mjs";

const SCRIPT = "feature-start";

function usage() {
  console.log(`Usage: pnpm feature:start <type>/<short-name> [--allow-parallel]

  <type> must be one of: ${COMMIT_TYPES.join(", ")}
  <short-name> is a short kebab-case description, e.g. agent-memory-sync

Example:
  pnpm feature:start feat/agent-memory-sync
`);
}

function main() {
  const args = process.argv.slice(2);
  const allowParallel = args.includes("--allow-parallel");
  const branch = args.find((a) => !a.startsWith("--"));

  if (!branch) {
    usage();
    process.exit(1);
  }

  const [type, ...rest] = branch.split("/");
  const name = rest.join("/");
  if (!COMMIT_TYPES.includes(type) || !name) {
    usage();
    fail(SCRIPT, new Error(`"${branch}" is not a valid "<type>/<name>" branch name.`));
  }

  console.log(c.bold(`\nStarting feature: ${branch}`));

  step(SCRIPT, "Check no other feature worktree is already active");
  const active = listWorktrees(SCRIPT).filter((w) => w.branch && w.branch !== "main" && !w.detached);
  if (active.length > 0 && !allowParallel) {
    fail(
      SCRIPT,
      Object.assign(
        new Error(
          `Feature "${active[0].branch}" is already active at ${active[0].path}.`,
        ),
        {
          hint:
            "Finish it first (pnpm feature:finish / pnpm feature:complete), " +
            "or pass --allow-parallel if parallel work was explicitly approved.",
        },
      ),
    );
  }
  if (active.length > 0) warn(SCRIPT, `Proceeding with --allow-parallel; ${active.length} other feature worktree(s) active.`);
  ok(SCRIPT, "No conflicting active feature worktree (or override supplied)");

  step(SCRIPT, "Fetch latest origin/main");
  run(SCRIPT, "git", ["fetch", "origin", "--prune"]);
  ok(SCRIPT, "Fetched origin");

  step(SCRIPT, "Verify branch name is not already taken");
  if (gitOk(SCRIPT, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`])) {
    fail(SCRIPT, new Error(`Local branch "${branch}" already exists.`));
  }
  if (gitOk(SCRIPT, ["ls-remote", "--exit-code", "--heads", "origin", branch])) {
    fail(SCRIPT, new Error(`Remote branch "origin/${branch}" already exists.`));
  }
  ok(SCRIPT, "Branch name is free");

  const worktreePath = path.join(WORKTREES_DIR, branch.replace(/\//g, "-"));
  const relWorktreePath = path.relative(ROOT, worktreePath);

  step(SCRIPT, `Create worktree at ${relWorktreePath}`);
  run(SCRIPT, "git", ["worktree", "add", relWorktreePath, "-b", branch, "origin/main"]);
  ok(SCRIPT, "Worktree created");

  console.log(`
${c.bold(c.green("Feature ready."))}

  cd ${relWorktreePath}
  pnpm install     ${c.dim("(first time only, if lockfile changed)")}

Implement only the scoped work, then run:

  pnpm feature:finish "type(scope): description"
`);
}

main();
