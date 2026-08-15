# ADR-021: HiveGateway as the platform control plane

**Status:** Proposed (Phase 1, architecture track)

## Context

With `ADR-020` establishing that capability services never talk to providers directly, something has to own request authentication, Policy validation, routing, and multi-resource orchestration across capability services. Without a single designated control plane, this coordination logic risks being duplicated across HiveCompute/HiveStorage/HiveNetwork independently — the same fragmentation problem ADR-020 avoids at the provider layer, recurring one layer up if not addressed here too.

## Decision

`HiveGateway` is the sole control plane. Its responsibilities: authenticate and authorize every request (delegating to HiveIdentity, per `ADR-023`), validate against Policy (delegating to HiveShield's `PolicyEngine`), route to the correct capability service, orchestrate multi-resource Deployments as ordered sequences of Operations, and record every Operation. HiveGateway does not itself implement provisioning logic — that remains each capability service's responsibility, calling `ProviderExecutor` per `ADR-020` (amended Phase 4 — see that ADR for the metadata/execution split; `ProviderExecutor` is the execution half). This is the same separation `EngineeringReviewOrchestrator` already draws between orchestration and domain/contributor logic in `packages/engineering-review`.

## Consequences

- Capability services never accept direct external calls — every request enters through HiveGateway. This is a security and consistency boundary, not just a routing convenience.
- Multi-step Deployments (e.g., "provision a VPC, then a cluster inside it, then a load balancer") are HiveGateway-orchestrated sequences of individually auditable Operations, not opaque scripts.
- HiveGateway failing to authenticate/authorize a request must fail closed (deny), never open — this is a Zero Trust commitment (Phase 0 principle #4), not just an implementation preference.
- This ADR does not specify HiveGateway's internal implementation (single service vs. a set of cooperating services) — that's a build-time decision for whoever implements Phase 3, not fixed here.
