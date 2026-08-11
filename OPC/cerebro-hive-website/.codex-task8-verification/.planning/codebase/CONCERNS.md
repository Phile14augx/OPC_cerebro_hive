# Codebase Concerns

**Analysis Date:** 2026-08-04

## Documentation & Governance Churn

**Strategic Documentation Deleted:**
- Issue: Four key governance/capability documents deleted during current session without clear archival or replacement
  - `CAPABILITY_ARCHITECTURE.md` - Capability system design
  - `COMMERCIAL_STRATEGY.md` - Business/product strategy
  - `PRODUCT_REGISTRY.md` - Product inventory and service catalog
  - `SERVICES_PORTFOLIO.md` - Services architecture overview
- Files: Repository root level (previously at project root)
- Impact: Loss of architectural direction, capability mapping, and strategic context. No replacement documentation created. Onboarding and architectural decision-making severely hampered.
- Fix approach: Reconstruct from architecture/ARCHITECTURE_INDEX.md and CEREBROHIVE_CONSTITUTION.md. Establish governance protocol for strategic doc changes. Consider version control strategy for these critical docs.

**Large Uncommitted Change Batch:**
- Issue: 189 uncommitted files with modifications (as of analysis date) across nearly every `package.json` and several critical source files, including schema migrations and provider implementations
- Files: Repository-wide (root package.json, all app/packages/ package.json files, database schema, provider implementations, workflow configs)
- Impact: Unknown changes blocking merge verification. CI/git state mismatch. Risk of data loss or accidental revert. Impossible to know which changes are intended vs. work-in-progress.
- Fix approach: Triage immediately. Stage intended changes, commit with clear message, verify CI pipeline. Discard or stash experimental changes. Establish pre-merge checklist including `git status` verification.

---

## Validation Pipeline Coverage Gaps (P0 Risk)

**Incomplete TypeScript/ESLint Coverage:**
- Issue: `turbo typecheck` and `turbo lint` only run on 19% of packages (24 of 129 packages define these scripts). Turbo silently skips packages without the script and exits 0, masking coverage gaps.
- Files: 
  - 105 packages without `typecheck` script, including critical backend: `apps/platform-api`, `apps/studio`, `apps/platform`, `packages/runtime-core`, `packages/auth`, `packages/events`, `packages/database`, `packages/db`, `packages/contracts`, `packages/policy-core`, `services/forge-api`, `services/llm-gateway`, all `packages/capabilities/*`
  - Only 24 packages define `typecheck` script
  - Only 25 packages define `lint` script
  - 41 of 129 packages define `test` script (32% coverage)
- Impact: 
  - Large batch of pre-existing type errors never surfaced by CI
  - Security/correctness bugs in core platform services bypass validation
  - Root Next.js application (`app/`, `components/`, `lib/`) entirely outside turbo pipeline
  - Cannot trust CI green signal for merge approval
- Fix approach:
  1. Add `typecheck: "tsc --noEmit -p tsconfig.json"` script to all 105 packages lacking it (mechanical, non-breaking)
  2. Add root scripts: `typecheck:site` and `lint:site` targeting root `tsconfig.json` and Next.js app
  3. Wire root scripts into CI workflow alongside turbo tasks
  4. Run pipeline end-to-end, collect type error backlog, triage by severity
  5. Only after coverage is complete: run deliberate type-error test twice (once in root, once in previously-unchecked package) to verify CI catches failures

**Root Application Not in Validation Pipeline:**
- Issue: Root `package.json` (`cerebro-hive-os`) not included in `pnpm-workspace.yaml` members. Root `tsconfig.json` exists but never checked by `turbo typecheck`. `next lint` never runs on root.
- Files: Root directory, root `package.json`, `tsconfig.json`, `next.config.ts`, root `app/`, `components/`, `lib/`
- Impact: Audit report identified JSX-in-`.ts` file (`lib/auth.tsx`) that survived to release branch precisely because it bypassed root linting. Cannot catch Next.js-specific issues (broken links, missing routes, malformed pages).
- Fix approach: Add root to workspace members in `pnpm-workspace.yaml` or create separate CI step for root-level validation
- Note: Root `tsconfig.json` excludes `tests/` — verify if this is intentional before fixing

