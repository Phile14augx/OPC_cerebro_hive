# HiveForge Masterplan — Phase 3: Control Plane

**Status:** Proposed, per Phase 2 completion. Elaborates `ADR-021` (HiveGateway as the Platform Control Plane) into runtime behavior — this document does not redecide anything ADR-021 already fixed; it answers "how does a request actually flow through the platform," which ADR-021 deliberately left to whoever built Phase 3.

**Naming conflict caught and resolved:** your outline listed `PolicyEngine` as an internal control-plane module. `ADR-021` and `00-FOUNDATION.md` §1 already fixed `PolicyEngine` as a HiveShield-owned module — HiveGateway *delegates* to it, per ADR-021's own text ("validate against Policy, delegating to HiveShield's `PolicyEngine`"). Introducing a second, HiveGateway-owned `PolicyEngine` would recreate exactly the ambiguity the `HiveShield` naming collision in Phase 0 already caught once. Resolution: HiveGateway's internal module is named `PolicyEvaluationClient` — it calls HiveShield's `PolicyEngine`, it does not duplicate it. One `PolicyEngine`, one owner (HiveShield), consistent with the rest of this masterplan's naming convention.

## 1. Control plane responsibilities

**HiveGateway owns:**
- API ingress — the sole external entry point (per ADR-021; capability services never accept direct external calls).
- Authentication handoff to HiveIdentity.
- Authorization and Policy evaluation — via `PolicyEvaluationClient` calling HiveShield's `PolicyEngine` (see naming resolution above).
- Workflow orchestration — sequencing multi-resource Deployments as ordered Operations.
- Provider selection — choosing which provider handles a given request, via `ProviderSelector` consulting cached `ProviderMetadata` (ADR-020, amended Phase 4).
- State management — recording Resource/Operation state transitions (ADR-022).
- Event publication (ADR-024).
- Audit logging — every Operation is an audit record by construction (domain model §2).
- Billing event generation — emitting the events the billing pipeline consumes (ADR-025).

**HiveGateway explicitly does not own:**
- Direct cloud resource provisioning — that's each capability service's job, calling `ProviderExecutor` (ADR-020, amended Phase 4). HiveGateway orchestrates; it never itself calls a cloud API.
- Domain logic specific to a capability (e.g., what "Degraded" means for a Kafka cluster vs. a VM) — that lives in the capability service, not the control plane, the same separation `EngineeringReviewOrchestrator` draws from its contributors in `packages/engineering-review`.
- Long-term credential custody — escrowed, short-lived credentials are issued by HiveShield's `KeyManagementService` (ADR-023), not held or cached by HiveGateway.

## 2. Request lifecycle

```
Client
   │
   ▼
HiveGateway (RequestRouter)
   │
   ├── Authenticate ──────────────► HiveIdentity
   ├── Authorize (RBAC check)
   ├── Validate (schema/shape)
   ├── Policy Evaluation ─────────► PolicyEvaluationClient → HiveShield.PolicyEngine
   ├── WorkflowOrchestrator: decompose into ordered Operations
   ├── ProviderSelector: choose provider per Operation (via cached ProviderMetadata)
   ├── Dispatch to capability service → ProviderExecutor → actual cloud API
   ├── ResourceStateManager: persist Resource/Operation state transition
   ├── EventPublisher: emit lifecycle event(s) (ADR-024)
   ├── BillingEmitter: emit UsageRecord event where applicable (ADR-025)
   ├── AuditRecorder: record the Operation as an immutable audit entry
   └── Return Operation (id, current state, links to poll for progress)
```

This is the canonical execution model every capability (HiveCompute, HiveStorage, HiveNetwork, HiveDatabase) follows — no capability gets a bespoke request path.

## 3. Internal modules (responsibility matrix)

Per the established naming convention (business-oriented capability names, responsibility-oriented module names):

