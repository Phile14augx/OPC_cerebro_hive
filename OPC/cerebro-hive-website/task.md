# Task Tracker: Milestone 23.1 & 24 - Pluggable Types and Incremental Compilation

## Phase 1: M23.1 Declarative Type Registry
- `[x]` Define `CompatibilityRule` interface
- `[x]` Refactor `TypeRegistry` into a declarative, pluggable rules engine
- `[x]` Introduce `GenericType` and `UnionType` skeleton interfaces

## Phase 2: M24 Incremental Compilation State
- `[x]` Elevate `DependencyGraph` to a first-class Compilation Artifact
- `[x]` Introduce `CompilationCache` for persisting Versioned Symbol Snapshots
- `[x]` Implement `DirtyNodePropagation` logic based on AST diffs

## Phase 3: M24 Engine Orchestration
- `[x]` Centralize dirty-tracking in the `CompilerEngine`
- `[x]` Update engine to execute passes selectively on affected subgraphs
- `[x]` Ensure Passes remain pure and ignorant of incremental logic
