# Python CI Fix Findings for Ox Alpha

## Findings
- The Python testing and linting jobs in `OPC/cerebro-hive-website/.github/workflows/ci.yml` contained `|| true` appends.
- `ruff check src/ || true` was suppressing linting failures.
- `pytest src/ -x -q --tb=short || true` was suppressing test failures.
- These workarounds resulted in false greens on the CI, obscuring broken tests or lint rule violations.

## Actions Taken
- Removed `|| true` from both `ruff` and `pytest` steps in `.github/workflows/ci.yml`.
- Pushed/committed the changes to the `w03-ci-polyglot` worktree.