**Undeclared `next` Dependency in Root:**
- Issue: Root `package.json` declares no dependency on `next`, despite `next.config.ts` and entire site living at root. Build succeeds only because `next` is hoisted into root `node_modules` from workspace packages.
- Files: Root `package.json` (devDependencies section)
- Impact: Breaks under strict pnpm install modes (e.g., `--no-hoist`). Undeclared peer dependency risk. Build will fail in CI if workspace structure changes.
- Fix approach: Add explicit `next: ">=15.3.4"` to root `package.json` devDependencies (matching version from workspace overrides)

---

## Execution & Persistence Shortfalls

**InMemoryExecutionRepository — Temporary/Lossy Implementation:**
- Issue: `ExecutionOrchestrator` uses `InMemoryExecutionRepository` (line 69, `apps/platform-api/src/bootstrap.ts`). Comment explicitly notes: "there is no database-backed `ExecutionRepository` yet (see hiveforge/TECHNICAL-DEBT.md §2), so every Execution created through this wiring is process-lifetime only, lost on restart."
- Files: `packages/domain/src/execution/Execution.ts` (Phase 9 aggregate), `apps/platform-api/src/bootstrap.ts` (instantiation), `packages/domain/src/repositories/ExecutionRepository.ts` (interface only — no Prisma implementation)
- Impact: 
  - No execution history survives pod restart or deployment
  - Audit trail lost; cannot replay or investigate failed executions
  - Multi-instance deployments lose cross-pod execution context
  - Phase 10.1/10.2 cannot finalize without this
- Fix approach: Implement `PrismaExecutionRepository` mirroring existing `PrismaAgentRepository` pattern. Use schema from `packages/database/prisma/schema.prisma` execution models (recently added). Test replay semantics against determinism contract.

**Incomplete ExecutionProvider Coverage:**
- Issue: Only `AgentExecutionProvider` is real (line 70, bootstrap.ts). Other execution kinds ('Workflow', 'Tool', 'Evaluation') have no real providers. `runtime.routes.ts` explicitly rejects these kinds with "silently pretending to execute them" guard.
- Files: `apps/platform-api/src/modules/runtime/AgentExecutionProvider.ts` (only real provider), `apps/platform-api/src/modules/runtime/ExecutionRuntimeService.ts` (rejection logic)
- Impact: Workflow, tool, and evaluation executions cannot run. Platform blocked from multi-subsystem orchestration per Phase 9's governing invariant.
- Fix approach: Implement `WorkflowExecutionProvider`, `ToolExecutionProvider`, `EvaluationExecutionProvider` following AgentExecutionProvider pattern. Coordinate with workflow engine (Temporal.io) for scheduler integration.

**Database Schema Migration Scope (Major):**
- Issue: Large set of new execution-tracking tables added to schema (AgentExecution, AgentExecutionStep, AgentExecutionEvent, AgentExecutionSnapshot, AgentExecutionMetric, AgentExecutionLease, AgentExecutionCheckpoint, AgentExecutionOutbox, AgentExecutionInbox) but no corresponding Prisma client generation or migration validation shown.
- Files: `packages/database/prisma/schema.prisma` (additions starting at AgentExecution model), `packages/database/prisma/migrations/` (new migration files required but not verified), `packages/database/prisma/seed.ts` (seed data for new tables unknown)
- Impact: Schema out of sync with runtime code. `prisma:generate` must run before deploy, or Prisma client will not include new models. Risk of runtime "model not found" errors.
- Fix approach: Confirm `pnpm prisma:generate` has been run. Verify migration was created with `prisma migrate dev` or added to migration_lock.toml. Test schema validation against runtime code.

---

## Provider & Health Monitoring Gaps

