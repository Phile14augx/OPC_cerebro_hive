# Task Tracker: Track B - Runtime Foundation

## Phase 1: Execution Gateway & Scheduling
- `[x]` Scaffold `ExecutionGateway` that consumes `ExecutionDescriptor`s via a `ReleaseResolver`
- `[x]` Scaffold `ExecutionScheduler` to handle diverse triggers (API, Cron, Webhook)

## Phase 2: Runtime IR & Context
- `[x]` Define `RuntimeIR` (Linear Stages, Parallel Groups) as the execution payload
- `[x]` Define the immutable `ExecutionContext` abstraction

## Phase 3: Capability & Artifact Management
- `[x]` Scaffold Versioned `CapabilityRegistry` (mapping `capability.version` to implementations)
- `[x]` Implement `ArtifactStore` and `ArtifactReference` patterns to keep Temporal payloads light

## Phase 4: State, Events, & Telemetry
- `[x]` Scaffold `ExecutionStateStore` for queryable runtime state tracking
- `[x]` Define rich `DomainEvent` taxonomy (separate from OpenTelemetry metrics pipeline)
- `[x]` Scaffold the `TemporalInterpreter` mock that orchestrates the above components
