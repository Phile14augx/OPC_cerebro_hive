# 0001: Event-Driven Architecture

## Status
Accepted

## Context
As the Enterprise AI OS scales, adding new modules (e.g. Analytics, Trust, Notifications, HiveShield) causes tight coupling if they directly call one another via APIs. Direct calls lead to brittle architecture and circular dependencies.

## Decision
We will adopt an Event-Driven Architecture (EDA) as the primary communication fabric across the OS Kernel. All domain-level state changes (e.g. `WorkflowStarted`, `AgentCreated`, `PolicyViolation`) will be emitted as standardized `DomainEvent` objects to a central `EventBus`.

## Alternatives Considered
- **Direct RPC/HTTP calls**: Rejected due to tight coupling and poor fault tolerance.
- **Shared Database Polling**: Rejected due to latency and scalability bottlenecks.

## Consequences
- **Positive**: High decoupling; modules can be added or removed without breaking upstream components.
- **Negative**: Tracing execution flows becomes harder, necessitating robust correlation IDs and telemetry.

## Implementation Notes
- The `EventBus` interface is abstracted in `@cerebro/core-bus`.
- Initial implementation is `MemoryEventBus`, which will be swapped for `NatsEventBus` in production.

## Related ADRs
- 0003: OpenTelemetry Facade
