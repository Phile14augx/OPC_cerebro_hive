# 0007: Runtime Lifecycle Contract

## Status
Accepted

## Context
Agents, Workflows, and evaluation tasks all have runtimes. Without a standard interface, stopping a workspace or gracefully shutting down the server requires custom logic for every type of runtime object.

## Decision
We adopt a universal `RuntimeLifecycle` state machine contract: `Registered -> Initializing -> Running -> Degraded -> Paused -> Stopping -> Stopped -> Disposed`.

## Alternatives Considered
- **Simple Start/Stop**: Rejected because it lacks the nuance required for long-running AI agents (which can be `Paused` or `Degraded`).
- **Actor Model (Erlang/Akka)**: Rejected as overkill for the current TypeScript runtime, though the state transitions conceptually mirror actor supervision.

## Consequences
- **Positive**: The `RuntimeRegistry` can uniformly manage, pause, and terminate completely distinct types of objects (e.g., an LLM Provider vs. a background web scraper).
- **Negative**: Implementing the full state machine adds boilerplate to simple tasks.

## Implementation Notes
- Contract is defined in `@cerebro/architecture-core`.

## Related ADRs
- 0005: Kernel Lifecycle Management
