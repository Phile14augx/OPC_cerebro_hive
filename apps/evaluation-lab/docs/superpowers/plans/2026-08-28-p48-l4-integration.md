# P48 L4 Production Integration Seam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a P48-owned L4 orchestration seam with explicit lifecycle persistence, neutral external ports, real P48 evaluation/benchmark/adversarial behavior, deterministic telemetry, failure propagation, and exact-once package test discovery.

**Architecture:** `EvaluationService` is the in-memory persistence and lifecycle authority. `EvaluationLayerHarness` composes it with real P48 services and four neutral ports; it does not bind a product ID, route, subject, or transport. Package-local tests use deterministic in-process adapters at those ports.

**Tech Stack:** TypeScript, NestJS service classes, Vitest, ESLint, `tsc`.

**Spec:** `apps/evaluation-lab/docs/superpowers/specs/2026-08-28-p48-l4-integration-design.md`

## Global Constraints

- Source SHA is `fef127ff276290f09b5d71aaeb4bc20a4ac9ef37` on CODEX-owned `integration/p48-l4`.
- Change only `apps/evaluation-lab/**` and the P48-owned `docs/CONSUMED_CONTRACTS.md` / `docs/HANDOFF.yaml`.
- Do not edit root manifests/locks, `.github/**`, shared packages, layer branches, recovery paths, quarantine, control files, or Antigravity-owned worktrees.
- Use `ModelInferencePort`; do not bind P17, P45, HTTP, gRPC, NATS, or a provider package.
- State sequence is `REGISTERED -> AUTHORIZED -> INFERENCE_COMPLETED -> EVALUATED -> BENCHMARKED -> COMPLETED`; any non-terminal stage may become `FAILED`.
- Persist the first terminal outcome immutably and rethrow the exact original dependency failure.
- Completion outcome publication happens only after benchmark data is persisted.
- Use one authoritative Vitest configuration; include package source/L4 tests exactly once and exclude `dist/**` and unrelated output.

---

### Task 1: Package and consumed-contract boundaries

**Files:**
- Modify: `apps/evaluation-lab/package.json`
- Modify: `apps/evaluation-lab/vitest.config.ts`
- Create: `apps/evaluation-lab/tsconfig.build.json`
- Modify: `docs/CONSUMED_CONTRACTS.md`

**Interfaces:**
- Produces package scripts `test:l4`, `typecheck`, `build`, and `verify:l4`.
- Produces explicit test discovery: `src/**/*.spec.ts` plus `test/l4/**/*.spec.ts`, excluding generated/unrelated paths.
- Records that inference provider ownership and P46/P47 transport subjects remain unresolved; runtime uses neutral local ports.

- [ ] **Step 1: Capture the existing discovery baseline**

Run from `apps/evaluation-lab`:

```powershell
npx vitest list --config vitest.config.ts
npm test
```

Expected baseline: exactly 6 files and 16 tests, all passing.

- [ ] **Step 2: Make package discovery explicit**

Set Vitest test configuration to:

```ts
test: {
  globals: true,
  environment: 'node',
  include: ['src/**/*.spec.ts', 'test/l4/**/*.spec.ts'],
  exclude: ['dist/**', 'coverage/**', 'node_modules/**'],
}
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:l4": "vitest run test/l4/evaluation-layer-harness.spec.ts",
  "typecheck": "tsc -p tsconfig.json --noEmit --incremental false",
  "lint": "eslint src test --ext .ts",
  "build": "tsc -p tsconfig.build.json",
  "verify:l4": "npm run typecheck && npm run lint && npm run build && npm test"
}
```

Create `tsconfig.build.json` extending `tsconfig.json`, with `rootDir: ./src`, `outDir: ./dist`, `incremental: false`, `include: ["src/**/*.ts"]`, and exclusions for specs, `test`, `dist`, and coverage.

- [ ] **Step 3: Document contract authority**

Update `docs/CONSUMED_CONTRACTS.md` with exact facts:

```text
ModelInferencePort is UNBOUND: P48 docs name P45, portfolio IDs conflict, and no approved P17 inference contract exists.
P46/P47 integration is PORT-ONLY: documented P48 subjects differ from executable P46/P47 refs.
No transport or product binding is claimed by the L4 seam.
```

