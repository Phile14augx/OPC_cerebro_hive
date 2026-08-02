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

### CI security gates (as of 2026-08-01)

- **Static analysis:** CodeQL (`.github/workflows/security-codeql.yml`), weekly + on every push/PR to `main`/`develop`.
- **Dependency freshness:** Dependabot (`.github/dependabot.yml`), weekly across the pnpm workspace.
- **Secret scanning:** locally via a pre-commit hook (`.pre-commit-config.yaml`, gitleaks) **and**, since this date, in CI on every push/PR to `main`/`develop`/`release/*` (`.github/workflows/security-scan.yml`) — both use the same `.gitleaks.toml` rules and the same pinned gitleaks version (v8.21.2), so results can't diverge on tool version. CI failure is required (not advisory) on any detection; SARIF results also appear as GitHub code-scanning alerts.
- **Container image scanning + SBOM:** as of this date, `.github/workflows/docker-build.yml` builds a local (unpushed) scan candidate per service, generates a CycloneDX SBOM (`anchore/sbom-action`), and scans it with Trivy before the real multi-arch build-and-push step ever runs. The severity gate (default: fail on CRITICAL or HIGH, unfixed-only vulnerabilities excluded) is configurable via the `TRIVY_SEVERITY`/`TRIVY_EXIT_CODE` env vars at the top of that workflow. SBOMs and Trivy SARIF reports are retained as workflow artifacts (90 days) and as code-scanning alerts.
- **IaC policy gating (pre-existing, not new):** OPA/Conftest (`.github/workflows/policy-gate.yml`) gates Terraform plans on PRs touching `infra/terraform|helm|k8s|policy`.
- **Not yet in place:** supply-chain provenance/attestation (SLSA-style), a dedicated `dependency-review-action` PR gate (Dependabot alone doesn't block a PR introducing a new vulnerable dependency at review time), license scanning. See `MASTER-PLAN-GAP-ASSESSMENT.md` for the assessment that identified these gaps and `MASTER-PLAN-EVOLUTION-LOG.md` for related architecture-decision history.
