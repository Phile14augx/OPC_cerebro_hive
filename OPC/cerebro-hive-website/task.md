# Task Tracker: CerebroStudio Compiler Deep Dive

## Phase 1: Core Architecture
- `[x]` Scaffold `features/studio` domain architecture
- `[x]` Implement `useStudioStore.ts` utilizing `StudioGraph` domain model instead of React Flow nodes
- `[x]` Implement `NodeRegistry` plugin system

## Phase 2: The Compiler Pipeline
- `[x]` Implement `CompilerPipeline` (Normalize -> Validate -> Optimize -> Compile)
- `[x]` Implement `Diagnostics` system (Error, Warning, Hint)
- `[x]` Implement `LLMNode` and `MemoryNode` plugins with dedicated validators and compilers

## Phase 3: Validation & UI Integration
- `[x]` Wire `ReactFlowRenderer.tsx` to the `useStudioStore`
- `[x]` Implement Two-Stage Validation (Live vs Full Deployment Validation)
