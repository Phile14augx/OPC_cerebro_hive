# @cerebro/workflow

## Purpose
Provides orchestration primitives, DAG validation, and execution planning for autonomous agents and structured business processes.

## Public API
- `WorkflowGraph`, `DAGNode`
- Planners and state machines

## Dependencies
- `@cerebro/contracts`
- `@cerebro/telemetry`

## Consumers
- `apps/flow` (CerebroFlow)
- `apps/forge` (Agent Engine)
- `packages/ai`

## Out of Scope
- Specific Cloud Provider integrations (e.g. AWS Step Functions execution)
- Application-specific business rules
- Database persistence (should be handled by applications/services consuming `@cerebro/database`)
