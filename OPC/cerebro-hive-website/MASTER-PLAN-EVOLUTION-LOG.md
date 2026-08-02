# Master Plan Evolution Log

**Purpose:** every time the actual implementation intentionally diverges from `CEREBROHIVE-6-MONTH-MASTER-PLAN.md`, record it here — original decision, current implementation, reason, approval reference, date. This exists so a future reviewer (or a future me) treats a documented, intentional divergence as evolution, not as unfinished plan work rediscovered from scratch. Companion to `MASTER-PLAN-GAP-ASSESSMENT.md`, which is the point-in-time comparison; this log is the running history of resolved divergences.

**Format per entry:**
- **Plan item:** what the master plan specifies.
- **Original decision (per plan):** the plan's literal ask.
- **Current implementation:** what actually exists in the repo.
- **Reason for change:** why, if known.
- **Approval / reference:** an ADR, this log entry itself, or "pending — awaiting user confirmation."
- **Date:** when this entry was logged (not necessarily when the divergence first happened, since some of these predate this log).

---

## Entries

### 1. Brand typography: Orbitron/Exo 2 -> Space Grotesk/Inter/IBM Plex Mono/JetBrains Mono

- **Plan item:** Week 1, Brand System & Dark Intelligence UI.
- **Original decision (per plan):** Orbitron for headings, Exo 2 for body, JetBrains Mono for code.
- **Current implementation:** `app/theme/typography.css` defines `--font-space` (Space Grotesk), `--font-inter` (Inter), `--font-plex` (IBM Plex Mono), `--font-jetbrains` (JetBrains Mono). Only JetBrains Mono matches the plan.
- **Reason for change:** unknown — not yet confirmed with the user. Plausible: a later brand decision superseded the PDF's original spec, or the PDF's spec was aspirational and never implemented as written.
- **Approval / reference:** **pending — awaiting user confirmation.** Do not treat this entry as closed; it's a placeholder recording the divergence found during the 2026-08-01 gap assessment, not a ratified decision.
- **Date logged:** 2026-08-01.

### 2. CerebroChat / core backend: Spring Boot -> Fastify (`apps/platform-api`)

- **Plan item:** Week 3 ("Initialize Next.js (App Router) and Spring Boot base codebases") and Week 6 ("Spring Boot API endpoint interfacing with Anthropic Claude and OpenAI GPT-4o APIs").
- **Original decision (per plan):** Spring Boot (Java) as the backend for the web platform and CerebroChat.
- **Current implementation:** `apps/platform-api`, a Fastify/TypeScript service. It already has real, tested integrations: `AIGateway`-backed LLM provider, `AgentRuntimeService`, a `conversations` module, and (per this engagement's own Phase 9/10 work) a real `ExecutionOrchestrator`-backed `/api/v1/runtime` surface. No Java/Spring Boot service exists anywhere in this repository.
- **Reason for change:** this predates the master plan PDF's upload into this engagement — the Fastify backend was built and substantially matured (multiple epics: AI gateway wiring, tool runtime, conversations, the full HiveForge execution runtime) before this plan was ever introduced. It is very unlikely to be an oversight; it reads as the actual standing architecture.
- **Approval / reference:** **pending — awaiting user confirmation**, but flagged with a strong recommendation against reverting: rewriting a tested, multi-phase Fastify service in Spring Boot to match the plan would be regression, not progress toward the plan's own underlying goal (a working CerebroChat backend).
- **Date logged:** 2026-08-01.

### 3. IaC tooling: Terraform (as planned) + AWS CDK (not in the plan, non-overlapping scope)

- **Plan item:** Week 2, "Write Terraform modular scripts for AWS VPCs, subnets, NAT gateways..."
- **Original decision (per plan):** Terraform only.
- **Current implementation:** Terraform (`infra/terraform/modules/{networking,kubernetes,rds,iam,irsa,...}`) covers the broad cloud estate the plan describes. A separate AWS CDK app (`infra/aws/lib/cerebro-review-stack.ts`) exists but covers exactly one narrow, unrelated stack (infrastructure for the Engineering Review vertical slice, an earlier epic in this engagement) — not a second, competing copy of the VPC/EKS/RDS estate.
- **Reason for change:** not a plan divergence in the sense of "wrong tool chosen" — Terraform is still the tool for everything the plan actually describes. The CDK app is additive, scoped to a feature the plan doesn't mention at all.
- **Approval / reference:** logged here as the ownership-boundary record itself (per the gap assessment's recommendation); no ADR yet. Recommend a short one-paragraph note in `infra/README.md` pointing at this log entry.
- **Date logged:** 2026-08-01.

---

## Still-open items (not yet decided, so not yet loggable as resolved)

- Whether `.card-glass`/`.btn-primary`/`.section-label` component primitives exist under different names in `components/` (not yet cross-checked).
- Whether `environments/` vs `envs/` (two parallel Terraform env-directory naming schemes) should be merged, and which name wins.
- Supply-chain provenance/attestation (SLSA-style) and a PR-time `dependency-review-action` gate — deliberately deferred when the CI secret-scanning/image-scanning gap was closed (2026-08-01), not forgotten; see below.

## Gaps closed (not architecture divergences — tracked here only for continuity with the assessment)

### 4. CI security gates: secret scanning + container image scanning

- **Gap (per `MASTER-PLAN-GAP-ASSESSMENT.md`, 2026-08-01):** gitleaks ran only as a local pre-commit hook; `docker-build.yml` built and pushed images with no scanning step at all, despite the plan calling for Docker Scout/Trivy.
- **Resolution:** added `.github/workflows/security-scan.yml` (CI-enforced Gitleaks, same config/version as the pre-commit hook) and restructured `docker-build.yml` into a build → SBOM → Trivy scan → push sequence per service, gated on a configurable severity threshold (default CRITICAL/HIGH).
- **Deliberately deferred, not part of this slice:** SLSA-style provenance/attestation, a `dependency-review-action` PR gate, license scanning — per the reviewer's own guidance not to block this slice on them.
- **Approval / reference:** requested and specified in detail by the user; implemented as described. Documented in `SECURITY.md`.
- **Date:** 2026-08-01.
- **Verification status:** Design/Implementation/Static verification are complete (YAML validated, action inputs reviewed by hand against real interfaces). Runtime verification is not yet done — no GitHub Actions run has executed these workflows. Fill in the table below the first time each capability is actually observed running in CI; until then, treat this as the open item.

| Capability | Status | Evidence |
|---|---|---|
| CI secret scanning (Gitleaks) | Implemented, not yet run | *(pending — add workflow run link/number on first execution)* |
| Image vulnerability gate (Trivy) | Implemented, not yet run | *(pending)* |
| SBOM generation (CycloneDX) | Implemented, not yet run | *(pending — confirm an actual SBOM artifact was produced, not just that the step didn't error)* |

Recommended trigger to fill this in: the next push/PR to `main`/`develop` (or a manual `workflow_dispatch` of `docker-build.yml`) once this repo is connected to a real GitHub remote — same operational dependency already blocking git commit/tag work elsewhere in this engagement.
