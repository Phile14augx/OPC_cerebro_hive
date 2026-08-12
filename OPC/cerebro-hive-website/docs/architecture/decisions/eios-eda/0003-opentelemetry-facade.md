# 0003: OpenTelemetry Facade

## Status
Accepted

## Context
Observability (logs, metrics, traces) is critical for an AI operating system. We need standard tracing across all packages, but we do not want to tightly couple every package directly to the OpenTelemetry (OTel) SDK.

## Decision
We will expose a `TelemetryFacade` in `@cerebro/telemetry-core` that wraps OpenTelemetry. All OS components will import this facade instead of raw OTel APIs.

## Alternatives Considered
- **Direct OTel Usage**: Rejected because updating OTel versions or swapping tracing providers would require refactoring every package.
- **Custom Logging Library**: Rejected because OTel is the industry standard for distributed tracing.

## Consequences
- **Positive**: Complete portability. We can swap underlying tracing sinks (Jaeger, Datadog, Honeycomb) or mock it entirely for tests.
- **Negative**: We must maintain a mapping layer between our Facade and OTel's evolving API.

## Implementation Notes
- The facade exposes `startSpan()`, `recordMetric()`, and `recordLog()`.
- The Trust Module and Analytics Module directly consume spans and events from this facade.

## Related ADRs
- 0001: Event-Driven Architecture
