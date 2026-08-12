# Master Plan Evolution Log

## [2026-08-03] Architecture Pivot to EIOS
*   **Trigger:** Market shift towards governed autonomous systems and AI-native enterprise architecture.
*   **Action:** Deprecated the 5-Tier architecture and repositioned CerebroHive as a 10-Layer **Enterprise Intelligence Operating System (EIOS)**.
*   **Result:** Created `ARCHITECTURE_INDEX.md`, `CEREBROHIVE_EIOS_MANIFESTO.md`, and updated the capability models to enforce the 10-layer constraint.

---
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

### 6. Phase 3 — Operational Assurance platform (2026-08-03)

- **Plan item:** Master plan Week 3-4 calls for CI pipeline and security scanning; broader operational assurance is implicit in the "Continuous" target column of `control-register.yaml`.
- **Original decision (per plan):** Evidence of control execution recorded per-run in CI; CEC computed from evidence.
- **Current implementation:** Full Phase 3 Operational Assurance stack added:
  - **Evidence Schema v2** (`infra/assurance/schema/evidence-v2.json`) — frozen JSON Schema contract with `schemaVersion`, `failureClass`, `breakTestProven`, `previousHash`, `currentHash`, `signature`. Future schema evolution happens via new schema version numbers, not mutation.
  - **Control descriptors** (`infra/assurance/descriptors/`) — one JSON file per domain (security, supply-chain, reliability, performance-compliance, self-assurance). Each descriptor declares `lifecycle` (Designed/Implemented/Executed/Proven/Regressed/Deprecated), `dependsOn[]`, `runner` config, and `breakTest` specification. Single source of truth; generated artifacts are never edited manually.
  - **Deterministic gate runner** (`tools/assurance/runner.mjs`) — single orchestration engine. Pipeline: load descriptors → validate schema → topological sort by `dependsOn` → execute control → classify failure → stamp hash chain → store evidence → recompute CEC. No control bypasses this pipeline.
  - **Failure classifier** (`tools/assurance/failure-classifier.mjs`) — maps raw errors to typed failure classes: `ARCHITECTURE_FAILURE`, `ENVIRONMENT_FAILURE`, `INFRASTRUCTURE_FAILURE`, `CONFIGURATION_FAILURE`, `RUNNER_FAILURE`, `DEPENDENCY_FAILURE`, `TIMEOUT`, `BLOCKED`.
  - **Hash chain** (`tools/assurance/chain.mjs`) — SHA-256 linking: every evidence entry contains `previousHash` (prior entry's hash) and `currentHash` (this entry's hash over canonical fields). Tampering with any historical entry breaks the chain at that point.
  - **PR assurance workflow** (`.github/workflows/assurance-pr.yml`) — runs on every PR, posts a structured comment: CEC score, evidence count, failure breakdown by class, self-assurance results, full provenance (commit → workflow run → artifact link).
  - **Self-assurance controls** (`infra/assurance/descriptors/self-assurance.json`, SLF-1 through SLF-5) — the platform verifies itself: descriptor validation, evidence schema validation, runner determinism, hash chain integrity, CEC computation determinism. Each is a first-class control with its own evidence entry and break test.
  - **Runner scripts** added to `package.json`: `assurance:run`, `assurance:run:ci`, `assurance:list`, `assurance:verify`, `assurance:self-test`.
- **Reason for change:** The existing assurance infrastructure (`control-register.yaml`, `run-local.sh`, `register-evidence.sh`) had correct intent but no enforcement: evidence was produced by ad-hoc bash checks with no typed failure classification, no hash chaining, no dependency ordering, and no PR integration. "Correct by inspection" is not sufficient for enterprise/regulated governance — the system must continuously and demonstrably prove itself.
- **What this does NOT change:** Existing `run-local.sh` and `register-evidence.sh` are preserved and continue to work. The new runner is additive — `assurance:run` calls `runner.mjs`, `assurance` still calls the bash script.
- **Verification status:** Design ✅ Implementation ✅ Static verification ✅ (all files reviewed; `runner.mjs` self-tests are runnable with `node tools/assurance/runner.mjs --self-test <suite>`). Runtime verification ⏳ — pending P0 (git remote connected, first CI run).
- **Approval / reference:** Requested and specified by user as Phase 3 — Operational Assurance.
- **Date:** 2026-08-03.

---

## Still-open items (not yet decided, so not yet loggable as resolved)

- **`Dockerfile.web` deletion (user action required):** Decision is to delete it (stale — references `app/package.json` which doesn't exist, not in `docker-build.yml` matrix). Automated deletion failed due to sandbox tooling. File to delete: `Dockerfile.web` at repo root.
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

### 5. Validation blind spot: root Next.js app excluded from `turbo typecheck`/`turbo lint`

- **Gap (confirmed 2026-08-01, by direct inspection):** `pnpm-workspace.yaml` declares only `apps/*`, `packages/*`, `packages/capabilities/*`, `services/*` as workspace packages. The Next.js app living directly at the repo root (`app/`, `components/`, `lib/`, its own `tsconfig.json`) is not one of them, and Turborepo does not run tasks against the root package by default — so `ci.yml`'s `pnpm turbo typecheck`/`pnpm turbo lint` steps never touched this code. A type error introduced there would not have failed CI.
- **Resolution (typecheck only):** added an explicit `Typecheck root Next.js app (not a Turborepo workspace package)` step to `.github/workflows/ci.yml`'s `typecheck-lint` job, running `pnpm exec tsc -p tsconfig.json --noEmit` directly against the root's own `tsconfig.json` (which already correctly scopes to `app/`/`components/`/`lib/` via its `exclude` list). Added a matching `typecheck:root` script to root `package.json` so this is locally reproducible, not just a CI-only check.
- **Lint gap now resolved (2026-08-03):** `eslint.config.mjs` created at repo root using `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` — the identical pattern used by `apps/studio` and `apps/platform`. `eslint-config-next` added as a root devDependency. `lint:root` script added to `package.json`. Explicit `Lint root Next.js app` step added to `ci.yml`'s `typecheck-lint` job immediately after the typecheck step. The config ignores `apps/**`, `packages/**`, `services/**`, etc. so it does not double-lint packages that have their own ESLint configs.
- **Related, adjacent finding — Dockerfile.web (action required):** `Dockerfile.web` (repo root) references `app/package.json`, which does not exist, and does `pnpm install --filter=./app` / `cd app && pnpm build` — stale infrastructure from a prior layout. Not referenced in `docker-build.yml`'s build matrix. **Decision: delete it.** The file should be manually deleted; it was not deleted automatically because the sandbox file-delete tool timed out during this session.
- **Injection test (2026-08-03):** `const _typecheck_sentinel: string = 42` was injected into `app/page.tsx` via bash `sed` — the mutation reached the real file (confirmed by Read tool), proving the CI step targets the correct code path. The sandbox mount dropped before `tsc` could execute, so a live exit-code observation was not captured. Sentinel removed immediately. Verification status for typecheck: injection path validated; tsc exit-code observation pending P0 (real CI run).
- **Verification status (lint):** static reasoning complete (config matches the pattern used by other Next.js apps in the repo; ignores patterns correct; `eslint-config-next` confirmed hoisted to root `node_modules`). Runtime verification pending P0 (real CI run).
- **Approval / reference:** typecheck fix requested as P3; lint fix self-identified and implemented in same session. Both documented here.
- **Date:** 2026-08-01 (typecheck), 2026-08-03 (lint gap closed).
