# ADR-029: AI agent identity and the AIGovernanceEngine

**Status:** Proposed (Phase 6, security track)

## Context

CerebroStudio (and future CerebroHive products) run AI agents that call HiveForge-hosted services. Those agents need an identity and a governance layer distinct from resource-access authorization (`PolicyEngine`, `ADR-028`) — a model/tool/cost/data-classification constraint is a different question than "may this principal access this resource."

## Decision

**Agent identity:** `AgentIdentity` is a `User` subtype (per `05-BUSINESS-PLATFORM.md` §1a's service-account pattern), carrying an `AgentCertificate` issued via the same short-lived, narrowly-scoped escrow principle `ADR-023` established for provider credentials. An agent's `Policy` attachments name `AgentPermissions`, `ToolPermissions`, `MemoryPermissions`, `DataPermissions`, `RuntimePermissions`, `ModelPermissions`.

**Governance:** a new HiveShield internal module, `AIGovernanceEngine` — explicitly not a `PolicyEngine` variant (see `06-SECURITY.md` §0 for the full naming reconciliation). It answers "may this AI workflow execute under these constraints," evaluating `Policy` attachments scoped to AI-specific classifications, via submodules: `PromptPolicyEvaluator`, `ToolPolicyEvaluator`, `AgentPolicyEvaluator`, `ModelSelectionPolicy`, `BudgetPolicy`, `DataClassificationPolicy`, `SafetyPolicy`, `CompliancePolicy`, `ApprovalPolicy`, `OutputPolicy`.

**Provenance:** every AI-originated action is recorded as an `Operation` (`01-DOMAIN-MODEL.md` §2) carrying an AI-specific evidence payload (who asked, which model, which tools, which documents, confidence, reasoning summary, cost, latency, risk, output) — not a new aggregate alongside `Operation`.

## Consequences

- `Policy` (`01-DOMAIN-MODEL.md` §2/§4) now has two evaluator classes reading it — `PolicyEngine` and `AIGovernanceEngine` — distinguished by the `Policy`'s classification/attribute content, not by a schema fork.
- An agent identity that is compromised is bounded the same way a compromised service-account credential is (`ADR-023`) — narrowly-scoped, short-lived, traceable to the `Operation` it acted through.
- This ADR does not fix which specific models/providers are supported — that's `ADR-030`'s scope (the gateway routing to them).
