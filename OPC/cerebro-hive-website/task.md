# Task Tracker: Milestone 23 - Dataflow Typing

## Phase 1: Semantic Type System
- `[x]` Scaffold Type Hierarchy (Primitive, Structured, AI, Collection, Generic)
- `[x]` Define Typed Ports (`InputPort`, `OutputPort`)
- `[x]` Implement Type Compatibility Registry (Implicit, Explicit, Invalid)

## Phase 2: Compiler Passes
- `[x]` Enrich `SymbolTable` to track types, nullability, and schemas
- `[x]` Implement `TypeInferencePass` (Hybrid static/dynamic type resolution)
- `[x]` Implement `SemanticValidationPass` (Actionable diagnostics and coercion hints)

## Phase 3: Integration
- `[x]` Update Node definitions to declare strict input/output ports
- `[x]` Wire Passes into `CompilerEngine` pipeline
