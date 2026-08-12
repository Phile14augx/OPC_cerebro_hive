# HiveForge Consolidation — Architecture Review & Migration Plan

> **Status:** Proposal, based on a full file-level audit of both implementations (2026-07-22). No code has been changed. Decisions marked **[DECISION NEEDED]** require product/eng sign-off before work starts.

## 0. Correction to the working assumption

The premise going in was "two stages of the same product, converging." The audit doesn't support that framing:

- **Implementation A** (`platform/src/domains/hiveforge/*`, served by the gateway at `localhost:8090`) **works end-to-end** as what it claims to be: a declared, non-provisioning simulator. Real 230-item catalog, real accrued-cost billing (`hours × hourlyRateUsd`), 6 UI pages wired to it and functioning. Its only real gap is persistence — everything lives in `InMemoryHiveForgeRepository` and is lost on restart.
- **Implementation B** (`app/platform/hiveforge/core/**`, `app/api/v1/hiveforge/*`) **does not work today**, and is itself split into two disconnected halves:
  - A client-side registry/kernel demo (3 UI pages + persistent layout chrome) showing 2–3 hardcoded fake plugins.
  - A server-side Prisma/orchestration stack that nothing in the UI calls. Even if you called it directly: every deployment permanently sticks at `Operation.status = "Allocating"` because `ProvisioningWorker.start()` — the only code that would invoke `MockCloudProvider` — is never called anywhere in the codebase. Its billing endpoint returns a hardcoded literal, not a computation.

So this isn't a merge of two peers. It's **adoption with selective extraction**: Implementation A becomes the canonical platform, Implementation B is mined for its reusable concepts (resource-state vocabulary, provider-contract shape, Prisma schema), and everything else in B is retired once those concepts have been migrated — not maintained in parallel indefinitely.

```
HiveForge Gateway
      │
Service Catalog
      │
Provisioning Engine
      │
Provider Runtime  ──  HiveForgeProvider contracts (SimulatorProvider today, AWS/Azure/GCP later)
      │
Persistence (Prisma/PostgreSQL)
      │
Background Workers (only for providers whose provision() is genuinely long-running)
      │
Billing & Operations
```

## 1. What to keep, per implementation

| From | Keep | Why |
|---|---|---|
| **A** | Catalog data (`catalog.ts`), `specsFor()` spec generator, billing formula, gateway/DI/EventBus/PolicyEngine pattern (`platform/src/kernel/*`, `platform/src/app/container.ts`) | It's the only real product surface today, and the gateway pattern is already shared by every other domain (CerebroForge included) — consolidating onto it is consistent with the rest of the platform, not a new pattern. |
| **B** | `ResourceState`/`ResourceHealth` state-machine vocabulary (`core/contracts/state.ts`), `ProviderContract`'s descriptive shape (identity/capabilities/regions/limits/runtime + `estimateCost`), Prisma schema's relational structure (`Provider→Resource→Deployment→Operation`) | These are the pieces actually worth the effort spent on them: a real state machine, a real multi-provider descriptor shape, and a real persistence schema. None of them currently do anything, but the design is sound. |
| **B** | Nothing else | `core/kernel`, `core/registry`, `core/events/EventBus`, `core/events/EventStore`, `core/contracts/event.ts` are a same-named but unrelated "kernel" concept to the gateway's — they duplicate primitives the gateway already has. `core/intelligence/*` (KnowledgeGraph/Memory/IntentEngine/DecisionEngine) and `core/ai/AICore.ts` are keyword-matching stubs with no persistence and no live data — they're a separate product decision (see §5), not infrastructure to carry forward by default. |

## 2. Target architecture

