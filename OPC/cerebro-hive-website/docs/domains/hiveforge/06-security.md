# HiveForge Masterplan — Phase 6: Security

**Status:** Proposed, per Phase 5 completion. Full scope, 16 layers, per your explicit direction (all layers apply as HiveForge's own security architecture, including the AI-governance layers — not deferred to a separate CerebroStudio-only document, and not split into a ninth capability). One scope note is carried forward rather than silently dropped: layers 2–5 and 13–15 govern AI/agent/LLM usage, which HiveForge itself does not perform (it provisions infrastructure; CerebroStudio runs agents). Under "full scope," HiveForge owns these layers as **hosted security services** other CerebroHive products consume — the same relationship HiveForge already has with HiveDatabase: HiveForge builds and operates the capability, CerebroStudio (and future products) are tenants/consumers of it, not owners.

## 0. Naming reconciliation (resolved before the rest of this document)

Three governance-sounding components now exist and must stay distinct, per your explicit decision:

```
PolicyEngine                    — HiveShield internal module (00-FOUNDATION.md §1)
                                   Answers: "May this principal access this resource?"
                                   Enterprise RBAC/ABAC authorization. Unchanged by this phase.

PolicyEvaluationClient          — control-plane client (03-CONTROL-PLANE.md §3)
                                   The client HiveGateway uses to query PolicyEngine.
                                   Unchanged by this phase.

AIGovernanceEngine               — NEW, this phase (Layer 3 + Layer 13 + Layer 15)
                                   Answers: "May this AI workflow execute under these constraints?"
                                   A distinct subsystem, not a PolicyEngine variant.
```

`AIGovernanceEngine` is a new HiveShield internal module, added to the §1 naming-convention diagram (`00-FOUNDATION.md`):

```
HiveShield (Platform Capability)
│
├── PolicyEngine
├── CloudSecurityPosture
├── ThreatDetectionEngine
├── ComplianceEngine
├── KeyManagementService
├── SecurityEvents
└── AIGovernanceEngine        ← added, Phase 6
        │
        ├── PromptPolicyEvaluator
        ├── ToolPolicyEvaluator
        ├── AgentPolicyEvaluator
        ├── ModelSelectionPolicy
        ├── BudgetPolicy
        ├── DataClassificationPolicy
        ├── SafetyPolicy
        ├── CompliancePolicy
        ├── ApprovalPolicy
        └── OutputPolicy
```

**Responsibility table** (recorded here so future contributors can't collapse these back into one concept):

| Component | Responsibility |
|---|---|
| `PolicyEngine` | Enterprise authorization — RBAC/ABAC, resource access |
| `PolicyEvaluationClient` | Client interface to `PolicyEngine`, used by `HiveGateway` |
| `AIGovernanceEngine` | AI execution governance — agents, prompts, models, tools, budgets, approvals |

`PolicyEngine` and `AIGovernanceEngine` both consult `Policy` aggregates (`01-DOMAIN-MODEL.md` §2/§4) — they are two different **evaluators** over the same underlying `Policy` attachment mechanism, not two different authorization models. A `Policy` scoped to `Classification = AI-Model-Usage` is evaluated by `AIGovernanceEngine`; a `Policy` scoped to resource RBAC is evaluated by `PolicyEngine`. This keeps one `Policy` aggregate, two evaluators — consistent with the domain model rather than forking it (see Architectural Impact, §17, on the `Policy` sub-typing this implies).

## 1. Zero Trust identity (Layer 1)

**Maps to:** `ADR-023` (Identity and credential escrow), extended here, not replaced.

- **Authentication:** Passkeys/WebAuthn, FIDO2, MFA, SSO, OIDC, SAML — all supported as authentication mechanisms into `HiveIdentity`. `ADR-023` already fixes OIDC/OAuth2 as the base; this phase adds the specific mechanism list and elevates MFA from optional to conditionally required (see ABAC decision engine, below).
- **Authorization — ABAC, not plain RBAC.** `ADR-023` left "the precise role/permission model" unspecified, deferred to implementation. This phase resolves that: authorization is attribute-based (Role, Department, Location, Project, Classification, Risk Score, and any other attribute a `Policy` names), evaluated by `PolicyEngine`, not a fixed role list. This is additive to, not a replacement of, the Organization/Tenant/Project/Workspace attachment levels `01-DOMAIN-MODEL.md` §4 already fixes — ABAC attributes narrow a decision *within* that scoping, they don't replace it.
- **Decision engine outputs:** `Permit`, `Deny`, `Step-up MFA`, `Human Approval`. The last two are new outcomes beyond simple Permit/Deny — `Step-up MFA` re-invokes authentication with a stronger factor; `Human Approval` routes to Layer 14's workflow. Both are modeled as `PolicyEngine` decision outcomes, not separate systems.

**Infrastructure-level tenant isolation — resolved.** `ADR-026` left this explicitly open ("to be resolved in Phase 6"). Resolving it now: **isolation is enforced logically by default (shared infrastructure, Tenant-scoped by construction per `ADR-026`), with dedicated-account isolation available as a `Policy`-gated option per Organization**, not a universal requirement. Rationale: mandating per-Tenant cloud accounts for every customer is a cost/operational burden `00-FOUNDATION.md` §7 (target customers, still deferred) hasn't justified yet; making it `Policy`-selectable means an enterprise/regulated customer can require it without forcing the cost onto every customer. This becomes an amendment to `ADR-026` (§17, below), not a new ADR — it resolves a question that ADR already posed.

## 2. AI identity (Layer 2)

Every AI agent (CerebroStudio's, or any future CerebroHive product's) that calls a HiveForge-hosted AI service receives its own identity, structurally identical to the `User` subtype pattern `05-BUSINESS-PLATFORM.md` §1a already established for service accounts — **an AI agent identity is a `User` subtype, not a fourth identity concept alongside human User, service-account User, and now agent.** Concretely: `AgentIdentity` extends `User`, carries an `AgentCertificate` (issued the same way `ADR-023`'s escrowed credentials are — short-lived, narrowly scoped), and its `Policy` attachments name agent-specific permission classes:

```
AgentPermissions   — which capabilities/resources the agent may act on
ToolPermissions    — which tools it may invoke (per your ReviewAgent example:
                     "Read GitHub, Read ADR, Read PRD" permitted;
                     "Delete repositories, Access HR data, Access Finance" denied)
MemoryPermissions  — which memory/context stores it may read or write
DataPermissions    — which data classifications (Layer 7) it may access
RuntimePermissions — which runtime environments it may execute in
ModelPermissions   — which underlying models it may be routed to (Layer 3)
```

This reuses `Policy` attachment (`01-DOMAIN-MODEL.md` §4) exactly as human/service-account `User`s do — an agent's permission set is a `Policy`, evaluated by `PolicyEngine` for resource-level questions (can it delete a repository) and by `AIGovernanceEngine` for AI-specific questions (can it use this model, this tool, this budget).

**Agent Identity Document.** Identity doesn't stop at an ID and a permission list — every `AgentIdentity` carries a signed document, the workload-identity equivalent for AI agents:

```
Agent ID
Agent Version
Owner                  (the User, per 05-BUSINESS-PLATFORM.md §1a, that registered it)
Capability              (which HiveForge/CerebroHive capability it acts within)
Trust Level
Runtime
Allowed Models
Allowed Tools
Allowed Memory
Allowed Data Classes
Maximum Budget
Maximum Runtime
Approval Requirements
Signing Certificate     (the AgentCertificate, ADR-023's escrow principle)
```

This document is what `AgentCertificate` actually carries — not just a bare credential, but the full set of constraints `AIGovernanceEngine` evaluates a request against. `ADR-029` is amended to fix this shape (§17, below).

## 3. AI governance layer / `AIGovernanceEngine` (Layer 3)

The engine named and reconciled in §0. Answers questions `PolicyEngine` structurally cannot, because they're about workflow execution constraints, not resource access:

```
Who can use GPT-5 / Claude / any specific model?
Maximum context, maximum cost per request or per Agent
Allowed tools, forbidden APIs
Allowed data classification (Layer 7) for a given model/tool combination
PII handling rules, retention rules
When human approval (Layer 14) is required
```

Policy example, expressed as a `Policy` attachment evaluated by `AIGovernanceEngine`:

```
IF   DataClassification = Customer Data
AND  Target = External Model
THEN Block
OR   Require Local LLM (self-hosted, via HiveCompute/HiveDatabase-hosted inference)
```

This is where HiveForge's own capabilities (`HiveCompute` for self-hosted inference, `HiveDatabase` for vector/embedding stores) become relevant to AI governance — a "Require Local LLM" decision routes to infrastructure HiveForge itself provisions, closing the loop between the infra platform and the AI governance layer cleanly rather than leaving "Local LLM" as an undefined external dependency.

**Evaluation order** — fixed here as an architectural invariant, not left implicit per-implementation:

```
Request
  ↓
Authentication            (Layer 1, HiveIdentity)
  ↓
Authorization              (Layer 1, PolicyEngine — resource access)
  ↓
Prompt Validation           (Layer 4, PromptFirewall — sanitizer stage)
  ↓
Data Classification          (Layer 7, DataClassificationPolicy)
  ↓
Model Selection                (ModelSelectionPolicy)
  ↓
Tool Authorization               (ToolPolicyEvaluator)
  ↓
Budget Policy                       (BudgetPolicy)
  ↓
Human Approval                        (ApprovalPolicy, Layer 14, if triggered)
  ↓
Execution                                (SecureAIGateway → LLM provider)
  ↓
Output Validation                          (Layer 4, PromptFirewall — output stage)
  ↓
Audit                                        (Layer 15, Operation provenance record)
```

Resource-level authorization (`PolicyEngine`) always runs before any `AIGovernanceEngine` evaluator — an agent that fails plain resource authorization never reaches prompt/model/tool/budget evaluation at all.

## 4. Secure prompt gateway (Layer 4)

`PromptFirewall` — a new `AIGovernanceEngine` submodule (added to §0's diagram under a dedicated inbound-inspection role, distinct from the policy evaluators listed there, since it's a content-inspection pipeline, not a policy evaluator):

```
Prompt → Sanitizer → Policy Validation (AIGovernanceEngine) → LLM → Output Validation → User
```

Checks: prompt injection, jailbreak attempts, data leakage, embedded secrets, malware, embedded URLs, dangerous instructions. Output validation is symmetric — the same inspection class applied to model output before it reaches the caller, not just the inbound prompt.

## 5. Secure AI gateway (Layer 5)

A unified routing layer in front of `OpenAI, Claude, Gemini, Azure OpenAI, AWS Bedrock, Ollama, vLLM, Llama.cpp` — encryption, rate limiting, cost tracking, provider routing, failover, content filtering, token monitoring.

**Flagged, not silently resolved:** this component's shape is structurally identical to `HiveGateway` (`ADR-021` — unified entry point, provider abstraction, routing, failover) applied to LLM providers instead of cloud providers. Two ways to model it, and this document picks one but records the alternative: (a) a distinct component (`SecureAIGateway`) parallel to `HiveGateway`, owned by HiveShield — **chosen here**, since LLM-provider routing has materially different concerns (token-level cost metering, content filtering) than infrastructure provisioning; or (b) a `ProviderExecutor` (`ADR-020`) implementation treating LLM providers as another `Provider` type. Rejected for this phase: it would overload `ProviderExecutor`'s contract (`04-PROVIDER-FRAMEWORK.md` §3 explicitly excludes billing/policy from that contract, and LLM routing needs both inline). This choice is revisitable at Phase 8 (Roadmap) if HiveDatabase's own precedent (a capability graduating from "internal module" to independent capability) applies here too.

## 6. Secrets management (Layer 6)

Maps directly to `KeyManagementService` (existing HiveShield module) and `ADR-023`'s credential-escrow principle — this phase makes explicit what `ADR-023` implied: secrets are never in code, backed by `AWS Secrets Manager / HashiCorp Vault / KMS`, envelope encryption, automatic rotation. Secret classes: API keys, JWT signing keys, database passwords, OAuth credentials, SSH keys, TLS certificates. No new component — this is `KeyManagementService`'s scope stated explicitly rather than left implicit.

## 7. Data security (Layer 7)

Classification levels: `Public, Internal, Confidential, Restricted, Highly Confidential`. Automatic classification (AI-assisted discovery of PII, PCI, HIPAA, GDPR, trade secrets, source code) and encryption (AES-256, TLS 1.3, envelope encryption, field-level encryption) are both `DataClassificationPolicy` (§0 diagram) concerns for AI-adjacent data, and a `ComplianceEngine` (existing HiveShield module) concern for the general case. Classification is attached to data the same way `Policy` attaches to aggregates — a first-class attribute, not inferred ad hoc per service.

## 8. Runtime security (Layer 8)

Split into two distinct problems, per an explicit recommendation — they overlap in name ("runtime") but not in what they protect against:

**Platform Runtime Security** — containers and Kubernetes hosting HiveForge's own capability services (and, where opted in, `HiveCompute`-provisioned customer workloads): distroless images, read-only filesystem, non-root, seccomp, AppArmor, SELinux at the container level; OPA Gatekeeper, Kyverno, network policies, Pod Security Standards at the Kubernetes level; Falco, eBPF, Sysdig, Tetragon, Tracee for kernel-level runtime detection. Mandatory for HiveForge's own deployment; a Policy-gated hardening profile for customer `HiveCompute` workloads, not a mandatory constraint on customer configuration.

**AI Runtime Governance** — a different failure surface entirely, already covered by components fixed earlier in this document rather than duplicated here: hallucination detection and model drift (`AIGovernanceEngine`'s `OutputPolicy`/`SafetyPolicy`, §3), prompt injection and tool abuse (`PromptFirewall`, §4), agent loop/runaway-execution detection and cost anomalies (`BudgetPolicy`, §3, and the AI SOC, §13). Naming these here explicitly, alongside Platform Runtime Security, makes clear HiveShield addresses both — but as two separate concerns with separate tooling, not one "runtime security" bucket.

## 9. Supply chain security (Layer 9)

Every build: SBOM, dependency scan, container scan, secrets scan, license scan, IaC scan. Tools: Trivy, Grype, Syft, Semgrep, CodeQL, OSV, Snyk, Dependabot. Applies to HiveForge's own build pipeline first (control plane, capability services) — a Verified claim is only made once a real pipeline runs these, per Phase 0 principle #8 ("no claim without evidence"); today this section is Planned like everything else in this masterplan.

## 10. Secure CI/CD (Layer 10)

```
GitHub → CodeQL → Semgrep → Unit Tests → SAST → Dependency Scan → Container Scan
       → IaC Scan → Policy Validation → Artifact Signing → Deployment
```

"Policy Validation" here is a `PolicyEngine` check (deployment-time authorization), not `AIGovernanceEngine` — no AI content is involved in a deployment pipeline gate, so it's important this step doesn't get miscategorized under the AI-governance engine by naming proximity alone.

## 11. Infrastructure security (Layer 11)

Terraform + Policy as Code (OPA, Sentinel), AWS Security Hub, GuardDuty, Inspector, Macie, IAM Access Analyzer, CloudTrail, AWS Config. Maps to `CloudSecurityPosture` (existing HiveShield module) — this phase names the concrete tool set that module wraps, consistent with HiveForge's own multi-cloud stance (`00-FOUNDATION.md` principle #2): AWS-native tools listed here are the first-provider instantiation; Azure/GCP equivalents (Defender for Cloud, Security Command Center) are the same `CloudSecurityPosture` abstraction applied to a different `Provider`, not a separate module per cloud.

## 12. Detection platform (Layer 12)

SIEM (OpenSearch, Elastic, Splunk, Microsoft Sentinel — pick one, not fixed here, deferred to implementation) ingesting: LLM calls, authentication events, agent decisions, prompt injection attempts, data access, policy violations, API calls, infrastructure events. Maps to `SecurityEvents` (existing HiveShield module) as the event bus, and `ADR-024`'s event-driven architecture generally — detection events are Integration Events (`ADR-024`'s domain/integration split, per `03-CONTROL-PLANE.md` §5), not Domain Events, since they're consumed by an external SIEM system, not by HiveForge's own aggregates.

## 13. AI Security Operations Center (Layer 13)

An `AIGovernanceEngine`-fed operations view, distinct from a traditional SOC (which watches users/infrastructure): prompt monitoring, agent monitoring, model drift, hallucinations, prompt injection, cost anomalies, data leakage, tool misuse. This is a monitoring/alerting consumer of `AIGovernanceEngine`'s evaluators (§0) and `PromptFirewall`'s (§4) inspection results — not a new policy-evaluation component, an observability layer over the ones already defined.

## 14. Human approval (Layer 14)

```
AI Suggestion → Risk Analysis → Human Approval → Execution
```

Examples requiring approval: delete database, production deployment, infrastructure changes, financial transactions, compliance override, PII export. This is the concrete implementation of the `Human Approval` decision-engine outcome from §1 and `AIGovernanceEngine`'s `ApprovalPolicy` (§0) — one workflow, invoked from either the ABAC decision engine (Layer 1, non-AI actions) or `AIGovernanceEngine` (AI-suggested actions), not two separate approval systems.

**Approval as a platform capability, not a security-specific feature.** Security, Compliance, Cost, Architecture, Operations, and Release Management all need the same shape of workflow (a proposed action, a risk/context summary, a routing rule for who approves, an audit record of the decision) — modeling it as `HumanApprovalWorkflow`, a shared subsystem any capability can invoke (not a HiveShield-owned, security-only feature), avoids five near-identical approval implementations emerging independently across the platform later. HiveShield remains the *primary* invoker (Layers 1 and 3 route through it), but ownership of the workflow itself is platform-level, not HiveShield-exclusive. This becomes an amendment to `ADR-028` (§17, below), which originally scoped it as a HiveShield-only decision-engine outcome.

## 15. AI governance / provenance (Layer 15)

Full provenance record per AI-originated action: who asked, which model, which tools, which documents, confidence, reasoning summary, cost, latency, risk, output. This is an `Operation` record (`01-DOMAIN-MODEL.md` §2) with an AI-specific evidence payload — not a new aggregate. Consistent with the append-only evidence discipline already established (`ADR-006`'s `EvidenceReference` pattern in `packages/engineering-review`, and `01-DOMAIN-MODEL.md` §2's Operation-as-audit-trail principle): an AI-originated `Operation` carries this provenance payload as its evidence, the same way a human-originated `Operation` carries its own audit trail, with no separate provenance store to keep in sync.

**Roadmap note, not a Phase 6 gap.** A fuller "AI Evidence & Provenance" architecture — explicit prompt lineage, tool lineage, document lineage, model lineage, approval lineage, and execution lineage as traceable, queryable chains (not just an `Operation`'s flat evidence payload) — is real, increasingly important for regulated customers, and deliberately not designed here. It's carried forward to Phase 8 (Roadmap) as a candidate future ADR, not a blocking gap in this phase (see §17).

## 16. Enterprise security dashboard (Layer 16)

A read surface (per `03-CONTROL-PLANE.md` §3a's command/query separation — this entire dashboard is queries, no commands) over: Identity (active users/agents, failed logins, privileged sessions), AI (model usage, agent activity, prompt attacks, hallucination trends, cost by provider), Infrastructure (containers, clusters, cloud accounts, runtime alerts), Compliance (ISO 27001, SOC 2, NIST CSF 2.0, NIST AI RMF, PCI DSS, GDPR, HIPAA — all Planned, no certification claimed or implied at this stage, per Phase 0 principle #8), and Risk (critical vulnerabilities, misconfigurations, threat level, third-party risk, supply-chain status). Sources every figure from the components already defined above (`SecurityEvents`, `ComplianceEngine`, `AIGovernanceEngine`, `CloudSecurityPosture`) — this section introduces no new data source, only an aggregated view.

**Approval status:** Approved, with recommendations carried forward as enhancements (not reopening this phase) — the responsibility table (§0), the Agent Identity Document (§2), the explicit evaluation order (§3), the Platform/AI runtime split (§8), `HumanApprovalWorkflow` as a platform capability (§14), and an `ADR-030` revisit trigger (below) are all incorporated directly into this document rather than deferred.

## 17. Architectural impact

Per the standing governance rule:

**ADRs created:**
- `ADR-028` — Zero Trust Identity, ABAC & Human-Approval Decision Engine (Layer 1, Layer 14's non-AI path)
- `ADR-029` — AI Agent Identity & AIGovernanceEngine (Layers 2, 3, 15)
- `ADR-030` — Secure Prompt Gateway & Secure AI Gateway (Layers 4, 5)
- `ADR-031` — Secrets Management & Data Classification (Layers 6, 7)
- `ADR-032` — Runtime, Supply Chain & CI/CD Security (Layers 8, 9, 10)
- `ADR-033` — Infrastructure Security & Detection Platform, incl. AI SOC (Layers 11, 12, 13)

**ADRs amended:**
- `ADR-026` (Multi-Tenant Isolation Strategy) — its explicitly-open infrastructure-isolation question is resolved (§1, above): logical isolation by default, dedicated-account isolation as a Policy-gated option.
- `00-FOUNDATION.md` §1 — `AIGovernanceEngine` added to the HiveShield internal-module diagram (§0, above).
- `ADR-029` (AI Agent Identity & AIGovernanceEngine) — amended to fix the Agent Identity Document shape (§2, above) as what `AgentCertificate` actually carries, and to fix the evaluation order (§3, above) as an architectural invariant.
- `ADR-030` (Secure Prompt & AI Gateway) — amended with an explicit revisit trigger: *"Revisit the `SecureAIGateway`/`HiveGateway` separation when two or more non-LLM provider classes require identical routing, telemetry, policy evaluation, retry, and failover semantics."* Gives an objective criterion rather than an arbitrary future re-litigation.
- `ADR-028` (Zero Trust Identity, ABAC & Human Approval) — amended: `HumanApprovalWorkflow` (§14, above) is a platform-level shared subsystem any capability can invoke (Security, Compliance, Cost, Architecture, Operations, Release Management), not a HiveShield-exclusive feature. HiveShield remains its primary invoker, not its sole owner.
- `06-SECURITY.md` §8 — split into Platform Runtime Security and AI Runtime Governance as two named, separately-tooled concerns (no ADR change required — both were already covered by `ADR-032` and `ADR-029`/`ADR-030` respectively; this is a documentation clarification, not a new decision).

**Existing specifications requiring updates:**
- `01-DOMAIN-MODEL.md` — `Policy` (§2/§4) should note it now has (at minimum) two evaluator classes, `PolicyEngine` and `AIGovernanceEngine`, distinguished by attribute/classification, not by a schema change to `Policy` itself.
- `04-PROVIDER-FRAMEWORK.md` — no change required; §5's rejected "LLM-as-Provider" alternative (§5, above) is recorded here, not there, since it was rejected rather than adopted.

**Future phases depending on these decisions:**
- Phase 7 (Operations) depends on the Detection Platform (Layer 12) and dashboard (Layer 16) for its observability model, and should build on `HumanApprovalWorkflow` (§14) for any operational approval gates (incident response actions, DR failover) rather than defining its own.
- Phase 8 (Roadmap) inherits: the deferred `SecureAIGateway` vs. `ProviderExecutor` question (§5, now with an explicit revisit trigger, above), and the AI Evidence & Provenance architecture (§15) as a candidate future ADR — real and important for regulated customers, not designed in this phase.

**Assumptions remaining open:**
- Which SIEM product (Layer 12) and which specific compliance certifications are actually pursued (Layer 16) remain Open Decisions — this phase fixes the architecture that would support any of them, not a specific vendor or certification commitment.
- The infrastructure-isolation resolution (§1) fixes the *default and the option*, not the specific Policy schema/pricing implication of choosing dedicated-account isolation — that's Phase 0 §8 (business model) adjacent, deferred consistent with the rest of this masterplan's commercial deferrals.
