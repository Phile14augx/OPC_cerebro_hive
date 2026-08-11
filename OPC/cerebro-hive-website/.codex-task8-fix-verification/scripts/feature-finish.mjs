#!/usr/bin/env node
/**
 * scripts/feature-finish.mjs — Steps 3-7 of .agents/AGENTS.md "Mandatory
 * Development Workflow": validate locally, rebase onto origin/main, squash
 * into ONE atomic conventional commit, push, and open the PR.
 *
 * Fail-safe: validation failures stop before any git history is touched.
 * A failed rebase is aborted (git rebase --abort) rather than left
 * half-resolved, so re-running this script after a manual fix is always safe.
 *
 * Usage (run from inside the feature worktree):
 *   pnpm feature:finish "feat(runtime): add agent memory sync"
 *   pnpm feature:finish "fix(db): correct RLS predicate" -- --skip-validate --no-pr
 */
import fs from "node:fs";
import {
  COMMIT_TYPES,
  c,
  step,
  ok,
  warn,
  run,
  git,
  gitOk,
  currentBranch,
  fail,
} from "./lib/feature-workflow.mjs";

const SCRIPT = "feature-finish";

function usage() {
  console.log(`Usage: pnpm feature:finish "type(scope): description" [--skip-validate] [--no-pr] [--draft]

  The commit message must be a Conventional Commit. Valid types:
    ${COMMIT_TYPES.join(", ")}

Flags:
  --skip-validate   Skip build/lint/typecheck/test before committing (not recommended)
  --no-pr           Stop after pushing; do not open a pull request
  --draft           Open the PR as a draft
`);
}

function buildPrBody(message) {
  const [, subject, ...bodyLines] = message.split("\n");
  return [
    "## Objective",
    subject ? subject.trim() : message,
    "",
    "## Scope",
    "See commit diff for the full file list.",
    "",
    "## Acceptance criteria",
    "- [ ] Build, lint, typecheck, and test all pass in CI",
    "",
    "## Risks",
    "_None identified beyond what's covered by CI._",
    "",
    "## Testing",
    "`pnpm build && pnpm lint && pnpm typecheck && pnpm test` (run locally by `feature:finish` before this PR was opened)",
    ...(bodyLines.length ? ["", "## Notes", ...bodyLines] : []),
  ].join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const skipValidate = args.includes("--skip-validate");
  const noPr = args.includes("--no-pr");
  const draft = args.includes("--draft");
  const message = args.find((a) => !a.startsWith("--"));

  if (!message) {
    usage();
    process.exit(1);
  }
  const type = message.split(/[(:]/)[0];
  if (!COMMIT_TYPES.includes(type)) {
    usage();
    fail(SCRIPT, new Error(`"${message}" does not start with a valid Conventional Commit type.`));
  }

  step(SCRIPT, "Guard: must run on a feature branch, not main");
  const branch = currentBranch(SCRIPT);
  if (branch === "main" || branch === "master") {
    fail(SCRIPT, new Error("feature:finish must be run from a feature worktree, not main."));
  }
  ok(SCRIPT, `On branch ${branch}`);

  if (!skipValidate) {
    step(SCRIPT, "Validate locally: lint, typecheck, build, test");
    for (const cmd of [["lint"], ["typecheck"], ["build"], ["test"]]) {
      run(SCRIPT, "pnpm", ["run", ...cmd]);
    }
    ok(SCRIPT, "All local validation passed");
  } else {
    warn(SCRIPT, "Skipping local validation (--skip-validate)");
  }

  step(SCRIPT, "Snapshot any uncommitted work before rebasing");
  const { stdout: statusOut } = git(SCRIPT, ["status", "--porcelain"]);
  if (statusOut) {
    run(SCRIPT, "git", ["add", "-A"]);
    run(SCRIPT, "git", ["commit", "-m", "wip: pre-rebase snapshot"]);
    ok(SCRIPT, "Committed a pre-rebase snapshot");
  } else {
    ok(SCRIPT, "Working tree already clean");
  }

  step(SCRIPT, "Fetch origin");
  run(SCRIPT, "git", ["fetch", "origin", "--prune"]);
  ok(SCRIPT, "Fetched origin");

  step(SCRIPT, "Rebase onto origin/main");
  // Streamed (stdio: inherit), not captured — a swallowed rebase failure
  // (conflict markers, "unstaged changes", etc.) is undebuggable otherwise.
  const rebase = run(SCRIPT, "git", ["rebase", "origin/main"], { allowFailure: true });
  if (rebase.status !== 0) {
    run(SCRIPT, "git", ["rebase", "--abort"], { allowFailure: true });
    fail(
      SCRIPT,
      Object.assign(new Error("Rebase onto origin/main failed — see git's output above for the exact cause."), {
        hint: "Resolve manually with `git fetch origin && git rebase origin/main`, then rerun `pnpm feature:finish`.",
      }),
    );
  }
  ok(SCRIPT, "Rebased cleanly onto origin/main");

  step(SCRIPT, "Squash into ONE atomic commit");
  const mergeBase = git(SCRIPT, ["merge-base", "origin/main", "HEAD"]).stdout;
  const head = git(SCRIPT, ["rev-parse", "HEAD"]).stdout;
  if (mergeBase === head) {
    fail(SCRIPT, new Error("Nothing to commit — this branch has no changes relative to origin/main."));
  }
  run(SCRIPT, "git", ["reset", "--soft", mergeBase]);
  // Uses `git commit` (not commit-plumbing) so the repo's husky commit-msg
  // hook still runs commitlint against the final Conventional Commit message.
  run(SCRIPT, "git", ["commit", "-m", message]);
  ok(SCRIPT, "Created single atomic commit");

  step(SCRIPT, "Push to origin");
  const remoteExists = gitOk(SCRIPT, ["ls-remote", "--exit-code", "--heads", "origin", branch]);
  run(SCRIPT, "git", remoteExists ? ["push", "--force-with-lease", "origin", branch] : ["push", "-u", "origin", branch]);
  ok(SCRIPT, "Pushed");

  if (noPr) {
    console.log(`\n${c.bold(c.green("Done."))} Push complete; PR creation skipped (--no-pr).`);
    return;
  }

  step(SCRIPT, "Open pull request");
  const bodyFile = ".git/FEATURE_PR_BODY.tmp.md";
  fs.writeFileSync(bodyFile, buildPrBody(message), "utf8");
  const prArgs = ["pr", "create", "--base", "main", "--head", branch, "--title", message, "--body-file", bodyFile];
  if (draft) prArgs.push("--draft");
  const created = run(SCRIPT, "gh", prArgs, { allowFailure: true });
  fs.rmSync(bodyFile, { force: true });
  if (created.status !== 0) {
    warn(SCRIPT, "`gh pr create` failed — a PR may already exist for this branch. Checking...");
    run(SCRIPT, "gh", ["pr", "view", branch]);
  }
  ok(SCRIPT, "PR ready");

  console.log(`\n${c.bold(c.green("Finished."))} Once CI is green and the PR is approved, run:\n\n  pnpm feature:complete\n`);
}

main();