- [ ] **Step 4: Verify package contract**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm test
npx vitest list --config vitest.config.ts
```

Expected: exit 0; post-build discovery remains exactly 6 files / 16 tests.

- [ ] **Step 5: Commit**

```powershell
git add apps/evaluation-lab/package.json apps/evaluation-lab/vitest.config.ts apps/evaluation-lab/tsconfig.build.json docs/CONSUMED_CONTRACTS.md
git commit -m "build(P48): close L4 package and contract boundaries"
```

### Task 2: Persisted lifecycle state machine

**Files:**
- Modify: `apps/evaluation-lab/src/evaluations/evaluation.service.spec.ts`
- Modify: `apps/evaluation-lab/src/evaluations/evaluation.service.ts`

**Interfaces:**
- Produces `EvaluationLifecycleState`, `EvaluationFailure`, `BenchmarkOutcome`, and clone-safe `EvalResult`.
- Produces transition methods `authorizeEvalRun`, `recordInferenceCompleted`, `recordEvaluation`, `recordBenchmark`, `completeEvalRun`, and `failEvalRun`.
- Terminal completion/failure methods are idempotent and preserve the first terminal record.

- [ ] **Step 1: Write lifecycle RED tests**

Add tests that create a run and assert these literal successive states:

```text
REGISTERED, AUTHORIZED, INFERENCE_COMPLETED, EVALUATED, BENCHMARKED, COMPLETED
```

Assert stored inference outputs, literal metric values, benchmark pass/fail details, tenant/trace/target identity, and that invalid predecessor transitions throw `ConflictException`.

- [ ] **Step 2: Verify RED**

```powershell
npx vitest run src/evaluations/evaluation.service.spec.ts
```

Expected: fail because lifecycle types/methods do not exist and current state is `CREATED`.

- [ ] **Step 3: Implement minimal lifecycle persistence**

Use this state union:

```ts
export type EvaluationLifecycleState =
  | 'REGISTERED'
  | 'AUTHORIZED'
  | 'INFERENCE_COMPLETED'
  | 'EVALUATED'
  | 'BENCHMARKED'
  | 'COMPLETED'
  | 'FAILED';
