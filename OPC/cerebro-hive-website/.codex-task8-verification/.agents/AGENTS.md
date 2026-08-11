# Cerebro Hive Website - Agent Rules

## Workflow Management
- Whenever a GitHub Actions build or workflow fails (or if the user requests to clean up failed builds), automatically delete all failed workflow runs using the GitHub CLI (`gh`).
- **Command to use:**
  ```powershell
  $env:GITHUB_TOKEN = ""; $runs = (gh run list --status failure --limit 100 --json databaseId | ConvertFrom-Json); foreach ($r in $runs) { gh run delete $r.databaseId }
  ```
- **Important Context:** We must explicitly clear the `$env:GITHUB_TOKEN` variable before running the command to ensure `gh` uses the locally authenticated keyring instead of an invalid environment token.

## Mandatory Development Workflow (Staff Engineer Level)
For every Feature, Milestone, Epic, or Phase, you MUST follow this exact lifecycle:

**Automation:** steps 1, 3-7, and 8-12 are automated by `scripts/feature-start.mjs`, `scripts/feature-finish.mjs`, and `scripts/feature-complete.mjs` (`pnpm feature:start`, `pnpm feature:finish`, `pnpm feature:complete`). They enforce this lifecycle mechanically — validation before commit, rebase-then-squash into one commit, no force-merge, no bypassing branch protection — and log every step to `.agents/logs/feature-workflow.log`. Step 2 (implementing the scoped work) is always manual. Prefer the scripts over hand-run git/gh commands so the lifecycle can't silently drift.

1. **Create an isolated Git worktree**
   - Never develop directly on `main`. Always create a dedicated worktree and branch.
   - Example: `git worktree add .agents/worktrees/<feature-name> -b <branch-name> origin/main`
2. **Implement only the scoped work**
   - No opportunistic refactors or unfinished TODOs.
3. **Validate implementation locally**
   - Build, Tests, Lint, Type checking, Docs must all pass before committing.
4. **Rebase onto latest `origin/main`**
   - `git fetch origin` then `git rebase origin/main`. Resolve conflicts immediately.
5. **Create ONE atomic commit**
   - Use Conventional Commits (e.g., `feat(runtime): ...`, `docs(eios): ...`). Never use generic messages like "update", "wip", "changes".
6. **Push immediately**
   - `git push origin <branch>`
7. **Open Pull Request**
   - Include Objective, Scope, Files changed, Acceptance criteria, Risks, Testing.
8. **Wait for GitHub Actions**
   - Do not continue development until CI completes successfully.
9. **Merge**
   - Merge only after CI is green, required reviews are met, and PR is up to date.
10. **Sync local repository**
    - `git switch main` and `git pull --ff-only origin main`
11. **Remove completed worktree**
    - `git worktree remove .agents/worktrees/<feature-name>` and `git branch -d <branch-name>`
12. **Start next feature**
    - **No new feature may begin until the previous feature has been merged into `main`, GitHub Actions have passed on the merged commit, the local `main` has been fast-forwarded to `origin/main`, and all temporary worktrees have been removed. At any time, there must be at most one active feature branch per engineer unless parallel work has been explicitly approved.**
