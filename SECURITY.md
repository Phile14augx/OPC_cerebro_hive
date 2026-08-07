# Security Policy

## Reporting a vulnerability

If you believe you've found a security vulnerability in this repository (the
CerebroHive website or the AgentOS backend under `agentos/`), please report it
privately rather than opening a public GitHub issue:

- Email: security@cerebrohive.com *(update this to a real, monitored address before publishing)*
- Please include: the affected component/URL, steps to reproduce, and the
  potential impact. Proof-of-concept code is welcome.

We aim to acknowledge reports within 3 business days. Please give us a
reasonable window to investigate and ship a fix before any public disclosure.

## Scope

- `app/`, `components/`, `lib/`, `middleware.ts` — the Next.js website
- `agentos/` — the FastAPI backend service (agent runtime, memory, governance, etc.)

Out of scope: third-party services this project links to or embeds, and
denial-of-service testing against the production deployment (please test
against a local clone instead — see `agentos/DEPLOY.md` and the root
`start-*.bat` scripts).

## Current security posture

This is an actively developed project. See the security roadmap document for
a full breakdown of what's implemented today (security headers, CSP, rate
limiting, input validation, admin-secret gating, dependency/secret scanning
in CI) versus what's planned but not yet in place (SSO/SAML, WAF/edge
protection, SIEM, third-party audits). If you're evaluating this project for
production/enterprise use, ask for the current roadmap doc rather than
assuming parity with a mature SaaS platform's security program.

### CI security gates (as of 2026-08-02)

**A note on paths:** this repo's actual root is one level above this package
(`OPC/cerebro-hive-website/`); GitHub Actions only executes workflows from
`<repo-root>/.github/workflows/`, not from a nested `.github/workflows/`
inside this subfolder. Every path below is relative to the true repo root.
An earlier version of this section, and a batch of new workflow files added
alongside it, targeted the nested (inert) path by mistake — those files are
still present as design references but do not run. This has been corrected.

- **Static analysis:** CodeQL (`.github/workflows/codeql.yml`), weekly + on every push/PR to `main`.
- **Dependency freshness:** Dependabot (`.github/dependabot.yml`), across the workspace.
- **Secret scanning:** locally via a pre-commit hook (`.pre-commit-config.yaml`, gitleaks) **and**, pre-existing, in CI on every push/PR to `main`/`develop`/`release/*` as the `secret-scan` job of `.github/workflows/security-scan.yml` (gitleaks). That job has no `continue-on-error`, and `security-gate` fails the run if it reports failure — CI failure is required (not advisory) on any detection; SARIF results also appear as GitHub code-scanning alerts.
- **Container image scanning + SBOM:** as of this date, `.github/workflows/build.yml` (the active multi-service GHCR/ECR build-and-push pipeline) builds a local (unpushed) `linux/amd64` scan candidate per service, generates a CycloneDX SBOM (`anchore/sbom-action`), and scans it with Trivy before the real multi-arch build-and-push step ever runs. The severity gate (default: fail on CRITICAL or HIGH, unfixed-only vulnerabilities excluded) is configurable via the `TRIVY_SEVERITY`/`TRIVY_EXIT_CODE` env vars at the top of that workflow. SBOMs and Trivy SARIF reports are retained as workflow artifacts (90 days) and as code-scanning alerts. This closes the gap `MASTER-PLAN-GAP-ASSESSMENT.md` identified: images were previously built and pushed with no scanning step at all. `.github/workflows/trivy.yml` (filesystem-only) and `.github/workflows/sbom.yml` (dependency SBOM only) are separate, pre-existing, and do not cover built images.
- **SAST / dependency / IaC (pre-existing, advisory only):** `.github/workflows/security-scan.yml` also runs Semgrep, `pnpm audit` + OSV-Scanner, and Checkov against Terraform/K8s/Helm/Dockerfiles — all with `continue-on-error: true` or a non-blocking exit code, so findings are reported (SARIF, PR comment) but do not fail the run. Only the secret-scan and, as of this date, the container-image-scan gates are hard blocking.
- **Not yet in place:** an IaC policy gate that actually blocks (OPA/Conftest exists only in the nested/inert workflow tree and needs the same relocation this container-scan gate got), supply-chain provenance/attestation (SLSA-style) beyond Cosign signing, a dedicated `dependency-review-action` PR gate, license scanning, and hard-failing the advisory SAST/dependency/IaC scans above. See `MASTER-PLAN-GAP-ASSESSMENT.md` for the assessment that identified these gaps and `MASTER-PLAN-EVOLUTION-LOG.md` for related architecture-decision history.
