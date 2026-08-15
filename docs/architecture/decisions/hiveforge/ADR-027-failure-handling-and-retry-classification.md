# ADR-027: Failure handling and retry classification

**Status:** Proposed (Phase 4, architecture track — surfaced as a gap during Phase 3's ADR alignment check, `03-CONTROL-PLANE.md` §8)

## Context

`03-CONTROL-PLANE.md` §6 describes failure handling in prose — validation failures, policy denials, provider failures, partial failures, retryable vs. terminal errors — but none of it was ratified as an ADR. Retry behavior determines real platform semantics (whether a client's retried request is safe, whether a `ProviderExecutor` failure cascades, how idempotency (`03-CONTROL-PLANE.md` §3b) interacts with automatic retry), which makes it an architectural decision every `ProviderExecutor` (per `ADR-020`'s forthcoming amendment) and capability service must follow identically — not an implementation detail each one can decide independently.

## Decision

**Failure classification** — every `ProviderExecutor` must classify its own failures into exactly one of:
- **Retryable** (transient): timeouts, rate limiting, temporary provider-side unavailability.
- **Terminal** (permanent): invalid specification, quota exceeded, permission denied, resource not found for a mutating operation.

Only `OperationTracker` (per `03-CONTROL-PLANE.md` §3) retries, and only Retryable failures — a `ProviderExecutor` never silently retries internally in a way that's invisible to Operation state.

**Backoff strategy**: exponential backoff with jitter, bounded by the Operation's overall timeout (`03-CONTROL-PLANE.md` §4) — a capped number of attempts, not indefinite retry. Exact parameters (base delay, max attempts, jitter range) are implementation detail, not fixed by this ADR.

**Idempotency interaction**: a retried Operation reuses the same idempotency key (`03-CONTROL-PLANE.md` §3b) it was first submitted with — retrying is HiveGateway resubmitting the identical request, not a new one, so `RequestRouter`'s idempotency check correctly recognizes it as the same logical operation rather than creating a duplicate.

**Compensation behavior**: when a multi-step Deployment (per the domain model) has a Terminal failure partway through, already-succeeded Operations are **not** automatically rolled back. Each Operation's state is authoritative and independently reported (per `03-CONTROL-PLANE.md` §6's partial-failure handling) — HiveForge does not attempt automatic multi-resource transactional rollback at this phase. A caller (or a future higher-level "Deployment recipe" abstraction) is responsible for deciding whether to tear down partially-succeeded Resources; HiveGateway surfaces the partial-failure state honestly rather than pretending atomicity it doesn't provide.

**Error normalization** (feeds into Phase 4's Provider Framework, detailed there): every `ProviderExecutor` translates provider-specific errors into a shared platform taxonomy (illustrative: `QuotaExceeded`, `RegionUnavailable`, `AuthenticationFailed`, `ProvisioningTimeout`, `InvalidSpecification`, `TransientProviderFailure`) before the failure reaches `OperationTracker` — retry/terminal classification is derived from this normalized taxonomy, not from provider-specific error codes leaking into control-plane logic.

## Consequences

- No `ProviderExecutor` may retry internally in a way invisible to `OperationTracker` — all retry decisions are made in one place, using one policy, not duplicated per provider with potentially inconsistent behavior.
- Automatic multi-resource rollback is explicitly **not** promised by this ADR — this is a real limitation to communicate honestly (per Phase 0 principle #8, no claim without evidence) rather than implying transactional guarantees HiveForge doesn't provide at this phase. A future ADR could add compensation/saga-style rollback if real customer need justifies the complexity — not assumed here.
- The error normalization taxonomy is shared platform vocabulary — a new provider's adapter must map its own error model onto the existing taxonomy, extending it only when a genuinely new failure category exists, not per-provider ad hoc codes.
- This ADR does not fix exact backoff parameters or maximum retry counts — implementation detail, constrained by "bounded, not indefinite" but not dictated further here.
