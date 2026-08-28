# P48 L4 Production Integration Seam Design

## Scope and authority

P48 owns the integration seam implemented in `apps/evaluation-lab`. It does not own upstream inference, MLOps, observability, authorization, shared runtime, Kernel, or layer implementations. Runtime code therefore depends on narrow TypeScript ports and does not invent HTTP routes, NATS subjects, product identifiers, or transport adapters.

The source is the L3-certified commit `fef127ff276290f09b5d71aaeb4bc20a4ac9ef37` on the CODEX-leased branch `integration/p48-l4`.

## Contract authority ruling

The repository has no globally consistent product binding for model inference. P48 documentation names P45, the portfolio ledger assigns P45 to another product, and no approved P17 inference contract exists. P46 and P47 event subjects declared by P48 also differ from their executable product refs.

The L4 seam therefore exposes neutral ports:

- `ModelInferencePort` for batched target inference.
- `AuthorizationPort` for `evaluation:run` decisions.
- `MLOpsEvaluationPort` for publishing a transport-neutral evaluation outcome.
- `ObservabilityPort` for evaluation lifecycle telemetry.

`docs/CONSUMED_CONTRACTS.md` records the unresolved provider/product and event-subject divergences. No port is bound to P17, P45, an HTTP API, or a message subject in this phase.

## Runtime contracts

```ts
export interface EvaluationContext {
  tenantId: string;
  subjectId: string;
  traceId: string;
  permissions: readonly string[];
}

export interface EvaluationDataset {
  id: string;
  tenantId: string;
  inputs: readonly string[];
  expected: readonly string[];
}

export interface RunEvaluationRequest {
  targetId: string;
  dataset: EvaluationDataset;
  metrics: readonly ('accuracy' | 'precision' | 'recall')[];
  benchmarkId: string;
}

export interface ModelInferenceRequest {
  targetId: string;
  inputs: readonly string[];
  context: EvaluationContext;
}

export interface ModelInferenceResponse {
  outputs: readonly string[];
}

export interface ModelInferencePort {
  infer(request: ModelInferenceRequest): Promise<ModelInferenceResponse>;
}
```

The authorization, MLOps, and observability ports carry the same opaque tenant and trace context. Failure telemetry receives the original thrown value as `cause`; persisted failure metadata stores a deterministic stage, error name/code, and message.

## Lifecycle and persistence

`EvaluationService` remains the P48-owned persistence boundary. Its stored lifecycle is:

```text
REGISTERED
  -> AUTHORIZED
  -> INFERENCE_COMPLETED
  -> EVALUATED
  -> BENCHMARKED
  -> COMPLETED

Any non-terminal stage -> FAILED
```

Every transition validates its predecessor. Terminal `COMPLETED` and `FAILED` records are immutable: repeated completion or failure handling returns the first stored terminal record without overwriting metrics, benchmark results, or failure metadata.

Stored runs include tenant/trace/target identity, inference output, computed metrics, benchmark result, optional `shadowOf`, and structured failure metadata. Read APIs return clones so callers cannot mutate persisted state.

## Orchestration flow

`EvaluationLayerHarness.run(request, context)` performs:

1. Deterministic structural validation with no external call.
2. Create and persist `REGISTERED`.
3. Reject cross-tenant datasets before inference or metric computation.
4. Call authorization before inference, MLOps, or observability ports.
5. Persist `AUTHORIZED`.
6. Scan dataset inputs with the real `AdversarialService`; unsafe inputs fail.
7. Invoke `ModelInferencePort` with tenant/trace context.
8. Reject output cardinality mismatch and persist `INFERENCE_COMPLETED` only for valid output.
9. Execute the real `EvaluationService.executeMetricComputation` and persist `EVALUATED`.
10. Execute the real `BenchmarkRegistryService.validateEvalResult` and persist `BENCHMARKED` for both passing and failing gates.
11. Publish the transport-neutral MLOps outcome only after metrics and benchmark results are persisted.
12. Persist `COMPLETED`, then emit completion telemetry and return the stored result.

Any failure after registration persists `FAILED`, emits best-effort failure telemetry with the original cause, and rethrows the exact original value. Telemetry failure never replaces the product failure.

## Shadow evaluation

`runShadowEvaluation(primaryEvaluationId, request, context)` verifies the primary exists, then creates a distinct run marked `shadowOf`. It uses the same lifecycle and ports but never writes the primary record. A flagged-trace caller can invoke this API without changing the primary status, metrics, benchmark result, or failure.

## Package and discovery contract

The package owns one Vitest configuration with explicit source and L4 includes and explicit `dist/**`, coverage, node_modules, and unrelated-worktree exclusions. `npm test` and a post-build `npm test` must discover the intended package suite exactly once. Package-local scripts provide `test:l4`, `typecheck`, `lint`, and `build`; build emits production source only.

Direct Nest runtime dependencies are declared in the app package rather than root/shared manifests.

## Acceptance evidence

The L4 suite must prove:

- authorization precedes all non-authorization external calls;
- tenant mismatch and malformed/unsafe input rejection occur before inference/evaluation;
- output cardinality mismatch fails;
- real metric computation runs;
- benchmark gates pass and fail;
- outcome publication follows persisted benchmark state;
- failures persist structured metadata, emit the original cause, and rethrow by identity;
- tenant and trace reach inference and telemetry;
- shadow runs leave the primary result unchanged;
- terminal handling is idempotent;
- package-local tests are discovered exactly once before and after build;
- no root, Kernel, layer, recovery, quarantine, or Antigravity-owned path changes.
