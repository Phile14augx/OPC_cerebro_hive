# CerebroHive Studio Company Operating System Design

**Date:** 2026-08-09  
**Status:** Approved  
**Target application:** `apps/studio`  
**Primary reference:** `Recording 2026-08-08 062345.mp4` and the accompanying 75-section build specification

## 1. Objective

Implement the complete AI-company operating-system experience shown in the reference recording inside CerebroHive Studio. The finished system is an operational command center for navigating an AI-native organization, inspecting and running agents and tasks, managing personas and funnels, exploring organizational hierarchy and memory, and monitoring live system activity.

The graph is the primary interface. This is not a conventional dashboard, a marketing visualization, or a collection of decorative analytics cards.

The full approved scope will be delivered. Implementation phases define build order and verification boundaries; they are not scope cuts or optional follow-up work.

## 2. Locked Product Decisions

- The implementation belongs in `apps/studio`.
- Studio's current global authentication, tenancy, top bar, sidebar, and unrelated routes remain intact.
- The recording-inspired command-center visual system applies to the new operating-system workspace routes, not to an unrelated global redesign.
- Production uses tenant-scoped live data and never silently falls back to fabricated operational content.
- Recording-inspired fixtures are available only through an explicit development/demo mode and are visibly labeled.
- The implementation uses the progressive integrated approach: production-quality vertical slices built on shared foundations and existing services.
- Existing routes and services are extended when they already own a concept; parallel duplicate applications and backends are not created.
- React Flow, ELK, and Framer Motion already available in Studio are reused. D3 or another graph library is added only if measured layout requirements cannot be met by deterministic layout functions and ELK.
- Three.js and WebGL are excluded. The central brain effect uses SVG, CSS gradients, and bounded DOM/canvas effects.

## 3. Scope

### 3.1 Routes

The operating-system workspace provides these routes under Studio:

| Route | Responsibility |
| --- | --- |
| `/app/brain` | Radial company brain, global search, graph controls, commands, inspectors, and live activity |
| `/app/departments` | Department overview and cross-department relationships |
| `/app/departments/[id]` | Focused department DAG with agents, tools, models, data, memory, and workflows |
| `/app/agents` | Existing agent catalog upgraded to share operating-system data and navigation |
| `/app/agents/[id]` | Existing agent detail upgraded with relationships, metrics, memory, tasks, and actions |
| `/app/tasks` | Task queue, execution status, ownership, and artifacts |
| `/app/tasks/[id]` | Step-by-step execution, events, logs, artifacts, and controls |
| `/app/personas` | Persona catalog and comparison |
| `/app/personas/[id]` | Split-pane persona editor and relationship/capability graph |
| `/app/funnels` | Horizontal live funnel and pipeline visualization |
| `/app/hierarchy` | Executive, department, and agent reporting hierarchy |
| `/app/memory` | Working, episodic, semantic, organizational, document, and shared memory |
| `/app/tools` | Tool and integration inventory with agent relationships |
| `/app/models` | Model/provider inventory, assignments, health, and usage |
| `/app/activity` | Organization-wide activity and event stream |
| `/app/analytics` | Existing analytics route integrated with operating-system metrics and trace links |

The sidebar gains a clearly named Company Brain entry and an operating-system section for the new destinations. Existing navigation remains functional.

### 3.2 Functional Capabilities

- Pan, zoom, fit view, center, fullscreen, multi-select, focus mode, and minimap when the graph exceeds the compact threshold.
- Search across departments, agents, tools, models, skills, data sources, memory, workflows, tasks, humans, systems, integrations, and outputs.
- Filter by node category, department, status, relationship, health, and activity.
- Hover previews, click selection, double-click focus, connected-edge highlighting, deep links, and keyboard navigation.
- Contextual node and task inspectors displayed over the graph without route loss.
- Natural-language command input, command history, target selection, document drop support, execution state, and explicit retry/cancel behavior.
- Real local commands for search, filter, navigation, and focus.
- Real server commands for supported task creation and agent/workflow execution.
- Live graph pulses and edge activity derived from actual events rather than random animation.
- Persona editing, live funnels, hierarchy exploration, memory inspection, activity, observability, health, and analytics.
- Responsive desktop, tablet, and mobile presentations.
- Honest loading, empty, unavailable, permission, and error states on every route.

