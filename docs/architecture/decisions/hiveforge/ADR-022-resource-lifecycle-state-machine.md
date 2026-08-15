# ADR-022: Resource lifecycle state machine

**Status:** Proposed (Phase 1, architecture track)

## Context

Every capability service (HiveCompute, HiveStorage, HiveNetwork, ...) provisions Resources that pass through analogous lifecycle stages — requested, provisioning, active, updating, degraded, deleting, deleted — but nothing yet stops each capability from defining its own incompatible state machine, which would make cross-capability tooling (a unified HiveConsole status view, a single Operations audit log) require per-capability special-casing indefinitely.

## Decision

All Resources, regardless of capability, share one platform-wide lifecycle state machine:

```
Requested → Provisioning → Active → { Updating → Active | Degraded → Active | Degraded → Failed }
                                   → Deleting → Deleted
```

`Deleted` is terminal — recreating a torn-down Resource produces a new Resource with a new identity, never a resurrected one, preserving Operation history integrity per the domain model's append-only principle. Capability-specific meaning of each state (e.g., what "Degraded" means for a VM vs. a storage bucket) is defined per-capability in the Service Catalog (Phase 2), but the state names and allowed transitions themselves are fixed here and not reinterpreted per capability.

## Consequences

- HiveConsole, the Operations audit log, and the billing pipeline can all be built against one state machine, not N capability-specific ones.
- A capability service proposing a new lifecycle state must justify it against this ADR explicitly — the default assumption is that the existing states suffice, the same discipline ADR-005 already applies to the contributor framework in `packages/engineering-review` ("if a future contributor requires a structural change, that signals the boundary was misdrawn").
- Full transition table detail (which Operations are valid in which state, concurrent-transition/idempotency handling) is left to whoever implements HiveGateway's orchestration logic — this ADR fixes the state names and shape, not the complete formal transition table.
