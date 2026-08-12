# Twin Studio vs. Master Build Prompt — Gap Audit

**Date:** 2026-08-12
**Scope:** `apps/twin-studio` and its supporting packages (`twin-contracts`, `twin-domain`, `db`), audited against an 85-section "Universal AI Digital Twin Platform" master build prompt supplied by the product owner.
**Method:** Direct inspection of source files, `packages/db/prisma/schema.prisma`, git history, and `gh pr view` — no status is asserted without a cited file or command. Where evidence was inconclusive, the row says so rather than guessing.
**State audited:** `main` at commit `6863d41`, plus PR #34 (`codex/twin-industry-framework` → `main`, OPEN, MERGEABLE, all CI checks SUCCESS as of this audit) noted separately wherever it changes the picture.

## Headline finding

The master prompt is not a green-field spec — it describes a platform that is **already under active, disciplined, incremental construction** in this exact repository. The existing work is small in surface area but architecturally serious: it already follows the master prompt's own Section 83 process (design doc before code — see `docs/specifications/features/2026-08-10-digital-twin-studio-design.md`), its Section 78 AI structured-output pipeline (proposal → Zod validation → policy → preview → explicit apply), and its Section 74 phase ordering (Phase 1 foundation first, explicit non-goals for everything later). Two review cycles have already caught and fixed the exact class of bug — in-memory-only state presented as if persisted — that recurs below as this audit's top finding on `main`.

## Digital Twin Maturity Level (master prompt §55, applied to what's built)

| Level | Capability | Status |
|---|---|---|
| 1 — Descriptive | Entities/relationships modeled, viewable | **Reached.** One twin, two entities (`factory-alpha` / `Motor-07`, `Production Line A`), rendered in `features/command-center.tsx`. |
| 2 — Connected | Live telemetry feed | **Reached, simulated only.** `factory-simulator.ts` produces a deterministic tick-based feed, explicitly labeled `SIMULATED` in the UI and in every provenance record. No real connector exists (§10 — none built). |
| 3 — Predictive | Forecasting / failure prediction | **Not reached.** The "failure risk %" shown in the command center is a fixed formula (`18 + tick*11`, or `82` once the alert fires) — a demo heuristic, not a model. No model registry, no ML/statistical model, no `Prediction` table. |
| 4 — Simulation | What-if scenarios | **Reached, narrowly.** `scenario-service.ts` forks a snapshot and returns one hardcoded outcome (`-23%` throughput, `4.5h` downtime) for exactly one scenario (Motor-07 failure). Not parameterized, not general. |
| 5 — Prescriptive | Optimization | **Not reached.** No optimization engine exists anywhere in the codebase. |
| 6 — Autonomous | Authorized autonomous action | **Not reached, and explicitly out of scope** per the design doc's non-goals and master prompt §79 (correctly deferred, not a bug). |

**Overall: solidly Level 2, with narrow, honest slices of Level 1/4 built as a proof of the end-to-end architecture rather than as general capability.** This matches what the design doc promised — it was never scoped to be more than that yet.

## Section-by-section mapping