## 4. Architecture

### 4.1 Feature Boundary

The implementation is organized under a cohesive `features/company-operating-system` boundary rather than scattered page-local implementations:

```text
features/company-operating-system/
  domain/          normalized entities, edges, commands, events, and state types
  data/            live and demo data-source adapters
  graph/           normalization, layouts, React Flow conversion, and visibility rules
  commands/        parsing, validation, dispatch, history, and execution state
  realtime/        event subscription, reconnect, polling fallback, and projections
  workspace/       selection, focus, filters, search, viewport, and URL state
  components/      shared shell, graph, nodes, edges, controls, inspectors, and states
  screens/         route-level compositions
  testing/         factories, fixtures, and interaction helpers
```

Pages remain thin route adapters. Domain logic, graph transforms, command execution, and event handling are independently testable modules.

### 4.2 Shared Workspace Shell

The existing Studio platform layout remains the outer shell. A nested operating-system workspace provides:

- compact route heading and live context;
- persistent command bar;
- full-size graph or specialized primary visualization;
- shared toolbar and search/filter controls;
- overlay inspector layer;
- compact health and activity strip;
- responsive bottom navigation and bottom-sheet inspector on mobile.

This shell is shared only by the operating-system routes. It does not restyle unrelated Studio screens.

### 4.3 Graph Engine

`@xyflow/react` owns viewport, selection, hit testing, pan/zoom, keyboard movement, node rendering, and edge rendering.

Layout responsibilities are explicit:

- Company Brain: deterministic concentric radial layout. Company core is centered; departments occupy the first ring; agents and resources occupy bounded department arcs and outer rings.
- Department view: ELK layered layout for directed relationships.
- Hierarchy: ELK tree layout with stable ordering.
- Persona and memory views: small deterministic radial or bipartite layouts.
- Funnel: semantic horizontal pipeline layout rendered with shared primitives rather than forced into a graph when a pipeline is clearer.

Layouts are stable for identical inputs, execute outside render, preserve known positions when data updates, and respect a frame-time budget.

### 4.4 State

Feature state is divided into durable and transient state:

- URL state: selected entity, focused department, active filters, search query, and inspector route.
- Workspace state: current selection set, viewport, labels/edges toggles, focus mode, and inspector presentation.
- Server state: graph snapshot, entity details, task lifecycle, metrics, and command results through the existing query stack.
- Transient visual state: hover, edge pulse, initial reveal, optimistic command indicator, and notifications.

The URL is the source of truth for deep-linkable state. Server entities are not duplicated into a global client store.

## 5. Domain and Data

### 5.1 Normalized Graph Model

The graph supports these node categories:

`department`, `agent`, `tool`, `model`, `skill`, `data-source`, `memory`, `workflow`, `task`, `output`, `human`, `system`, and `integration`.

Every node has a stable tenant-scoped ID, type, label, status, department reference, health summary, capability tags, authorization-safe metadata summary, and canonical detail URL.

Edges carry semantic relationships:

`REPORTS_TO`, `COLLABORATES_WITH`, `USES`, `DELEGATES_TO`, `READS_FROM`, `WRITES_TO`, `SHARES_MEMORY_WITH`, `TRIGGERS`, `DEPENDS_ON`, and `PRODUCES`.

Every edge has a stable ID, source, target, relationship, direction, status, last-activity timestamp, and optional event intensity. No relationship is inferred in production merely to make the graph visually dense.

### 5.2 Live Data Source

A `CompanyOperatingSystemDataSource` interface shields the UI from service-specific response shapes. The live adapter aggregates existing organization, team, agent, workflow, tool/model, task, memory, analytics, and observability sources.

Before adding persistence, implementation audits existing Prisma models and service contracts. Missing persistent concepts receive migrations and tenant-scoped repositories. Personas, funnels/stages, graph relationship metadata, and task artifacts are persisted when no current owner exists.

Every server query resolves the authenticated tenant before loading data. Tenant IDs from client payloads are ignored or validated against the authenticated context.

### 5.3 Demo Data Mode

The demo adapter contains the recording-inspired sample organization and agent relationships. It is enabled only when both conditions hold:

1. the runtime is non-production; and
2. the explicit demo flag or demo query mode is enabled.

