# Task Tracker: Milestone 21 - Execution Planner (IR)

## Phase 1: Canonical Execution IR Definition
- `[x]` Scaffold `ExecutionPlan` interfaces (Metadata, Graph, Stages, Resources, Diagnostics)
- `[x]` Define `Stage` model (Parallel execution boundary, Typed inputs/outputs placeholder)
- `[x]` Define `Resource` model (Provider, Identifier, Estimated Cost)

## Phase 2: Execution Planner Logic
- `[x]` Implement `ExecutionPlanner` pipeline phase
- `[x]` Implement Topological Sort to group nodes into parallel `Stages`
- `[x]` Implement `CostEstimator` phase to aggregate resource costs

## Phase 3: Integration
- `[x]` Update `CompilerPipeline` to emit `ExecutionPlan` instead of naive `VisualSchema`
