# @cerebro/contracts

## Purpose
Establishes the single source of truth for DTOs, API validation schemas, shared events, and error contracts across the CerebroHive platform.

## Public API
- `AgentEventSchema`, `AgentEvent`
- `WorkflowExecutionEventSchema`, `WorkflowExecutionEvent`
- `APIErrorSchema`, `APIError`

## Dependencies
- `zod`

## Consumers
- `apps/*`
- `services/*`
- `packages/ai`
- `packages/telemetry`
- `packages/workflow`

## Out of Scope
- Business logic or state management
- Persistence schemas or database queries
- Any direct implementations of orchestration or intelligence (e.g. Vercel AI SDK)