The UI displays a persistent `DEMO DATA` indicator. Live-data failures never activate demo mode automatically.

## 6. API and Realtime Contracts

The Studio API surface exposes cohesive operating-system contracts while delegating to existing services:

- `GET /api/operating-system/graph` returns an authorization-filtered graph snapshot and revision.
- `GET /api/operating-system/entities/[type]/[id]` returns inspector/detail data.
- `POST /api/operating-system/commands` validates and dispatches supported commands.
- `GET /api/operating-system/tasks` and `GET /api/operating-system/tasks/[id]` expose task summaries and detail.
- Task mutation endpoints expose only supported pause, cancel, and retry operations with idempotency keys.
- Persona and funnel endpoints provide tenant-scoped CRUD with optimistic concurrency.
- `GET /api/operating-system/events` streams authorized Server-Sent Events.

Server-Sent Events provide task lifecycle, agent status, graph activity, health, and artifact events. The client reconnects with backoff and a last-event cursor. If streaming is unavailable, a bounded polling adapter updates the same event projection without changing screen logic.

Commands use an allowlisted parser and dispatcher. Local UI commands never require a server round trip. Server commands display parse, validation, dispatch, running, completed, failed, and cancelled states. Destructive or high-impact commands require explicit confirmation.

## 7. Visual and Interaction Design

The workspace follows the recording:

- near-black/navy canvas;
- subtle square grid;
- compact sans-serif body text and monospace technical labels;
- hairline borders and translucent inspector surfaces;
- restrained department accent colors driven by design tokens;
- dense graph composition with sparse chrome;
- tiny outlined utility nodes and larger glowing department nodes;
- central animated company-brain core with bounded particle/noise effects;
- operational labels, status chips, and relationship labels shown progressively by zoom and focus.

Motion communicates state. Initial load reveals grid, shell, core, department edges, department nodes, then the outer agent ring once per session. Hover uses a short emphasis transition. Running activity uses a bounded pulse along relevant edges. Completion and failure produce brief success or failure pulses. Continuous decorative motion is disabled under reduced motion and never dominates the graph.

Interaction contracts:

- Hover reveals a compact preview and connected relationships.
- Click selects and opens the contextual inspector.
- Shift-click adds to the selection.
- Double-click focuses the entity or opens its canonical detail view according to node type.
- Escape closes the top overlay, then clears focus.
- `/` focuses graph search while preserving Studio's global command-palette shortcut.
- Enter executes a focused command or opens the focused result.
- Arrow keys move among spatially adjacent accessible nodes.

## 8. Responsive and Accessible Behavior

Desktop targets 1920×1080, 1600×900, and 1440×900 with full graph, toolbar, command bar, and side inspector.

Tablet collapses the global navigation, reduces persistent labels, and presents inspectors as floating panels.

Mobile gives the graph the viewport, uses compact bottom navigation, converts inspectors to bottom sheets, limits simultaneous labels, and preserves search, focus, selection, and task actions.

All controls have accessible names and visible focus states. Status changes are announced through polite live regions. Graph entities are reachable through an equivalent list/tree representation, so the workflow does not depend on pointer precision or visual edge interpretation. Reduced-motion mode disables particles, continuous pulses, animated edge travel, and spatial transitions in favor of short fades.

## 9. Loading, Empty, and Error Handling

Initial loading uses the specified restrained graph reveal rather than a generic spinner. Subsequent refreshes retain the current graph and display non-blocking update state.

Empty states explain which entity type is missing and offer an authorized next action. Permission states do not reveal entity names or counts. API failures preserve recoverable workspace state and expose retry. Stream disconnection is visible but does not disable read-only graph interaction. Command failures retain input and show the validated failure reason. Partial aggregation failures identify the unavailable source while rendering authorized data from healthy sources.

## 10. Security and Privacy

- Every query and mutation is tenant-scoped on the server.
- Entity metadata sent to the graph is a minimum-safe summary; secrets, prompts, document content, raw memory content, and credentials are excluded.
- Detail endpoints enforce entity-level authorization.
- Command targets and actions are allowlisted and validated server-side.
- Task mutations require authorization and idempotency keys.
- Event streams filter every event by tenant and user permissions.
- Dropped documents use the existing upload and scanning pipeline rather than direct graph storage.
- Logs and telemetry redact command content and entity data according to existing policy.