**RuntimeRegistry Double-Registration Guard (Hot-Reload Workaround):**
- Issue: `registerAIGatewayProvider()` includes guard against double-registration (lines 94-100, `AIGatewayProviders.ts`) because `dev` mode runs via `tsx watch` — without this guard, hot-reload would hit "already registered" throw from `CapabilityDescriptor`.
- Files: `apps/platform-api/src/modules/runtime/providers/AIGatewayProviders.ts` (guard present), `registerMockProviders()` (same latent gap unfixed — commented as out-of-scope)
- Impact: Fragile hot-reload. Mask off real error (multiple providers registering concurrently). Blocks use of strict error checking in dev mode.
- Fix approach: Move provider registration to bootstrapping layer (not event handler), or implement proper registration deduplication at `RuntimeRegistry` level. Consider unref() for polling interval to prevent process hold.

**AIGateway Health Polling Lag:**
- Issue: `syncHealth()` polls AIGateway health every 15 seconds (line 121, same file). Polling-based (not event-driven) because "AIGateway only exposes a point-in-time getHealth() snapshot (no change events)".
- Files: `apps/platform-api/src/modules/runtime/providers/AIGatewayProviders.ts` (lines 115-122)
- Impact: Up to 15-second staleness in health state. Circuit breaker trips invisible to registry for 15s. Risk of routing requests to degraded providers.
- Fix approach: Add change-event API to AIGateway (upgrade priority), or reduce poll interval with cost tradeoff analysis. Alternatively, update docs to explain 15s propagation delay as SLA.

---

## CI/CD Infrastructure Instability

**Recent Workflow Fixes Indicate Systemic Issues:**
- Issue: Last 10 commits include 5 CI/workflow fixes:
  - `fix(ci): fix github action versions in infrastructure.yml` (005d6dd)
  - `fix(ci): correct invalid trivy-action version pin in build.yml` (4aa2b58)
  - `fix(ci): fix malformed YAML in ssh-deploy.yml breaking every VPS deploy` (d6d15b4 & 28a4922 — committed twice)
  - `fix(ci): port pre-push image scan gate into the active build.yml` (080eaa5)
  - `fix(ci): add dummy index files to empty packages to fix TS18003 typecheck errors` (15220df)