**Chassis:** Implementation A's gateway pattern (Fastify service, shared `EventBus`/`PolicyEngine`, DI container). It's already proven, already shared across every domain in the platform, and already has 6 working UI pages depending on it. Building a second chassis (B's kernel) to eventually replace the first was the mistake that produced today's split — don't repeat it.

**Provider interface — synthesized, not inherited from either side.** Neither existing interface is usable as-is:
- `ProviderContract` (B) has the right descriptive fields (regions, capabilities, cost) but zero actuation methods.
- `IProvisioningProvider` (B) has actuation methods (`create/update/delete/...`) but is stringly-typed (`config: any`) and provisioning-only.
- `IResourceDriver` (B) is unused generic scaffolding.
- Implementation A has no provider seam at all — `specsFor()` is an inline switch statement.

Proposed shape (merge the two live-adjacent halves of B, type them against a real resource model, give A's simulator this seam to sit behind):

```ts
interface HiveForgeProvider {
  identity: ProviderIdentity;              // from ProviderContract
  capabilities: ProviderCapabilities;
  regions: ProviderRegion[];
  estimateCost(itemId: string, spec: ProvisionSpec): Promise<CostEstimate>;

  provision(spec: ProvisionSpec): Promise<ProvisionResult>;   // typed replacement for IProvisioningProvider.create
  deprovision(resourceId: string): Promise<void>;
  getStatus(resourceId: string): Promise<ResourceState>;      // from B's state.ts vocabulary
}
```

`SimulatorProvider` (renamed from today's inline `specsFor()`/`provision()` logic in `hiveforge.ts`) becomes the default, always-available implementation of this interface — not a separate code path from "real" providers, just the one that's always registered. AWS/Azure/GCP providers get added later as additional implementations; `MockCloudProvider`'s 2-second-`setTimeout`-then-succeed pattern is a reasonable template for a mock provider used in tests, kept separate from `SimulatorProvider` (which is product-facing, not test-facing).

**Resource model — pick one.** Today there are four incompatible shapes (A's `ProvisionedResource`, B's Prisma `Resource`, B's `URD`, B's `InventoryResource`). Recommend: Prisma `Resource` (B) as the persisted row shape — extended with the fields A's `ProvisionedResource` actually uses and populates (`itemName`, `hourlyRateUsd`, `endpoint`, `sizeTier`, `replicas`) — becomes the one model. `URD` and `InventoryResource` are deleted; they have no producers today.

**Persistence — close A's real gap.** Swap `InMemoryHiveForgeRepository` for a Prisma-backed repository using (an extended version of) B's schema. This is the one part of B's server-side work that's genuinely more advanced than A's, and it's the fix for A's only real weakness.

**State machine — adopt, but make it actually run.** B's `Pending→Queued→Validating→Planning→Allocating→Provisioning→Configuring→Verifying→Ready` chain is a reasonable model, but ship it with the worker actually started, and with `validTransitions` enforced (not just `console.warn`'d) — otherwise this is the same dead-scaffolding failure mode again. Given A's current simulator is synchronous and always succeeds, an easy near-term compromise: keep provisioning synchronous for `SimulatorProvider` (skip the queue entirely, go straight to `Ready`), and only route through the async queue/worker for providers where `provision()` is genuinely long-running (real cloud APIs). Don't force async-with-a-worker on a code path that doesn't need it yet.

## 3. Migration phases

Ordered by dependency, not calendar time — no effort estimates are given below because none of this repo's git history gives a basis for one; size each phase against your own team's velocity before committing to dates.

1. **Define the unified `Resource` schema and `HiveForgeProvider` interface** (types only, no behavior change). Extend Prisma schema with the fields A's simulator needs.
2. **Wrap A's existing `specsFor()`/`provision()`/`deprovision()`/billing logic as `SimulatorProvider implements HiveForgeProvider`**, unchanged in behavior, just behind the new interface.
3. **Swap `InMemoryHiveForgeRepository` for a Prisma-backed repository.** This is the first user-visible improvement (resources survive a restart) and doesn't require the state machine or worker to be finished first.
4. **Point all 6 existing gateway-consuming UI pages at the new repository/provider seam** — no UI changes, just confirm nothing broke.
5. **Delete B's dead paths**: `core/kernel`, `core/registry`, `core/events/*`, the 3 client-side-singleton UI pages (`catalog/page.tsx`, `diagnostics/page.tsx`, `inventory/page.tsx`) or rebuild them against the new unified backend if their functionality (catalog browse, registry inspector, topology view) is still wanted, `ProvisioningWorker`/`Scheduler`/`ReconciliationEngine` (never-invoked scaffolding), the orphaned `app/api/v1/hiveforge/*` routes (superseded by the gateway) — **[DECISION NEEDED]**: confirm nothing external depends on that REST surface before deleting it; the audit found no caller, but a public API contract elsewhere in the org wouldn't show up in this repo.
6. **Only after that:** add a second `HiveForgeProvider` implementation (AWS, most likely, given `MockAWSProvider`'s existing — if dead — scaffolding) to prove the interface actually generalizes beyond the simulator.

## 4. What this plan deliberately does not include

- No AWS/Azure/GCP credentials, SDK integration, or real provisioning — that's real infrastructure work with real cost/security implications, out of scope for a consolidation pass.
- No CerebroForge changes. It shares the gateway/kernel pattern with HiveForge (confirmed during the audit) but is otherwise independent; the "replace deterministic scoring with an LLM Gateway" work you described is a separate, later initiative.
- No pricing/GTM content — this is an internal architecture document, not the external-facing HiveForge spec. Write that only after phase 3–4 land, so it describes what's actually running rather than the intended design.

## 5. Decisions

1. **`core/intelligence/*` (AI copilot stub).** Delete the current implementation in phase 5 — it's unreachable from any working path, has no persistence, and no real inference behind it, so there's nothing functional to preserve. The *idea* (an intelligence layer over HiveForge) stays open as an uncommitted future possibility, not a scheduled phase or a named subsystem — it gets scoped fresh, from real requirements, if and when someone actually commits to building it. Don't let its presence in this doc be read as a roadmap commitment.
2. **B's static AWS-vs-Azure price comparison panel** (`catalog/page.tsx`). Same pattern: delete the current hardcoded implementation in phase 5. Rebuild it only after phase 6 (a second real `HiveForgeProvider` implementation exists) gives it real data to show — a comparison table with fabricated numbers is worse than no comparison table.
3. **`app/api/v1/hiveforge/*` legacy routes.** Not deleted outright in phase 5. The audit found zero callers inside this repo, but that doesn't rule out external consumers. Add a lightweight logging shim (log caller/timestamp on every hit, no behavior change) for an observation window before removal, then delete once the window shows nothing.
