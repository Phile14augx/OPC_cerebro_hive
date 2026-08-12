# ADR-023: Identity and credential escrow

**Status:** Proposed (Phase 1, architecture track)

## Context

HiveForge has two distinct identity concerns that must not be conflated: who is calling the HiveForge API (a human, a service account, CerebroStudio itself), and what credentials HiveForge itself uses to call AWS/Azure/GCP on that caller's behalf. Treating these as one concept risks the same outcome long-lived, broadly-scoped cloud credentials always risk: a single leaked credential granting far more access than any one request needed, for far longer than any one request took.

## Decision

**HiveForge-facing identity** (HiveIdentity): standard OIDC/OAuth2-based authentication for API callers, with RBAC scoped at the Organization/Tenant/Project/Workspace levels the domain model defines, via Policy attachment.

**Provider-facing credentials** (credential escrow): HiveForge never holds long-lived, broadly-scoped provider credentials in capability services. Instead, `KeyManagementService` (a HiveShield internal module, per the naming convention in `00-FOUNDATION.md` §1) issues narrowly-scoped, short-lived credentials to a capability service immediately before a specific Provider call, and those credentials expire shortly after. A capability service never caches or reuses a provider credential across multiple Operations.

## Consequences

- A compromised capability service instance exposes, at most, one narrowly-scoped, soon-to-expire credential — not standing access to an entire cloud account.
- Every Provider call is traceable to the specific escrowed credential issued for it, which is itself traceable to the Operation that requested it — extending the same evidence-chain discipline `ADR-003` established for `packages/engineering-review` (evidence → finding → recommendation) to credentials → Operation → Resource.
- This ADR does not specify the exact token format, rotation interval, or which cloud-native mechanism (AWS STS, Azure Managed Identity, GCP Workload Identity Federation) each Provider adapter uses to obtain scoped credentials — that's Provider-adapter-specific implementation detail, constrained by this ADR's principle but not dictated in mechanism.
- RBAC's precise role/permission model (what "Editor" vs. "Viewer" means at each domain-model level) is not fixed here — left to whoever implements HiveIdentity, constrained only by the attachment-level model the domain model already fixes.
