# Findings for Ox Alpha

## Workflow Integrity (w03-workflow-integrity)
- Identified 39 GitHub Actions workflow files improperly nested inside `OPC/cerebro-hive-website/.github/workflows/`.
- GitHub Actions only discovers workflows at the root directory (`.github/workflows/`).
- Relocated all 39 workflow files to the repository root.
- Injected `working-directory: OPC/cerebro-hive-website` into all relocated workflows to ensure proper path resolution since the project is within the subdirectory.
- Committed and pushed to `w03-workflow-integrity`.

## Workspace Package Boundary Validations (w03-root-architecture)
- Discovered existing workspace package boundaries rules defined in `.dependency-cruiser.js` and `.dependency-cruiser.eda.js`.
- The rules were defined but not strictly enforced across the CI pipeline.
- Added a `pnpm arch:boundaries` validation step to the `website-ci.yml` pipeline under the `typecheck-lint` job to fail the CI build upon boundary constraint violations.
- Committed and pushed to `w03-root-architecture`.