| Module | Responsibility | Owned by |
|---|---|---|
| `RequestRouter` | API ingress, routes validated requests to the right internal flow | HiveGateway |
| `WorkflowOrchestrator` | Decomposes a Deployment request into ordered Operations | HiveGateway |
| `ProviderSelector` | Chooses which provider handles a given Operation, via cached `ProviderMetadata` | HiveGateway |
| `PolicyEvaluationClient` | Calls HiveShield's `PolicyEngine`; enforces the resulting allow/deny | HiveGateway |
| `ResourceStateManager` | Persists Resource/Operation state transitions (ADR-022) | HiveGateway |
| `EventPublisher` | Emits platform events (ADR-024) | HiveGateway |
| `OperationTracker` | Tracks in-flight long-running Operations, progress, cancellation | HiveGateway |
| `BillingEmitter` | Emits `UsageRecorded` events for billable Operations (ADR-025) | HiveGateway |
| `AuditRecorder` | Records every Operation as an immutable audit entry | HiveGateway |
| `PolicyEngine` | Evaluates Policy rules; the actual decision logic `PolicyEvaluationClient` calls | HiveShield (not HiveGateway — see naming resolution above) |
| `KeyManagementService` | Issues escrowed, short-lived provider credentials (ADR-023) | HiveShield |

HiveGateway is the externally visible capability; every module above it is an internal implementation detail, replaceable independently as long as it honors this responsibility matrix.

**This matrix is authoritative.** If a responsibility isn't listed here as owned by HiveGateway, HiveGateway does not own it — full stop, not "owns it informally until someone objects." This is the same discipline `ADR-020`/`ADR-005`/`ADR-007` already apply elsewhere in this masterplan and in `packages/engineering-review`: an undocumented responsibility creeping onto a component is exactly the kind of drift the M26 vertical-slice review had to detect and reconcile after the fact, at real cost. Any new responsibility HiveGateway needs gets added to this table explicitly, as a deliberate edit, not discovered later.

## 3a. Command vs. query separation

Not previously distinguished — added per review. HiveGateway's request surface splits into two kinds, with different consistency and caching characteristics:

**Commands** (mutating, produce Operations): `Provision`, `Resize`, `Delete`, `Attach`, `Snapshot`. Always go through the full request lifecycle in §2 — authenticate, authorize, policy-evaluate, orchestrate, dispatch, persist, publish, bill, audit.

**Queries** (read-only, no Operation produced): `GetStatus`, `ListResources`, `GetOperation`, `EstimateCost`. Still authenticated and authorized, but skip policy evaluation (nothing is being provisioned), orchestration, and billing-event emission. `EstimateCost` in particular must never have a side effect — it's a projection against the Service Catalog's metering model (`ADR-025`), not a billable action itself.

This separation matters concretely for: **caching** (queries are cacheable with normal invalidation strategies; commands never are), **retries** (retrying a query is always safe; retrying a command requires the idempotency handling in §3b), and **eventual consistency** (a `GetStatus` query immediately after a `Provision` command may reflect `Provisioning`, not yet `Active` — callers must not assume read-after-write consistency across the command/query boundary).

## 3b. Idempotency

Not previously specified — added per review, since idempotency is a control-plane concern, not something pushed down to each `ProviderExecutor` to solve independently (a provider executor has no visibility into whether a request is a genuine retry or a new request).

Every mutating command (`ProvisionInstance`, `DeleteInstance`, `CreateVolume`, and their equivalents across capabilities) accepts a caller-supplied idempotency key. `RequestRouter` checks this key against existing Operations before `WorkflowOrchestrator` decomposes anything:

- **Same idempotency key, matching request body:** no new Operation is created — the existing Operation (whatever its current state) is returned as-is. This is the common "client retried after a timeout, but the original request actually succeeded" case.
- **Same idempotency key, different request body:** rejected as a conflict — a reused key with different parameters is a client bug, not a retry, and silently acting on the new body would violate the "an idempotency key means the same request" contract.
- **No idempotency key supplied:** the command is accepted but treated as non-idempotent — a genuine duplicate submission creates a genuine duplicate Operation. Capability services may choose to require a key for higher-risk commands (e.g., `Delete`) even if the platform doesn't mandate it universally at this phase.

