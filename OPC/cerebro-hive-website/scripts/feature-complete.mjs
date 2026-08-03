#!/usr/bin/env node
/**
 * scripts/feature-complete.mjs — Steps 8-12 of .agents/AGENTS.md "Mandatory
 * Development Workflow": wait for CI, merge, sync local main, remove the
 * worktree, and leave the repo ready for the next feature.
 *
 * Fail-safe by design: it never bypasses branch protection (no --admin), never
 * force-merges on red or pending CI, and stops with the exact blocking reason
 * rather than guessing. Nothing here is destructive until the merge itself —
 * everything before that point is read-only.
 *
 * Usage (run from inside the feature worktree, or pass --branch explicitly):
 *   pnpm feature:complete
 *   pnpm feature:complete -- --branch feat/agent-memory-sync
 */
import path from "node:path";
import {
  ROOT,
  c,
  step,
  ok,
  warn,
  run,
  capture,
  currentBranch,
  findMainWorktree,
  listWorktrees,
  fail,
} from "./lib/feature-workflow.mjs";

const SCRIPT = "feature-complete";

function ghJson(args) {
  const { stdout } = capture(SCRIPT, "gh", args);
  return JSON.parse(stdout);
}

function main() {
  const args = process.argv.slice(2);
  const branchFlagIdx = args.indexOf("--branch");
  const branch = branchFlagIdx !== -1 ? args[branchFlagIdx + 1] : currentBranch(SCRIPT);

  step(SCRIPT, "Guard: target must not be main");
  if (branch === "main" || branch === "master") {
    fail(SCRIPT, new Error("feature:complete needs a feature branch, not main."));
  }
  ok(SCRIPT, `Target branch: ${branch}`);

  step(SCRIPT, "Locate the pull request");
  let pr;
  try {
    pr = ghJson(["pr", "view", branch, "--json", "number,url,state,mergeable,reviewDecision"]);
  } catch {
    fail(
      SCRIPT,
      Object.assign(new Error(`No pull request found for branch "${branch}".`), {
        hint: "Run `pnpm feature:finish` first to push and open the PR.",
      }),
    );
  }
  ok(SCRIPT, `PR #${pr.number} — ${pr.url}`);

  if (pr.state === "MERGED") {
    warn(SCRIPT, "PR is already merged — skipping straight to sync + cleanup.");
  } else {
    step(SCRIPT, `Wait for required checks on PR #${pr.number}`);
    const checks = run(SCRIPT, "gh", ["pr", "checks", String(pr.number), "--watch"], { allowFailure: true });
    if (checks.status !== 0) {
      fail(
        SCRIPT,
        Object.assign(new Error(`CI did not pass for PR #${pr.number}.`), {
          hint: "Fix the failing checks, push again with `pnpm feature:finish`, then rerun `pnpm feature:complete`.",
        }),
      );
    }
    ok(SCRIPT, "All checks passed");

    step(SCRIPT, "Verify review status and mergeability");
    const fresh = ghJson(["pr", "view", branch, "--json", "mergeable,reviewDecision"]);
    if (fresh.mergeable === "CONFLICTING") {
      fail(
        SCRIPT,
        Object.assign(new Error(`PR #${pr.number} has merge conflicts with main.`), {
          hint: "Rerun `pnpm feature:finish` to rebase again, then retry.",
        }),
      );
    }
    if (fresh.reviewDecision === "CHANGES_REQUESTED" || fresh.reviewDecision === "REVIEW_REQUIRED") {
      fail(
        SCRIPT,
        Object.assign(new Error(`PR #${pr.number} is not approved (reviewDecision: ${fresh.reviewDecision}).`), {
          hint: "This script never bypasses required reviews — get the PR approved, then rerun `pnpm feature:complete`.",
        }),
      );
    }
    ok(SCRIPT, "Reviews and merge state satisfied");

    step(SCRIPT, `Merge PR #${pr.number} (squash)`);
    const merge = run(SCRIPT, "gh", ["pr", "merge", String(pr.number), "--squash", "--delete-branch"], { allowFailure: true });
    if (merge.status !== 0) {
      fail(
        SCRIPT,
        Object.assign(new Error(`\`gh pr merge\` was rejected for PR #${pr.number}.`), {
          hint: "Branch protection or another required condition blocked the merge. No override was attempted.",
        }),
      );
    }
    const merged = ghJson(["pr", "view", branch, "--json", "state"]);
    if (merged.state !== "MERGED") {
      fail(SCRIPT, new Error(`gh reported success but PR #${pr.number} state is "${merged.state}", not MERGED.`));
    }
    ok(SCRIPT, "Merged");
  }

  step(SCRIPT, "Locate the main worktree");
  const mainWt = findMainWorktree(SCRIPT);
  ok(SCRIPT, `main checked out at ${mainWt.path}`);

  step(SCRIPT, "Sync local main");
  run(SCRIPT, "git", ["fetch", "origin", "--prune"], { cwd: mainWt.path });
  run(SCRIPT, "git", ["checkout", "main"], { cwd: mainWt.path });
  run(SCRIPT, "git", ["pull", "--ff-only", "origin", "main"], { cwd: mainWt.path });
  ok(SCRIPT, "main is up to date");

  step(SCRIPT, "Remove the feature worktree");
  const worktrees = listWorktrees(SCRIPT);
  const featureWt = worktrees.find((w) => w.branch === branch);
  if (featureWt) {
    // Release this process's own hold on the worktree directory (Windows will
    // refuse to remove a directory that is the current process's cwd).
    process.chdir(mainWt.path);
    const removed = run(SCRIPT, "git", ["worktree", "remove", featureWt.path], { cwd: mainWt.path, allowFailure: true });
    if (removed.status !== 0) {
      warn(SCRIPT, `Could not auto-remove worktree at ${featureWt.path} (likely still in use by your shell). Remove it manually: git worktree remove ${path.relative(ROOT, featureWt.path)}`);
    } else {
      ok(SCRIPT, "Worktree removed");
    }
  } else {
    warn(SCRIPT, `No worktree found for branch "${branch}" (may already be cleaned up).`);
  }

  step(SCRIPT, "Delete local branch");
  run(SCRIPT, "git", ["branch", "-d", branch], { cwd: mainWt.path, allowFailure: true });
  ok(SCRIPT, "Branch cleanup attempted (git refuses if unmerged, which is the correct safety behavior)");

  step(SCRIPT, "Final repository health check");
  run(SCRIPT, "git", ["worktree", "list"], { cwd: mainWt.path });
  run(SCRIPT, "git", ["status", "--short"], { cwd: mainWt.path });

  console.log(`\n${c.bold(c.green("Feature complete."))} main is synced, the worktree is removed, and the repo is ready for the next feature.`);
}

main();
