# Task Tracker: Milestone 25 - Workflow Versioning & Semantic Migrations

## Phase 1: Semantic Diffing & Compatibility
- `[x]` Scaffold `WorkflowDiff` as a first-class compilation artifact
- `[x]` Implement `SemanticDiffEngine` to compute structural/dependency diffs
- `[x]` Implement `CompatibilityAnalyzerPass` to classify changes (Patch, Minor, Major)

## Phase 2: Migration Framework
- `[x]` Scaffold a dedicated `MigrationEngine` separate from the compiler
- `[x]` Define `MigrationProvider` interface for node-specific migration logic
- `[x]` Implement graceful fallback for partial migrations

## Phase 3: Workflow Lifecycle & Persistence
- `[x]` Define `WorkflowVersion` model wrapping all immutable release artifacts
- `[x]` Implement basic lifecycle states (Draft, Published, Deprecated)