Grouped by capability area (the master prompt's 85 sections cluster into these); each cites the file(s) that back the claim.

| Master prompt area | Status | Evidence |
|---|---|---|
| §1–2 Product vision / universal WORLD→...→VARIABLE abstraction | **PARTIAL** | `TwinDefinitionSchema` (`packages/twin-contracts/src/twin-definition.ts`) models `entityTypes`/`relationshipTypes`/`variables`/`rules` generically — genuinely industry-agnostic at the type level. But only one concrete twin exists, so genericity is asserted by the schema, not yet proven by a second unrelated twin instance. |
| §3 Creation modes (NL / template / import / builder) | **PARTIAL** | Mode A (natural language → generated twin) exists narrowly via PR #34's industry generator (`modules/industry/deterministic-industry-provider.ts`, `domain-vocabulary.ts`) — deterministic keyword/vocabulary composition, not an LLM call (see §19 row). Modes B/C/D (templates, data import, visual drag-and-drop builder): **not built.** |
| §4 Twin Definition Language | **PARTIAL** | Real, versioned, Zod-validated (`TwinDefinitionSchema`). Covers `entityTypes`, `relationshipTypes`, `variables` (key+unit only), `rules` (key+expression only). Missing from the schema as first-class sections: `telemetry`, `events`, `models`, `agents`, `simulations`, `objectives`, `constraints`, `visualizations` — those exist as separate ad hoc code (simulator, scenario service) rather than declared in TDL. |
| §5 Universal entity model | **PARTIAL** | `TwinEntity` (Prisma) has `key`, `typeKey`, `attributes: Json` — flexible, but lacks explicit columns/contract fields for location, geometry, health, ownership, parent/child, or predicted/simulated-state markers described in §5. Those would currently have to be smuggled into the `attributes` JSON with no schema enforcement. |
| §6 Knowledge graph | **MISSING** | No graph store, no typed-edge persistence beyond `RelationshipType`/entity attribute JSON, no graph visualization/explorer UI. The command center's "entity graph" panel is two hardcoded `<div>` nodes, not a rendered graph. |
| §7 Live state engine (current/historical/predicted/simulated/optimized, with provenance) | **PARTIAL, well-designed where it exists** | `Provenance` type (`packages/twin-contracts/src/provenance.ts`) carries `classification: OBSERVED\|INFERRED\|PREDICTED\|SIMULATED\|MANUAL`(verify exact enum), source, confidence, quality, timestamps — this is a genuinely good implementation of §7's "never mix without provenance" rule. But there's no persisted state history — `TwinEntityState` table exists in schema but nothing in the audited app code writes to it yet. |
| §8 Event engine | **MISSING** | No event bus, no `Event` table populated, no `xxx.changed` event taxonomy. The "alert" concept in the simulator is a plain return value, not a dispatched event. |
| §9 Time-series engine | **MISSING** | No TSDB, no downsampling/aggregation/anomaly-detection/replay. `factory-simulator.ts` computes everything from the current tick number with no persisted history to query. |
| §10 Real-time data ingestion / connectors | **MISSING** | No MQTT/Kafka/OPC-UA/webhook connector exists. Explicitly a non-goal in the design doc for this phase. |
| §11 Data mapping engine | **MISSING** | No source-field-to-twin-attribute mapping UI or service exists. |
| §12 AI Twin Copilot ("Ask your twin") | **PARTIAL, but real** | `ask-twin-service.ts` answers from live simulated state with evidence + confidence + `provider: 'deterministic-local'` — provenance-first, matches §62's mandate. But it is a deterministic template, not an LLM-backed reasoning system, and it only knows about one hardcoded anomaly narrative. §79's "AIProvider gateway" is designed (non-goal note: "third-party LLM configuration... future phase") but not implemented — no vendor abstraction exists yet because no vendor is wired in at all. |
| §13 Digital Twin AI agents | **MISSING** | No agent framework, no agent goal/scope/permission model, no agent registry. (Note: this repo has a large, separate `agents/` multi-agent-coordination system for *building* the platform — not to be confused with §13's in-twin operational agents, which don't exist.) |
| §14 Predictive models / model registry | **MISSING** | No `Model` table populated, no model registry UI, no ML/statistical model integration. |
| §15 Simulation engine | **PARTIAL, narrow** | One deterministic formula-based simulator for one entity. No discrete-event, agent-based, Monte Carlo, or physics-based simulation; no external simulation engine integration. |
| §16 Scenario manager / Scenario Lab | **PARTIAL, narrow** | `scenario-service.ts` + the command center's scenario panel implement exactly one scenario end-to-end (fork → hardcoded outcome → no live mutation, correctly isolated). No scenario cloning, comparison UI, or saved/ranked scenario library. |
| §17 Optimization engine | **MISSING** | No optimization objectives, constraints, or solver of any kind. |
| §18 Causal intelligence | **MISSING** | No causal graph. The "why" behind the anomaly is one hardcoded sentence in `ask-twin-service.ts`, not a derived causal chain. |
| §19 AI-generated digital twin / §52 Industry generator | **BUILT, in PR #34 — not yet on `main`** | `modules/industry/{industry-model-provider,deterministic-industry-provider,domain-vocabulary}.ts`, `app/api/industry-models/generate/route.ts`, `features/industry-generator.tsx`. Deterministic (vocabulary-composition, not LLM) generation for airport/bank/hospital/supply-chain/building/energy-grid/data-center/factory/open-ended briefs. Preview-only; requires explicit apply via `app/api/twins/[twinId]/versions/route.ts`. This is the single largest piece of the master prompt implemented anywhere in the codebase, and it isn't merged yet. |
| §20 Ontology builder | **MISSING as a UI**; **PARTIAL as underlying capability** — `domain-vocabulary.ts` (PR #34) is effectively a starter-ontology generator, but there's no interactive builder for a user to define entity types/relationships/units by hand. |
| §21 Process digital twins | **MISSING** | No process (input→activities→decisions→resources→output) model exists; everything built so far is asset-shaped (a motor), not process-shaped. |
| §22 Spatial / §23 3D / §24 network twins | **MISSING** | No GIS, no Three.js/glTF/BIM integration, no network topology view. Explicit non-goal ("3D... future phases"). |
| §25 Document + knowledge layer / RAG | **MISSING** | No document ingestion, no chunk-to-entity linking, no vector search wired to twins (pgvector extension is declared in `schema.prisma` but not used by any twin-studio code path found). |
| §26 Twin memory (short-term/event/historical/semantic/document/agent) | **MISSING** as a named subsystem; the provenance-tagged state in §7 is the only memory-adjacent concept that exists. |
| §27 Dashboard generator | **MISSING as "generator"**; one hand-built dashboard (the command center) exists, not a generalized per-twin dashboard builder. |
| §28 Alerting / §29 Rule engine | **PARTIAL, narrow** | `TwinDefinitionSchema.rules` supports `key` + free-text `expression` (no parser/evaluator found in the audited files — the one alert shown is hardcoded threshold logic in `factory-simulator.ts`, not driven by the rule expression). No visual rule builder. |
| §30 Workflow automation | **MISSING** | No workflow engine, no ticket/approval chains. |
| §31 API / §32 SDK | **PARTIAL** | `/api/twins`, `/api/twins/[twinId]/{ask,scenarios,simulator}` exist and are thin (3–5 lines each — need to confirm they're not stubs; they at minimum route to the services audited above). PR #34 adds `/api/industry-models/generate` and `/api/twins/[twinId]/versions`. No Python/TS SDK package exists yet. |
| §33 Twin marketplace | **MISSING** — explicitly a later-phase concept, no architecture for it yet beyond the fact that TDL is portable JSON (a prerequisite, not an implementation). |
| §34–36 Multi-twin / composable / twin-to-twin comms | **MISSING** | One twin exists; no federation, composition, or twin-to-twin event exchange. |
| §37 Confidence / data quality / provenance | **BUILT, and the strongest part of the codebase** | `Provenance` (source, classification, observed/effective/ingested time, confidence, quality, evidence IDs) is attached to every simulated data point and every Ask-Twin answer. This is a real, working implementation of §37's mandate, not a stub. |
| §38 Security (multi-tenancy, SSO, RBAC, etc.) | **PARTIAL** | Tenant/workspace scoping exists in the Prisma schema and is enforced in repository-level queries per the design doc; PR #34 adds `authenticated-request-context.ts` replacing the previously spoofable header-based scope (see "Known issue on `main`" below — this exact bug existed and was fixed, but only on the PR branch). No SSO/OIDC/SAML wiring found in twin-studio itself (likely inherited from the platform's shared auth, not independently verified in this audit). |
| §39 Human-in-the-loop levels | **PARTIAL** | The apply-requires-explicit-approval flow (PR #34) is a real Level-3-style gate. No formal per-agent Level 0–4 configuration exists (no agents exist yet — §13). |
| §40 Governance / audit | **PARTIAL** | `AuditEvent` exists in the broader platform schema (used elsewhere in the monorepo); not confirmed wired to twin-specific actions in the audited files. |
| §41 Twin versioning | **BUILT** | `TwinVersion` (Prisma, unique on `twinId`+`versionNumber`) plus PR #34's version-proposal/apply flow is a genuine, working implementation of §41 — arguably the most complete single feature against the spec. |
| §42 Model registry | **MISSING** — see §14. |
| §43–47 Studio UI / Twins page / Create wizard / Command Center / Ask Your Twin | **PARTIAL** | One Command Center exists (`features/command-center.tsx`) with Overview/Live state/Graph/Events/Scenarios/Ask twin tabs *declared* but only Overview's content is actually implemented — the other tab buttons exist and are clickable (`role="tablist"`) but the referenced content per tab was not found in the audited file, so several tabs likely render the same Overview content today. No multi-twin "Digital Twins" list page beyond `listTwins()` in the service layer; no Create-Twin wizard (10-step flow in §45) exists — twin creation is a service-layer function only. |
| §48–50 Architecture / stack / data model | **BUILT, and well-followed** | The modular-monolith-with-ports design in the spec doc matches what's in the repo: `twin-contracts` (schemas/commands/events), `twin-domain` (ports), `db` (Prisma), `apps/twin-studio` (application + UI). This is a real, working instance of the target architecture, just with few of the ports' concrete adapters implemented yet. |
| §51 Simulated data mode | **BUILT** | Every data point is labeled `SIMULATED` in the UI and in provenance; this requirement is met cleanly. |
| §53 Self-extending schema | **MISSING** — no "add refrigeration equipment" natural-language schema-evolution flow exists; TDL versions are created wholesale (new version), not incrementally patched by conversation. |
| §54 OBSERVE→UNDERSTAND→PREDICT→SIMULATE→OPTIMIZE→RECOMMEND→ACT→LEARN loop | **PARTIAL** | OBSERVE (simulate) → UNDERSTAND (Ask Twin) → SIMULATE (scenario) → RECOMMEND (fixed maintenance recommendation) are represented narrowly. PREDICT, OPTIMIZE, ACT, LEARN are not. |
| §56 Twin health score | **PARTIAL** | A single composite "health score" number is shown in the UI (`100-risk`); the sub-dimensions §56 requires (connectivity, freshness, quality, model confidence, coverage) are not separately computed or surfaced — exactly the anti-pattern §56 warns against ("do not hide the component metrics behind the overall score"). |
| §57–58 Demo twins / Smart Factory demo | **BUILT, exactly as specified** | Factory Alpha / Motor-07 / vibration+temperature anomaly / predictive-sounding explanation / what-if simulation / preventive-maintenance recommendation — this is a faithful, working implementation of §58's example end-to-end. |
| §59 "Do not build a mockup" | **Respected so far.** Every button found in the audited files is wired to real (if narrow) logic; simulated data is consistently labeled. No fabricated-as-real analytics were found. |
| §60 UX principles | Not independently assessable from code alone — visual judgment call, out of scope for this audit. |
| §61 Twin generation experience (progress steps) | **PARTIAL** | PR #34's `industry-generator.tsx` has "generation progress, ontology preview, entity/relationship review" per its plan doc — matches §61's intent at a smaller scale than the master prompt's fuller step list. |
| §62 Provenance-first AI | **BUILT** — see §37; this is genuinely well done. |
| §63 Natural language twin operations | **MISSING beyond twin generation.** No "add three pumps to Zone A" style incremental NL command exists. |
| §64 Custom formulas / §65 Unit system | **PARTIAL** | `variables` in TDL carry a `unit: string` field (free text, not a real unit-conversion system); no formula builder/expression editor found. |
| §66 Temporal model (effective/observation/ingestion time) | **BUILT** | Present in both `Provenance` and `TwinEntityState`'s schema (`observedAt`/`effectiveAt`/`ingestedAt`) — a real, correctly-designed implementation of §66. |
| §67 Digital twin difference engine | **MISSING** | No version-diff or scenario-comparison UI exists (the scenario panel shows one scenario's result, not a comparison view). |
| §68 Reliability/failure model (MTBF, RUL, etc.) | **MISSING as a named model** — the demo's bearing-failure narrative is a fixed sentence, not a computed reliability metric. |
| §69 Business digital twins | **PARTIAL, via PR #34** | `domain-vocabulary.ts` includes a "commercial bank" domain per the plan doc, proving the schema/generator can represent non-physical twins — but no full worked business-twin example (e.g., a cash-flow-sensitivity demo) exists yet. |
| §70 Compliance by design | **MISSING** — no data-residency/retention/PII-tagging controls found specific to twin-studio. |
| §71 Platform administration / §72 Observability / §73 Scale | Not independently assessable within `apps/twin-studio` — these are typically platform-wide concerns; not confirmed either way by this audit. |
| §74 MVP phasing | **Followed faithfully.** The design doc's own Phase 1/Non-goals section maps almost exactly onto the master prompt's §74 Phase 1 list, and the codebase matches what that phase promised — a rare case of a spec being honored rather than drifted from. |
| §75–78 DB design / API contracts / testing / AI structured output | **BUILT, and disciplined** | Structured Prisma tables (not one giant JSON blob) with compound tenant-scoped indexes; Zod-validated contracts shared between layers; a test-driven-development pattern evident in PR #34's task list (write failing test → confirm absence → implement → verify); the LLM-output pipeline described in §78 (validate → normalize → policy → preview → approve → persist) is implemented for the industry generator, even though no actual LLM is called yet (§12/§19 note above). |
| §79 Safety (no silent high-impact action) | **Respected.** Every mutating action found requires an explicit call (apply endpoint); nothing in the audited code executes an irreversible action autonomously. |
| §80–85 Philosophy / execution order / build standard | The codebase's actual build order (foundation → twin definition → demo simulator → command center → industry generalization) tracks §84's prescribed sequence closely. |

## Known issue found on `main` (not yet reported elsewhere)

`apps/twin-studio/modules/twin-definition/twin-service.ts` stores all twins in a process-local `Map` (`const twins = new Map<string, TwinRecord>(...)`), seeded with one demo twin. `createTwin()` validates input correctly via `TwinDefinitionSchema` but never writes to the `DigitalTwin`/`TwinVersion`/`TwinEntity` Prisma tables that already exist in `schema.prisma` for exactly this purpose. This is the same class of bug the PR #34 review already caught once for version approval (`version-proposal-service.ts`, fixed in commit `57c8f37`) — non-durable state presented through a UI that implies persistence (`status: 'LIVE'`). It has not yet been fixed on `main` because it predates that review and sits outside PR #34's diff.

**Recommendation:** fix this with the same pattern PR #34 used for version persistence, before building further features on top of `twin-service.ts` — otherwise every twin created through the UI is lost on server restart, and this will surface as a P0 in whatever review eventually covers `main`'s twin-CRUD path.

## What to build next (informed by the above, not prescribed)

In order of "closes the biggest gap with the least new surface area":

1. **Merge PR #34** (industry generator) — it's green, reviewed, and is the single largest master-prompt capability sitting unmerged.
2. **Fix `twin-service.ts` persistence** (above) before it compounds.
3. **Wire `TwinEntityState` writes** from the simulator, so §7's "historical state" and §9's time-series concepts have something real to query — currently the simulator computes everything from the tick number with no persisted trail.
4. **A second, unrelated demo twin** (e.g., one of PR #34's generated industries, taken through to a working Command Center) would be the cheapest way to prove §1–2's "genuinely industry-agnostic" claim empirically rather than by schema design alone.

Everything past that (predictive models, event engine, knowledge graph, agents, optimization, 3D) is Phase 2+ per the existing design doc and shouldn't be started until the Phase 1 gaps above are closed, per the master prompt's own §74 sequencing.