## 11. Performance Budgets

- Initial interactive workspace at the target desktop viewport: no more than 2.5 seconds on the project's standard local performance profile.
- Graph interaction: maintain 50–60 FPS for the approved demo organization and at least 30 FPS at the supported stress-test size.
- Default supported graph: 500 visible nodes and 1,500 visible edges using progressive labels and filtering.
- Layout work must not block the main thread for more than 50 ms continuously; larger layouts use chunking or a worker.
- Search response after local index creation: under 100 ms.
- Inspector opening after selection: under 150 ms when summary data is already loaded.
- Live updates patch affected nodes and edges without rebuilding the entire graph.

## 12. Testing and Quality Gates

### Unit and Component Tests

- graph normalization and authorization-safe projections;
- stable radial, DAG, hierarchy, persona, and memory layouts;
- relationship filtering and focus-mode visibility;
- command parsing, validation, local dispatch, and server dispatch state;
- workspace reducer and URL synchronization;
- node, edge, toolbar, search, command bar, inspector, empty, and error components;
- reduced-motion and responsive presentation rules.

### API and Integration Tests

- graph aggregation across live sources;
- tenant isolation for every read, mutation, and event stream;
- persona and funnel concurrency behavior;
- task create, execute, pause, cancel, retry, event, and artifact lifecycle;
- SSE reconnect and polling fallback;
- live-data failure never activates demo fixtures.

### End-to-End and Visual Tests

The required end-to-end path is:

1. open Company Brain;
2. pan the graph;
3. zoom into a department;
4. select an agent;
5. open its inspector;
6. create a task;
7. observe real graph activity;
8. inspect task execution and artifacts;
9. navigate to Personas;
10. edit and persist a persona;
11. navigate to Funnel;
12. inspect a pipeline stage;
13. navigate to Hierarchy;
14. select a department leader;
15. return to Company Brain with workspace state restored.

Visual snapshots cover all operating-system routes at the three desktop targets, tablet, and mobile. Accessibility tests cover keyboard-only execution, semantic inspector alternatives, focus management, contrast, and reduced motion. Performance tests cover the approved demo graph and the 500-node stress graph.

The final quality gate requires install, lint, typecheck, unit tests, integration tests, end-to-end tests, production build, runtime smoke testing, accessibility checks, visual review, and performance budgets to pass for the touched Studio scope.

## 13. Implementation Sequence

1. Foundation: normalized domain, live/demo data boundary, operating-system shell, tokens, shared state, shared API contracts, and testing utilities.
2. Company Brain: radial graph, nodes, edges, command interface, toolbar, search/filter/focus, inspectors, initial load, and live activity.
3. Departments, Agents, and Tasks: focused DAGs, upgraded existing agent routes, task queue/detail, execution controls, events, logs, and artifacts.
4. Personas, Funnels, and Hierarchy: persistence, editing, live pipeline, relationship visualization, and reporting structure.
5. Memory, Tools, Models, Activity, Analytics, Observability, and Health: remaining operating-system routes and cross-links.
6. Integration hardening: tenancy, authorization, realtime reconnect, degraded states, responsive behavior, accessibility, and performance.
7. Full validation: execute all quality gates and the complete end-to-end workflow, then resolve every in-scope failure before handoff.

Each sequence ends with targeted verification, but implementation continues through sequence 7 before the feature is considered complete.

## 14. Acceptance Criteria

The implementation is complete only when:

- every route in Section 3 resolves and implements its stated responsibility;
- all specified interactions perform real state changes or clearly report unavailable capability;
- production screens contain no fabricated operational counts, events, health, or activity;
- demo mode is explicit, non-production-only, and visibly labeled;
- the graph and specialized views use consistent entities, relationships, commands, and inspectors;
- Studio's unrelated routes and global shell remain functional;
- tenant isolation and authorization tests pass;
- loading, empty, permission, partial-failure, and error states are implemented;
- responsive, keyboard, screen-reader, contrast, and reduced-motion behavior passes validation;
- performance budgets are met;
- the full 15-step end-to-end workflow passes;
- lint, typecheck, tests, build, and runtime smoke checks pass for the touched scope.

