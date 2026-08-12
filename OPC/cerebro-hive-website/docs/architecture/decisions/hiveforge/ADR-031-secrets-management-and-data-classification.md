# ADR-031: Secrets management and data classification

**Status:** Proposed (Phase 6, security track)

## Context

`ADR-023` established credential escrow in principle but didn't name the secret classes covered or the classification model data itself needs. Phase 6 makes both explicit.

## Decision

**Secrets management** — maps to `KeyManagementService` (existing HiveShield module), backed by AWS Secrets Manager / HashiCorp Vault / KMS, using envelope encryption with automatic rotation. Covered secret classes: API keys, JWT signing keys, database passwords, OAuth credentials, SSH keys, TLS certificates. No secret is ever placed in code or configuration committed to a repository.

**Data classification** — five levels: Public, Internal, Confidential, Restricted, Highly Confidential. Classification is a first-class attribute on data (attached the way `Policy` attaches to aggregates), not inferred ad hoc per service. Automatic classification (AI-assisted discovery of PII, PCI, HIPAA, GDPR, trade secrets, source code) is a `DataClassificationPolicy` (`AIGovernanceEngine` submodule, `ADR-029`) concern for AI-adjacent data flows, and a `ComplianceEngine` (existing HiveShield module) concern generally. Encryption: AES-256, TLS 1.3, envelope encryption, field-level encryption where classification warrants it.

## Consequences

- `KeyManagementService`'s scope is now explicit rather than implied by `ADR-023` alone.
- A `Resource`, `UsageRecord`, or any other aggregate carrying customer data can be queried for its classification level — this becomes a testable invariant once implemented, not a documentation-only claim.
- This ADR does not fix the specific automatic-classification detection mechanism (model, ruleset, confidence threshold) — implementation detail, constrained but not dictated here.
