# ADR-030: Secure prompt gateway and secure AI gateway

**Status:** Proposed (Phase 6, security track)

## Context

AI-originated requests need inbound/outbound content inspection (prompt injection, jailbreaks, data leakage, embedded secrets) and a unified routing layer across LLM providers (OpenAI, Claude, Gemini, Azure OpenAI, AWS Bedrock, Ollama, vLLM, Llama.cpp) with cost/rate/failover controls — analogous in shape to `HiveGateway` (`ADR-021`), but for LLM providers rather than cloud providers.

## Decision

**Prompt Firewall** (`PromptFirewall`, an `AIGovernanceEngine` submodule, distinct from its policy evaluators): a fixed pipeline, `Prompt → Sanitizer → Policy Validation (AIGovernanceEngine) → LLM → Output Validation → User`. Both inbound and outbound content are inspected — output validation is not optional or asymmetric to input validation.

**Secure AI Gateway** (`SecureAIGateway`): a distinct component, parallel to but separate from `HiveGateway`, owned by HiveShield. Rejected alternative, recorded rather than silently discarded: modeling LLM providers as a `ProviderExecutor` (`ADR-020`) type was considered and rejected, because `04-PROVIDER-FRAMEWORK.md` §3 explicitly excludes billing/policy from the `ProviderExecutor` contract, and LLM routing needs both inline (per-token cost metering, content filtering are not separable from routing the way they are for infrastructure provisioning).

## Consequences

- Two gateways now exist in the architecture — `HiveGateway` (infrastructure) and `SecureAIGateway` (LLM) — deliberately not unified, since their concerns (provisioning vs. token-level cost/content) differ enough that forcing one contract over both would overload it.
- This separation is explicitly revisitable at Phase 8 (Roadmap), the same way `HiveDatabase` graduated from an internal grouping into its own capability — if `SecureAIGateway` proves to need the same independence, that's a Phase 8 decision, not one made here.
- "Require Local LLM" as a `AIGovernanceEngine` decision outcome (`ADR-029`) routes to HiveForge's own `HiveCompute`/`HiveDatabase` capabilities for self-hosted inference — this ADR fixes that the routing target exists, not the specific self-hosted inference implementation.
