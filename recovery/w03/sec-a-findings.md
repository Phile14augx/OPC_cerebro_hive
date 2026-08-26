# Security Findings for Ox Alpha

## Security configurations updated
- **Dependabot**: Reconfigured `.github/dependabot.yml` to remove unsupported language groups (Java/Maven, Python, Gradle, Terraform). Retained groups for Node.js (npm), Docker, and GitHub Actions, correctly reflecting the repository's stack.
- **SAST**: Created `.github/workflows/codeql.yml` to run GitHub's CodeQL analysis on `javascript-typescript`. It will run on pushes, pull requests to `main`/`master`, and on a weekly schedule.

## Actions Taken
1. Re-wrote `dependabot.yml` to align with the frontend workspace (Next.js/React/TypeScript) and Docker configuration.
2. Created `codeql.yml` workflow for Static Application Security Testing (SAST).
3. Committed changes to `w03-security` branch.
4. Pushed `w03-security` branch to the remote repository.

*Note: GitHub reported 105 vulnerabilities on the default branch during push (7 critical, 30 high, 41 moderate, 27 low). Dependabot should now begin creating pull requests to address these within the valid ecosystems.*
