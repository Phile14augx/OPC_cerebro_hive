# ADR 004: Replay Determinism Rules

## Status
Accepted

## Context
When replaying an event stream to reconstruct the aggregate state, the reducers must produce the exact same byte-for-byte state on every invocation. If reducers rely on ambient context (`Date.now()`, `Math.random()`, or network calls), replay will result in divergent states, causing split-brain or verification failures.

## Decision
Reducers MUST be pure functions strictly adhering to the `DeterministicReducer` contract. All non-deterministic operations must be abstracted through the `ReplayContext`, which provides a frozen clock, a seeded random number generator, and deterministic ID generators.

## Consequences
- **Pros:** 100% reproducible state, enables time-travel debugging, and allows robust snapshot verification.
- **Cons:** Developers must strictly avoid ambient non-determinism in reducers. The `RegistryVerifier` cannot statically catch all violations, so `ReplayDeterminism.test.ts` is required.
