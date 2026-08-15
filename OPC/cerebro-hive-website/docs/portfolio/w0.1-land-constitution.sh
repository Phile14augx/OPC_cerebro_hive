#!/usr/bin/env bash
# W0.1 — land the portfolio constitution on an isolated branch.
# Run from the git root (OPC_cerebro_hive), not from the website folder.
# Does not touch Twin Studio, runtime-core, Nexarch, or CI code.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

WEBSITE="OPC/cerebro-hive-website"
BRANCH="docs/w0-1-portfolio-baseline-v1"
WORKTREE="$ROOT/.worktrees/w0-1-portfolio"
BASE="${1:-origin/main}"

FILES=(
  "$WEBSITE/docs/portfolio"
  "$WEBSITE/docs/plans/README.md"
  "$WEBSITE/docs/plans/active/cerebrohive-aeos-6-month-mega-plan.md"
  "$WEBSITE/docs/plans/active/cerebrohive-6-month-master-plan.md"
  "$WEBSITE/docs/plans/active/master-plan-evolution-log.md"
  "$WEBSITE/docs/plans/active/agent-runtime-backlog.md"
  "$WEBSITE/docs/plans/active/2026-08-11-twin-industry-framework.md"
  "$WEBSITE/docs/plans/active/2026-08-11-agent-academy-agent-registry.md"
  "$WEBSITE/docs/architecture/product-registry.md"
  "$WEBSITE/docs/architecture/services-portfolio.md"
  "$WEBSITE/docs/architecture/capability-model.md"
  "$WEBSITE/docs/architecture/long-term-roadmap.md"
  "$WEBSITE/docs/architecture/README.md"
  "$WEBSITE/docs/product-registry.md"
  "$WEBSITE/docs/services-portfolio.md"
  "$WEBSITE/docs/capability-architecture.md"
  "$WEBSITE/docs/products.md"
  "$WEBSITE/docs/03-services/README.md"
  "$WEBSITE/docs/reviews/master-plan-gap-assessment.md"
  "$WEBSITE/agents/CURRENT-SPRINT.md"
  "$WEBSITE/agents/CLAUDE-TASKS.md"
  "$WEBSITE/agents/GEMINI-TASKS.md"
  "$WEBSITE/PROGRESS.md"
)

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "Branch $BRANCH already exists. Use a worktree or delete it first."
  exit 1
fi

git fetch origin main || true
mkdir -p "$(dirname "$WORKTREE")"
git worktree add -b "$BRANCH" "$WORKTREE" "$BASE"

for rel in "${FILES[@]}"; do
  src="$ROOT/$rel"
  dest="$WORKTREE/$rel"
  if [ -e "$src" ]; then
    mkdir -p "$(dirname "$dest")"
    if [ -d "$src" ]; then
      rm -rf "$dest"
      cp -R "$src" "$dest"
    else
      cp "$src" "$dest"
    fi
  fi
done

cd "$WORKTREE"
git add -- "${FILES[@]}"
git status --short
git commit -m "$(cat <<'EOF'
docs(portfolio): land Baseline v1.0 as the Wave 0 constitution

Freeze evidence numbers, isolate assignment to the ledger, and mark
historical plans non-operational without deleting them.
EOF
)"

echo "Landed on $BRANCH in $WORKTREE"
echo "Do not merge Twin Studio or runtime dumps into this branch."
