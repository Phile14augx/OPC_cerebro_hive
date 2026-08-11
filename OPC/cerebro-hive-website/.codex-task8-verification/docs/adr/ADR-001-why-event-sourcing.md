# ADR 001: Why Event Sourcing?

## Status
Accepted

## Context
Agent workflows are often long-running, non-deterministic, and involve external side-effects (LLMs, API calls). If a process crashes, we must recover the agent's exact state without re-running non-deterministic LLM calls or duplicating external side effects.

## Decision
We will use Event Sourcing for the core execution runtime. Every state mutation is recorded as a domain event (e.g., `ExecutionStarted`, `PromptPrepared`, `LLMCompleted`) in an append-only store.

## Consequences
- **Pros:** Perfect audit log, time-travel debugging, zero data loss, exact state recovery after crashes.
- **Cons:** Event schema versioning (upcasting) is required. State must be derived via replay, which requires snapshots for performance on long executions.