Idempotency keys are scoped per-Workspace (domain model) — the same key value in two different Workspaces refers to two unrelated requests, not a collision.

## 4. Long-running operations

Many provisioning calls (a Kubernetes cluster, bare metal, a database HA setup) are asynchronous against the underlying provider. `OperationTracker` manages this:

- **Creation:** an Operation is created in `Requested` state (ADR-022) synchronously, before any provider call is dispatched — the caller always gets an Operation id immediately, never blocks on provider latency.
- **State transitions:** `OperationTracker` polls or receives callbacks from the relevant `ProviderExecutor` and advances the Operation's state (`Provisioning` → `Active`, etc.) via `ResourceStateManager`.
- **Progress reporting:** callers poll the Operation id (or subscribe to its events, per ADR-024) for current state; no separate progress-percentage abstraction is introduced at this phase — state transitions themselves are the progress signal.
- **Cancellation:** a cancellation request against an in-flight Operation is itself a new Operation (consistent with the append-only Operation model) — it does not mutate or delete the original Operation record.
- **Retry semantics:** transient provider failures (timeouts, rate limits) are retried by the capability service calling the `ProviderExecutor`, with backoff, per `ADR-027`; retry attempts are not separately recorded Operations, but the final outcome (success or terminal failure) is.
- **Timeout behavior:** every Operation has a maximum allowed duration (capability-specific — a bare-metal provision reasonably takes longer than a serverless function deploy); exceeding it transitions the Operation to a terminal failure state, it does not hang indefinitely.

## 5. Event model (control-plane-specific taxonomy)

Extends `ADR-024`'s general taxonomy, now split by consumer relationship — not previously distinguished, added per review:

**Domain events** — describe what happened to a Resource/Operation itself; consumed by other control-plane/capability internals (e.g., `OperationTracker`, `ResourceStateManager`) and by callers polling/subscribing to their own Operations: `ResourceProvisionRequested`, `ResourceProvisionStarted`, `ResourceProvisionSucceeded`, `ResourceProvisionFailed`, `ResourceDeleted`.

**Integration events** — carry no internal orchestration detail; consumed by external-facing or cross-cutting systems that shouldn't need to understand HiveGateway's internals to react: `BillingUsageRecorded`, `AuditEventRecorded`, `NotificationRequested`.

The distinction matters concretely: a domain event's shape can change as control-plane internals evolve (it's an internal contract between HiveGateway's own modules and its direct API callers); an integration event's shape is a stable external contract — the billing pipeline (`ADR-025`) or a future external tenant's webhook integration should never need to change because `WorkflowOrchestrator`'s internal decomposition logic changed. New capability-specific events should be named as a specialization of whichever category they belong to, not as a third, undifferentiated bucket.

## 6. Failure handling

Every capability service and `ProviderExecutor` must produce the same failure shape (formalized in `ADR-027`), so HiveGateway can handle failures uniformly rather than per-capability:

- **Validation failures** (malformed request): rejected before any Operation is created — fails at `RequestRouter`, fast and cheap.
- **Policy denials**: rejected after Operation creation but before provider dispatch — the Operation is recorded (for audit purposes — a denied request is still evidence of what was attempted) but transitions directly to a terminal denied state, never reaching `Provisioning`.
- **Provider failures** (the cloud API itself errors): the responsible `ProviderExecutor` reports a structured, normalized failure (per `ADR-027`), the same failure-isolation discipline `EngineeringReviewOrchestrator.safeExecute()` already applies to contributors in `packages/engineering-review` — one provider failing must not corrupt or block unrelated Operations against other providers.
- **Partial failures** (a multi-resource Deployment where some Operations succeed and others fail): each Operation's own state is authoritative; the Deployment as a whole is not forced into an artificial all-or-nothing outcome — callers see exactly which Operations succeeded and which failed, consistent with the append-only, evidence-based Operation record.
- **Retryable vs. terminal errors**: a `ProviderExecutor` classifies its own failures as retryable (timeout, rate limit) or terminal (invalid configuration, quota exceeded, permission denied), per `ADR-027` — `OperationTracker` only retries the former.