```

Persist structured failure as `{ stage, code, message }`; accept the original cause in `failEvalRun` but store only deterministic serializable fields. Return `structuredClone` values from public read/transition APIs.

- [ ] **Step 4: Add terminal-idempotence RED tests**

Assert a second completion cannot replace metrics/benchmark data and a second failure cannot replace the first `{ stage, code, message }`. Assert completing a failed run and failing a completed run return the first terminal record unchanged.

- [ ] **Step 5: Implement terminal guards and verify GREEN**

```powershell
npx vitest run src/evaluations/evaluation.service.spec.ts
npm test
```

Expected: lifecycle spec and all existing tests pass.

- [ ] **Step 6: Commit**

```powershell
git add apps/evaluation-lab/src/evaluations/evaluation.service.ts apps/evaluation-lab/src/evaluations/evaluation.service.spec.ts
git commit -m "feat(P48): persist explicit evaluation lifecycle"
```

### Task 3: Production integration ports and primary harness

**Files:**
- Create: `apps/evaluation-lab/src/integration/evaluation-layer.contracts.ts`
- Create: `apps/evaluation-lab/src/integration/evaluation-layer.harness.ts`
- Create: `apps/evaluation-lab/src/integration/index.ts`
- Create: `apps/evaluation-lab/test/l4/evaluation-layer-harness.spec.ts`

**Interfaces:**
- Produces exact neutral ports `ModelInferencePort`, `AuthorizationPort`, `MLOpsEvaluationPort`, and `ObservabilityPort`.
- Produces `EvaluationLayerHarness.run(request, context): Promise<EvalResult>`.
- Uses real `EvaluationService.executeMetricComputation`, `BenchmarkRegistryService.validateEvalResult`, and `AdversarialService.scanForInjection`.

- [ ] **Step 1: Write primary-flow RED tests**

Create deterministic in-test adapters and assert:

```text
validation -> REGISTERED -> authorization -> adversarial scan -> inference
-> real metric computation -> real benchmark gate -> MLOps outcome
-> COMPLETED persistence -> completion telemetry
```

Include one passing and one failing benchmark. A failed benchmark is a successfully completed evaluation whose published result is `FAIL`.

- [ ] **Step 2: Write boundary RED tests**

Prove unauthorized requests invoke no inference/MLOps/observability call; tenant mismatch invokes neither inference nor metric computation; blank identity, empty inputs/expected, unsupported metrics, unsafe input, and inference cardinality mismatch throw deterministic Nest exceptions.

- [ ] **Step 3: Verify RED**

```powershell
npm run test:l4
```

Expected: fail because integration contracts and harness do not exist.

- [ ] **Step 4: Implement neutral contracts and orchestration**

Use product-neutral request/response contracts from the spec. Do not include P17/P45 names or transport subjects. Preserve `tenantId` and `traceId` in inference and telemetry payloads.

On failure after registration:

```ts
const failed = evaluations.failEvalRun(id, currentStage, error);
try { await observability.publish(failureEvent(failed, error)); } catch {}
throw error;
```

The rethrow must be the same object/value caught.

- [ ] **Step 5: Verify GREEN**

```powershell
npm run test:l4
npm test
```

Expected: exactly 7 files discovered once; all tests pass.

- [ ] **Step 6: Commit**

```powershell
git add apps/evaluation-lab/src/integration apps/evaluation-lab/test/l4
git commit -m "feat(P48): add L4 evaluation integration harness"
```

### Task 4: Shadow isolation, module exports, and final evidence

**Files:**
- Modify: `apps/evaluation-lab/test/l4/evaluation-layer-harness.spec.ts`
- Modify: `apps/evaluation-lab/src/integration/evaluation-layer.harness.ts`
- Modify: `apps/evaluation-lab/src/evaluations/evaluation.service.ts`
- Modify: `apps/evaluation-lab/src/adversarial/adversarial.module.ts`
- Modify: `apps/evaluation-lab/src/evaluations/evaluation.module.ts`
- Modify: `docs/HANDOFF.yaml`

**Interfaces:**
- Produces `runShadowEvaluation(primaryEvaluationId, request, context)` with a distinct `shadowOf` run.
- Exports real benchmark/adversarial services for P48-local composition without binding external adapters.
- Produces READY_FOR_QA handoff metadata bound to the implementation commit.

- [ ] **Step 1: Write shadow/failure RED tests**

Assert a flagged-trace shadow run has its own ID and `shadowOf`, while the primary record remains deeply equal to its pre-shadow snapshot after both shadow success and shadow failure. Assert failure telemetry carries the identical original `Error` object and terminal retry makes no additional external calls.

- [ ] **Step 2: Verify RED**

```powershell
npm run test:l4
```

Expected: fail because `runShadowEvaluation` and shadow metadata do not exist.

- [ ] **Step 3: Implement shadow isolation and module exports**

Create a distinct persisted run for every shadow invocation. Export `AdversarialService`; import `BenchmarkModule` and `AdversarialModule` from `EvaluationModule` without adding external port providers.

- [ ] **Step 4: Run full verification**

```powershell
npm run typecheck
npm run lint
npm run build
npm test
npm test
npx vitest list --config vitest.config.ts
git diff --check fef127ff276290f09b5d71aaeb4bc20a4ac9ef37..HEAD
```

Expected: every command exits 0; both unconstrained runs and list show exactly 7 files with the same test count.

- [ ] **Step 5: Verify forbidden-path isolation**

```powershell
git diff --name-only fef127ff276290f09b5d71aaeb4bc20a4ac9ef37..HEAD
```

Expected: only `apps/evaluation-lab/**`, `docs/CONSUMED_CONTRACTS.md`, and `docs/HANDOFF.yaml`.

- [ ] **Step 6: Commit handoff candidate**

Update `docs/HANDOFF.yaml` to branch `integration/p48-l4`, status `READY_FOR_QA`, maturity `L3 -> L4`, and candidate SHA equal to the preceding implementation commit.

```powershell
git add apps/evaluation-lab docs/HANDOFF.yaml
git commit -m "chore(P48): prepare L4 candidate for independent QA"
```

Do not self-certify, promote, merge, or modify `layer/l10-aiops`.