- Files: `.github/workflows/infrastructure.yml`, `.github/workflows/ci.yml`, `.github/workflows/build.yml`, `.github/workflows/ssh-deploy.yml`
- Impact: Frequent workflow breakages block deployments. Multiple fixes suggest YAML syntax is error-prone or not validated in CI. Action versions unpinned or pinned incorrectly, leading to surprise behavior on re-run.
- Fix approach:
  1. Add YAML linting to CI (yamllint or pre-commit hook)
  2. Pin all GitHub actions to major version tags (`actions/checkout@v4`, not `@main`)
  3. Document workflow change review process (require workflow syntax validation before merge)
  4. Audit all .github/workflows/*.yml for consistency (indentation, schema compliance)

**Missing TypeCheck Gate in CI:**
- Issue: Despite `pnpm typecheck` in root package.json, CI does not enforce it (as shown in STACK.md). This is consequence of coverage gap above — pipeline runs only on 24 packages, so CI green does not guarantee build soundness.
- Files: `.github/workflows/ci.yml`, `.github/workflows/build.yml`
- Impact: Type errors merge without detection. Release-blocking issues (like JSX-in-.ts) bypass CI.
- Fix approach: Implement validation pipeline coverage fixes above. Then add explicit CI step: `pnpm typecheck:root && pnpm lint:root && turbo typecheck && turbo lint`.

---

## Security Considerations

**Potential Credential Exposure (Pre-Existing, Unverified):**
- Issue: Audit report notes "Secret exposure" finding with medium confidence. Git history unreachable on current mount, so "committed-vs-untracked is **unknown**". The mount cannot verify whether secrets were ever committed.
- Files: Unknown (audit noted credential format found on disk, but specific files not listed in current context)
- Impact: If secrets were committed to any branch, they are exposed until rotated. Automated secret scanning (e.g., git-secrets, TruffleHog) may have missed patterns.
- Fix approach:
  1. Run `git log --all -S "sk-" -S "AKIA" -S "MIIEvQIBA"` to search for known secret patterns in history
  2. Run TruffleHog: `trufflehog filesystem .` in clean checkout
  3. If secrets found, rotate immediately and force-push historical cleanup (requires coordination)
  4. Add pre-commit hooks to block secret commits: `git-secrets --install` or similar

**Hardcoded Environment in Swagger Config:**
- Issue: `bootstrap.ts` hardcodes Swagger server URL to `http://localhost:3000` (line 81), will break in non-localhost deployments or reverse-proxy setups.
- Files: `apps/platform-api/src/bootstrap.ts` (line 81)
- Impact: Swagger UI points to wrong backend in production, confusing API consumers. Exposed in documentation if swagger is public-facing.
- Fix approach: Replace with env var: `url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000'`

---

## Database & State Management Issues

**Optimistic Concurrency Without Conflict Resolution:**
- Issue: New `AgentExecution` schema includes `version` field for optimistic concurrency (line 333, schema.prisma), and `AgentExecutionLease` includes versioned lease (line 388). No corresponding conflict resolution logic visible in execution service.
- Files: `packages/database/prisma/schema.prisma` (version fields added), `apps/platform-api/src/modules/runtime/ExecutionRuntimeService.ts` (no version-conflict handling shown)
- Impact: Concurrent updates to same execution can silently fail or overwrite. Distributed workers holding leases cannot safely renew if version check is missing.
- Fix approach: Implement version check in `ExecutionRepository.update()`: retry with backoff on version mismatch, or return conflict error for caller to handle. Document optimistic locking SLA.

**Execution Event Sequencing:**
- Issue: `AgentExecutionEvent` table includes `sequence` (BigInt) and unique constraint on `[executionId, sequence]`, but schema and comments suggest this is for event sourcing. No corresponding event replay service or event store visible yet.
- Files: `packages/database/prisma/schema.prisma` (AgentExecutionEvent model, line 360), `packages/domain/src/execution/ExecutionReplayService.ts` (interface only, from bootstrap imports)
- Impact: Events persisted but not replayed or validated. "Deterministic replay" (mentioned in Execution.ts line 40, ADR-040) cannot work without event store.
- Fix approach: Implement event replay logic in `ExecutionReplayService`. Add integration test verifying replay produces identical state as original execution.

**Checkpoints & Failover Semantics Undefined:**
- Issue: `AgentExecutionCheckpoint` model exists (providerRequest, providerResponse, usage, finishReason, toolCalls) but purpose unclear. Is this for resumption after failure? Deterministic replay?
- Files: `packages/database/prisma/schema.prisma` (line 391), no corresponding service visible
- Impact: Unclear how checkpoints are used. Risk of stale checkpoint data persisting. Failover behavior untested.
- Fix approach: Document checkpoint lifecycle and usage in ADR or architecture doc. Add service for checkpoint validation and cleanup. Test failover path that loads from checkpoint.

---

## Performance & Scaling Concerns

**Polling-Based Health Integration (15s Latency):**
- Issue: (Described above under "AIGateway Health Polling Lag") Polling interval of 15 seconds may be too coarse for fast-failing scenarios.
- Files: `apps/platform-api/src/modules/runtime/providers/AIGatewayProviders.ts`
- Impact: Slow failover detection. Requests routed to degraded provider for up to 15 seconds.
- Fix approach: Reduce interval to 5 seconds (CPU cost tradeoff), or implement event-driven health updates in AIGateway.

**Execution Snapshot Granularity Unspecified:**
- Issue: `AgentExecutionSnapshot` model stores full state snapshot per execution, but no guidance on snapshot frequency or pruning strategy.
- Files: `packages/database/prisma/schema.prisma` (line 371)
- Impact: Unbounded growth of snapshot rows per execution. Large executions with many steps generate many snapshots. Storage and query performance degrade.
- Fix approach: Define snapshot policy: every N events, or on state change threshold only? Add TTL or pruning job for old snapshots. Monitor snapshot table growth in production.

**Metric Accumulation Strategy Missing:**
- Issue: `AgentExecutionMetric` table stores individual metrics with timestamp. No aggregation, retention, or export strategy visible.
- Files: `packages/database/prisma/schema.prisma` (line 381)
- Impact: Metrics table grows unbounded. Querying becomes slow. Observability systems may not ingest individual metrics efficiently.
- Fix approach: Define metrics lifecycle: export to observability platform (Prometheus, DataDog) in real-time, then prune from database after 30 days. Or pre-aggregate (min/max/p95) on ingest.

---

## Architecture & Abstraction Gaps

**Phase 9 Execution Aggregate Marked Deprecated:**
- Issue: `Execution` class in `packages/domain/src/execution/Execution.ts` (line 110) marked `@deprecated`: "This Phase 9 implementation is being superseded by Phase P5 Durable Event Sourcing in `packages/runtime-core/src/execution/`. Use `ExecutionManager` and `ExecutionEvent` instead."
- Files: `packages/domain/src/execution/Execution.ts`, `packages/runtime-core/src/execution/` (new implementation location)
- Impact: Two competing execution abstractions in codebase. Confusion about which to use. Risk of buggy code using deprecated version. Migration path unclear.
- Fix approach: Complete migration to Phase P5 implementation. Update all code to use `ExecutionManager` and `ExecutionEvent`. Remove Phase 9 classes. Document migration in architecture ADR.

**Tool Provider Not Implemented:**
- Issue: `ToolProvider` interface exists (packages/runtime-core/src/plugins/CapabilityProvider.ts, line 75) with `invokeTool()` and `listAvailableTools()` methods, but no real implementation visible. Only `invokeModelWithTools()` (LLM tool calling) exists.
- Files: `packages/runtime-core/src/plugins/CapabilityProvider.ts` (interface), no corresponding `packages/runtime-core/src/providers/ToolProvider.ts` or similar
- Impact: Tools cannot be invoked as first-class capabilities. Tool results cannot be passed back to LLM in agentic loop (only direct LLM tool calls work). Limits agent autonomy.
- Fix approach: Implement `ToolProvider` backed by registered tool registry. Coordinate with `ToolRuntime` and `ToolRegistry` (already in bootstrap).

---

## Test Coverage & Verification Gaps

**Test Coverage Sparse (32% of Packages):**
- Issue: Only 41 of 129 packages define `test` script. 88 packages have no test configuration.
- Files: All packages without test scripts, especially critical ones: `apps/platform-api`, `apps/studio`, `packages/runtime-core`, `packages/auth`, `packages/database`, `packages/contracts`
- Impact: No unit or integration test verification for core platform services. Risk of shipping untested code changes. Refactoring impossible without test safety net.
- Fix approach: Add unit test for all packages (even if minimal). Start with `vitest` (already used in monorepo). At minimum, test public exports and critical functions.

**ExecutionRepository Interface But No Tests:**
- Issue: `ExecutionRepository.ts` is interface-only contract. No tests verify implementations meet contract.
- Files: `packages/domain/src/repositories/ExecutionRepository.ts` (interface), no `ExecutionRepository.test.ts`
- Impact: In-memory and Prisma implementations can diverge silently. Contract changes break all implementations without warning.
- Fix approach: Create contract test that both in-memory and Prisma implementations pass. Include replay, concurrency, and edge-case scenarios.

**Provider Registration Not Tested for Double-Registration:**
- Issue: Double-registration guard in `registerAIGatewayProvider()` has no test. The guard itself is untested — calling it twice may still fail or cause undefined behavior.
- Files: `apps/platform-api/src/modules/runtime/providers/AIGatewayProviders.ts`, no test file visible
- Impact: Hot-reload bug can occur without warning. Test suite does not catch regression.
- Fix approach: Add test: `AIGatewayProviders.test.ts` with case for registering provider twice in watch mode simulation.

---

## Development Workflow Friction

**TypeScript Compiler Warnings Accumulating:**
- Issue: Recent fix added "dummy index files to empty packages to fix TS18003 typecheck errors" (commit 15220df). This indicates empty packages were breaking builds, rather than being excluded or properly configured.
- Files: All packages with dummy `index.ts` files added (specific files unknown without deep search), affected packages not yet identified
- Impact: Dummy files clutter codebase. TS18003 suggests missing barrel exports or wrong tsconfig settings. Symptom, not root cause, treated.
- Fix approach: Identify packages with dummy index.ts. Either (a) add real exports and documentation, (b) mark as internal/unused and move to `.audit-quarantine/`, or (c) fix tsconfig excludes to omit them from typecheck.

**Manual Dependency Pinning (pnpm overrides):**
- Issue: Root `package.json` includes large `pnpm.overrides` section (22 entries) to enforce specific versions globally (postcss, multer, lodash, uuid, etc.). Indicates indirect dependency conflicts or security patches applied downstream.
- Files: Root `package.json` (lines 87-109)
- Impact: Fragile — override changes require root package.json update. Hard to track why each override exists. Risk of breaking downstream packages if override is removed.
- Fix approach: Document each override with GitHub issue link or security advisory. Add comments to root package.json explaining rationale. Audit overrides quarterly to remove stale ones.

---

## Known Technical Debt References

**hiveforge/TECHNICAL-DEBT.md §2 (Referenced But Not Found):**
- Issue: Comment in `bootstrap.ts` (line 61) references "see hiveforge/TECHNICAL-DEBT.md §2" regarding InMemoryExecutionRepository, but file not in repository root or apps/ subdirectory.
- Files: Reference to `hiveforge/TECHNICAL-DEBT.md` (missing or in wrong location)
- Impact: Debt is documented elsewhere but cannot be found from working directory. Fragmented tech debt tracking.
- Fix approach: Confirm file location or recreate in `.planning/` directory. Consolidate all tech debt references into single CONCERNS.md or TECHNICAL-DEBT.md file.

**audit/P0-AUTH-AUTHZ-GAP.md (Referenced But Not Found):**
- Issue: Comment in `bootstrap.ts` (line 120) references "audit/P0-AUTH-AUTHZ-GAP.md" as the finding this closes, but file not present.
- Files: Reference to `audit/P0-AUTH-AUTHZ-GAP.md` (missing)
- Impact: Audit findings not actionable or reviewable. Cannot verify fix is complete.
- Fix approach: Locate or recreate audit document. Add to `.planning/audits/` directory with date and status.

---

## Environmental & Configuration Concerns

**Workspace Configuration Mismatch:**
- Issue: `pnpm-workspace.yaml` globs `apps/*`, `packages/*`, `packages/capabilities/*`, `services/*` — repository root is not a workspace member. Root Next.js app, `app/`, `components/`, `lib/` are entirely outside workspace management.
- Files: `pnpm-workspace.yaml` (glob patterns), root `package.json` (private: true, but not workspace member per workspace.yaml)
- Impact: Root app dependency changes not detected by workspace resolvers. `pnpm install` in root behaves differently than in workspace. Cross-workspace links may break.
- Fix approach: Test whether adding root to workspace.yaml breaks anything (runs root lint/typecheck). If safe, add root entry. Document workspace boundary in README.

**Incomplete `.env.example` Files:**
- Issue: Multiple `.env.example` files exist (noted in README: "copy `apps/studio/.env.example` to `apps/studio/.env.local`"), but completeness and accuracy unknown from current analysis.
- Files: `apps/studio/.env.example`, likely others in `apps/`, `services/`
- Impact: Developers may miss required env vars. Local setup fragile. CI environment setup error-prone.
- Fix approach: Audit all .env.example files. Ensure every env var used in code has an entry. Add default values where safe (public URLs, non-secrets). Document each var's purpose.

---

## Summary of Critical Paths Forward

**Immediate (Blocking):**
1. Commit or discard 189 uncommitted changes (document decision)
2. Fix validation pipeline coverage: add typecheck/lint to 105 packages and root
3. Implement PrismaExecutionRepository to replace in-memory version
4. Verify schema migration and prisma:generate run successfully

**High Priority (1-2 weeks):**
5. Reconstruct deleted strategic docs (CAPABILITY_ARCHITECTURE, COMMERCIAL_STRATEGY, etc.)
6. Implement ExecutionProvider for Workflow, Tool, Evaluation kinds
7. Add event replay service for deterministic execution
8. Audit CI workflows for YAML correctness; add linting gate

**Medium Priority (ongoing):**
9. Add test coverage to 88 packages without tests
10. Migrate Phase 9 Execution to Phase P5 implementation
11. Implement ToolProvider and integrate with tool registry
12. Document execution lifecycle (snapshots, checkpoints, leases) with examples

---

*Concerns audit: 2026-08-04*