## 7. Sequence diagram — provisioning request, happy path

```
Client          HiveGateway        HiveIdentity   HiveShield        Capability Svc   ProviderExecutor   EventBus
  │  request        │                   │              │                  │                │             │
  ├───────────────► │                   │               │                  │                │             │
  │                 ├── authenticate ──►│               │                  │                │             │
  │                 │◄──── OK ──────────┤               │                  │                │             │
  │                 ├── policy check ──────────────────►│                  │                │             │
  │                 │◄──────── allow ───────────────────┤                  │                │             │
  │                 ├── create Operation (Requested) ────────────────────────────────────────────────────►│
  │                 ├── dispatch ─────────────────────────────────────────►│                │             │
  │                 │                   │               │                  ├── escrow cred ─►│(KeyMgmtSvc) │
  │                 │                   │               │                  ├── provision() ─►│             │
  │                 │                   │               │                  │◄── accepted ────┤             │
  │                 │                   │               │                  │                │             │
  │◄── Operation id (Provisioning) ─────┤                                  │                │             │
  │                 │                   │               │                  │◄── provisioned ─┤             │
  │                 │◄── state update ──────────────────────────────────────┤                │             │
  │                 ├── persist (Active) ─────────────────────────────────────────────────────────────────►│
  │                 ├── emit ResourceProvisioned, BillingUsageRecorded ──────────────────────────────────────►│
  │  (poll or subscribe)                │               │                  │                │             │
  │◄── Operation (Active) ──────────────┤                                  │                │             │
```

## 8. ADR alignment check

Before Phase 4, reconciling against your proposed ADR list — the numbers you gave (ADR-0008–0014) don't match what actually exists in `hiveforge/adr/` (ADR-020–026, chosen to avoid colliding with this project's existing `audit/adr/ADR-001`–`007` for `packages/engineering-review`). Mapping your listed decisions to what's real:

| Your listed decision | Existing ADR | Status |
|---|---|---|
| HiveGateway as control plane | `ADR-021` | Covered |
| Resource lifecycle | `ADR-022` | Covered |
| Event model | `ADR-024` | Covered, now split domain/integration per §5 above — worth a short amendment to `ADR-024` itself rather than leaving the split only in this document |
| Credential delegation | `ADR-023` | Covered (titled "Identity & Credential Escrow") |
| Multi-tenant boundaries | `ADR-026` | Covered |
| Provider metadata/execution split | *(none at time of writing)* | **Resolved in Phase 4** — `ADR-020` amended to split `ProviderAdapter` into `ProviderMetadata` (discovery) and `ProviderExecutor` (execution). This document's own stale `ProviderAdapter` references have been updated to match (see `04-PROVIDER-FRAMEWORK.md` for the full elaboration). |
| Failure handling | *(none at time of writing)* | **Resolved in Phase 4** — `ADR-027` (Failure Handling and Retry Classification) now exists, ratifying what was previously only prose in §6 above. |

**Historical note:** this section originally flagged both as open gaps and recommended they be addressed in Phase 4. They have been — this row is kept as a record of the gap being caught and closed, not because either is still open.

## Expected outputs from this phase — status

- Platform Architecture Specification — Control Plane: **this document.**
- ADR covering control-plane architecture: **already exists** (`ADR-021`) — this document elaborates it, doesn't duplicate it.
- Request lifecycle specification: **§2, above.**
- Command/query separation: **§3a, above.**
- Idempotency model: **§3b, above.**
- Event taxonomy, domain vs. integration: **§5, above (extends ADR-024 — amendment recommended, see §8).**
- Module responsibility matrix, explicitly authoritative: **§3, above**, including the caught `PolicyEngine` naming conflict.
- Sequence diagram: **§7, above** (happy path only — a failure-path diagram is reasonable follow-up work, not included here to keep this document to one clear scenario).
- Failure and retry model: **§6, above** — not yet a ratified ADR; see §8's `ADR-027` recommendation.
- ADR alignment check: **§8, above** — two real gaps surfaced (failure-handling ADR, provider metadata/execution split), carried into Phase 4 rather than resolved here.
