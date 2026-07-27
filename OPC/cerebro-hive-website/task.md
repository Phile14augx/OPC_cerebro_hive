# Task Tracker: Immutable Pass-Based Compiler Refactor

## Phase 1: Compilation Context & Pass Architecture
- `[x]` Scaffold `CompilationContext` model (Graph, ExecutionPlan, Diagnostics, Metrics)
- `[x]` Define `CompilerPass` plugin interface (Id, Run, Diagnostics Generation)
- `[x]` Implement `CompilerEngine` to sequentially execute passes and aggregate diagnostics immutably

## Phase 2: Metadata Enrichment
- `[x]` Update `ExecutionPlan` IR with `ExecutionPlanMetadata` (Version, sourceHash)
- `[x]` Update `Stage` model with `retryPolicy`, `timeoutMs`, `priority`, `concurrencyLimit`
- `[x]` Update `CostEstimator` with granular cost breakdown (`llmCost`, `apiCost`, `computeCost`, etc.)

## Phase 3: Pipeline Refactoring
- `[x]` Refactor `ExecutionPlanner` and `CostEstimator` to implement the `CompilerPass` interface
- `[x]` Wire `CompilerEngine` to run the updated passes
