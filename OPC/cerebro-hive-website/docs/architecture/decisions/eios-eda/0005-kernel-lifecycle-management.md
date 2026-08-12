# 0005: Kernel Lifecycle Management

## Status
Accepted

## Context
As CerebroHive boots, it must initialize multiple subsystems (Identity, Telemetry, Event Bus, Config) in a specific, dependency-ordered sequence. Ad hoc initialization logic in the application entry point leads to race conditions and hidden dependencies.

## Decision
We introduce `@cerebro/kernel-core` as the OS Bootstrapper. It defines a deterministic, multi-phase boot sequence.

## Alternatives Considered
- **Decentralized Initialization (Lazy loading)**: Rejected because foundational services like Telemetry and Event Bus must be available before any application logic runs.
- **Dependency Injection Framework (Inversify, NestJS)**: Rejected for now to keep the core lightweight, though we may introduce a lightweight DI container in the future.

## Consequences
- **Positive**: Predictable startup and shutdown sequences.
- **Negative**: The Kernel must be explicitly aware of the initialization order of core platform services.

## Implementation Notes
- The Kernel manages global singletons (`ConfigManager`, `EventBus`, `CapabilityRegistry`).

## Related ADRs
- 0007: Runtime Lifecycle Contract
