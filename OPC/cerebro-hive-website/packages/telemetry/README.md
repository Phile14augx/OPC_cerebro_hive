# @cerebro/telemetry

## Purpose
Provides unified logging, tracing, and distributed correlation context primitives for all CerebroHive applications and services.

## Public API
- `logger.info`, `logger.error`, `logger.warn`, `logger.debug`
- `withCorrelationId`, `getCorrelationId`

## Dependencies
- Native Node.js `async_hooks`
- No third-party APM dependencies (abstracted layer)

## Consumers
- `apps/*`
- `services/*`
- `packages/ai`
- `packages/workflow`

## Out of Scope
- Vendor-specific APM implementations (e.g. Datadog SDK, New Relic)
- Cloud-specific infrastructure metrics
- Business metrics or analytics pipelines
