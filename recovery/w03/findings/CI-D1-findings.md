# CI-D1 Findings: Policy Gates & Workflow Integrity

**Date:** 2026-08-25
**Agent:** CI-D1
**Target:** `w03-policy-gates` / `w03-workflow-integrity`

## Identified Issues & Repairs

1. **Governance Gate Actions (`governance-gate.yml`)**:
   - **Issue:** Invalid action versions were used (`actions/checkout@v7` and `actions/setup-node@v7`), which would cause the CI to fail immediately upon execution.
   - **Repair:** Downgraded these to the actual latest major version (`v4`) for both `checkout` and `setup-node`.

2. **Website CI Required Checks Hang (`website-ci.yml`)**:
   - **Issue:** The `pull_request` trigger included a `paths` filter targeting only the website sub-directory. In GitHub Actions, if a PR does not touch matching paths but the workflow is set as a required status check (e.g. `Website CI / workspace-contracts` and `CI Gate`), the PR is permanently blocked because the status check stays "Pending".
   - **Repair:** Removed the `paths` filter on the `pull_request` trigger. This ensures that the required CI jobs run on every PR and properly report back to unblock merging.

3. **CI Gate Conditional Logic (`website-ci.yml`)**:
   - **Issue:** The `ci-gate` job aggregates job results to act as a definitive fail-closed mechanism. Its `jq` filter checked for `.value.result != "success"`, which would erroneously fail the gate if jobs were natively skipped (result `"skipped"`).
   - **Repair:** Updated the `jq` filter to `select(.value.result != "success" and .value.result != "skipped")`. This permits intentional job skipping while continuing to fail correctly on `"failure"` or `"cancelled"`.

All repairs were implemented and pushed to both `w03-policy-gates` and `w03-workflow-integrity` worktrees to satisfy requirements.
