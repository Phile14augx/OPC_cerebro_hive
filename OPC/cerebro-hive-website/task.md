# Task Tracker: Milestone 17 - Reasoning Engine

## Phase 1: Core Reasoning Models & SDK (`packages/reasoning-sdk`)
- `[x]` Define `ReasoningStrategy` interface (initialize, execute, evaluate, finalize)
- `[x]` Define structured telemetry events (`REASONING_STARTED`, `BRANCH_EXPANDED`, `CONSENSUS_REACHED`, etc.)
- `[x]` Define `ReasoningSummary` payload for Episodic Memory integration

## Phase 2: Reasoning Service Core (`services/reasoning-service`)
- `[x]` Scaffold `ReasoningService` as a standalone cognitive subsystem
- `[x]` Implement `SelfConsistencyStrategy` (Parallel LLM calls, confidence aggregation)
- `[x]` Implement `TreeOfThoughtsStrategy` (Branch expansion, evaluation, pruning)
- `[x]` Implement `DebateStrategy` (Agent A vs Agent B, Critic judgement)

## Phase 3: Integration with HiveSwarm (`services/swarm-runtime`)
- `[x]` Implement `ReasoningProvider` which proxies execution to the standalone Reasoning Engine
- `[x]` Ensure transient reasoning "scratchpads" are dropped by default, keeping only the structured `ReasoningSummary` for Episodic Memory
