# Digital Twin Studio: Smart Factory Foundation

## Scope

Build `apps/twin-studio`, a dedicated Next.js application for a horizontal Digital Twin Operating System. The first independently usable vertical slice is a simulated Smart Factory, from versioned twin creation through live operations, a Motor-07 anomaly, provenance-backed explanation, and a forked failure scenario.

The initial product is a modular monolith. It must create real, tenant-scoped persistence and working actions; it must not disguise static data as live data or show inert primary controls.

## A. Product Architecture

`apps/twin-studio` is the experience and application layer. It composes independently testable modules for twin definition, state, telemetry, operations, simulation, intelligence, and the seeded factory demo. Application modules use typed contracts and domain ports rather than direct UI business logic.

The modular monolith establishes the boundaries of the eventual control-plane, telemetry, eventing, intelligence, and simulation services. The first adapters are local/in-process or PostgreSQL backed. Later distributed adapters may replace them without altering application consumers or the UI.

## B. Domain Model

`TwinDefinition` is the canonical aggregate and its configuration is stored in immutable, publishable `TwinVersion` records. `EntityType`, `RelationshipType`, `Variable`, `Rule`, `Model`, `Agent`, `Scenario`, and `Dashboard` reference a particular version. `Entity` and `Relationship` are runtime instances that reference the active version.

`State` is separate from telemetry: it stores current and reconstructable historical operational state. `TelemetryPoint` stores observations. `Prediction`, `Recommendation`, and `SimulationRun` are derived, provenance-backed records. A scenario executes from a persisted snapshot/fork and may never mutate the live twin.

Every operational record includes organization/workspace/twin/version scope; source; observed, effective, and ingestion times; classification (`observed`, `inferred`, `predicted`, `simulated`); optional confidence and quality; and evidence references.

## C. Database Schema

The initial Prisma/PostgreSQL schema adds structured tables for:

- `DigitalTwin`, `TwinVersion`, `EntityType`, `Entity`, `RelationshipType`, `Relationship`, `Variable`
- `EntityState`, `TelemetryObservation`, `Event`, `Rule`, `Alert`
- `Scenario`, `TwinSnapshot`, `SimulationRun`, `SimulationResult`
- `Model`, `Prediction`, `Recommendation`, `RecommendationEvidence`, `AuditEvent`

All tenant-visible records contain organization and workspace foreign keys and compound indexes beginning with those keys. Operational time-series tables use `(twinId, entityId, observedAt DESC)` and `(twinId, variableId, observedAt DESC)` indexes. Definitions are indexed by `(twinId, versionNumber)` uniquely. Foreign keys enforce ownership; application repositories additionally scope every lookup by tenant. Attributes and event payloads use constrained JSON only for extensions that cannot be structurally modeled.

## D. Twin Definition Language

TDL v1 is a Zod-validated, portable JSON document persisted with each `TwinVersion`. It declares metadata, entity and relationship types, variables and units, rules, model bindings, agent declarations, and simulation configuration. Runtime entity, relationship, state, and telemetry records remain in structured tables.

Any AI-generated TDL follows: provider response -> structured parse -> Zod validation -> normalization -> policy/authorization check -> preview -> explicit application command -> persistence and audit. Raw LLM text never writes a production twin definition.

## E. System Architecture and Data Flow

```text
apps/twin-studio UI
  -> application modules
  -> twin-contracts commands / DTOs / domain events
  -> twin-domain ports
  -> PostgreSQL, in-process telemetry, event bus, simulator, AI gateway

Command -> authorization/policy -> validation -> preview if impactful
        -> transaction -> event + audit -> projections/rules -> UI refresh
```

Ports introduced from day one are `TelemetryStore`, `EventBus`, `SimulationEngine`, `AIProvider`, `KnowledgeStore`, and `ObjectStore`. The explicit State service owns live state and history independently of telemetry and scenario results.

## F. Repository Structure

```text
apps/twin-studio/
  app/                 # routes and server boundaries
  features/            # screen-level UI composition
  modules/             # bounded application modules
  components/          # reusable UI
  tests/
packages/twin-contracts/  # Zod schemas, commands, events, DTOs
packages/twin-domain/     # types, invariants, ports
packages/db/              # Prisma schema, migrations, repositories
```

## G. API Design

The first API is versioned under `/api/twins` and exposes twin CRUD, version publish, entity and relationship operations, state and telemetry queries, simulator control, event and alert queries, scenario creation/execution, and Ask Twin answers/proposals. Inputs are schema validated. Responses use shared DTOs and structured errors. Every endpoint authorizes and scopes by organization/workspace.

Commands represent intended change (`UpdateEntityStateCommand`); domain events represent established facts (`EntityStateUpdated`).

## H. UI Information Architecture

Initial navigation is Twins plus a Twin Command Center with Overview, Live State, Graph, Events, Scenarios, Ask Twin, and Configuration. The command center shows the active version, simulation-mode label, health, sync state, and current alerts. Primary controls work end to end or are visibly unavailable. Recommendations expose reason, evidence, telemetry, source, confidence, timestamp, and responsible model/provider.

## I. AI Architecture

An `AIProvider` gateway prevents model-vendor coupling. A deterministic local explanation adapter supports the seeded demo and declares its source in provenance. A configured external provider may propose structured TDL or natural-language operations but can never silently execute them. The first phase supports truthful unavailable/provider-not-configured state.

## J. Simulation Architecture

The deterministic Smart Factory simulator generates labeled simulated telemetry, state updates, events, and a Motor-07 increasing-vibration/temperature anomaly. Rules open an alert, and the scenario service forks a stored snapshot to model Motor-07 failure. Results carry the simulation run identifier and never alter live state. A recommendation estimates maintenance action with its evidence and confidence.

## K. Implementation Plan

1. Add app/package foundation, contracts, Prisma models, tenancy-safe repositories, and test harness.
2. Implement Twin Definition, versioning, entities, relationships, TDL validation, and CRUD APIs.
3. Implement state/telemetry ports and local adapters, rules/events/alerts, audit logging, and the deterministic factory simulator.
4. Build Twins and Command Center screens: graph, live state, events, and simulation-mode lifecycle controls.
5. Add snapshot/fork scenarios, simulation results, provenance-backed deterministic Ask Twin, and recommendations.
6. Add integration, tenant isolation, schema, simulation, API, and critical UI tests; verify routes, authorization, empty/loading/error states, and no falsely functional controls.

## Non-goals

Authentication replacement, external IoT connectors, distributed event infrastructure, third-party LLM configuration, forecasting, optimization, 3D, and production autonomous control are future phases. The design preserves their service ports and contracts without prematurely implementing them.
