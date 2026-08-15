# Agent Academy and Agent Registry Design

**Date:** 2026-08-11  
**Status:** Approved for implementation  
**First slice:** Database-backed Agent Registry vertical slice

## Product intent

CerebroHive will manage its agent fleet through an Agent Academy and AgentOps control plane rather than through independent prompts or file-backed agent definitions. The product lifecycle is registry, curriculum, governed knowledge and tools, simulation, evaluation, red-team testing, certification, deployment, production operations, and continuous learning.

The first implementation slice establishes the canonical Agent Registry. It must let an authorized Studio user create, version, publish, and govern an agent end to end. The existing PostgreSQL/Prisma stack is the source of truth. YAML and JSON are future import/export interfaces, not runtime storage.

The central invariant is:

> `Agent` is the stable aggregate identity, `AgentDraft` is the only mutable definition, and `AgentVersion` is an immutable published executable snapshot.

## 1. Current-state compatibility constraints

- Existing `Agent.id` and `AgentVersion.id` values remain stable across registry, runtime, executions, conversations, Studio, and audit history.
- Existing version numbers are never regenerated or renumbered.
- Existing runtime fields and normalized relations remain readable until every runtime consumer is deliberately migrated.
- `AgentDraft` is pre-publication state and can never be executed or referenced by executions, evaluations, or deployments.
- Existing `/v1/agents`, `/app/agents`, and `/app/agents/[id]` paths remain canonical and are evolved in place.
- Workspace isolation applies to every aggregate, draft, and version lookup. Knowing a UUID never bypasses scope.
- During migration, active-version fallback to the legacy resolver is temporary, observable, and test-detectable.
- After cutover, no production path may create an `AgentVersion` outside the publication service.
- `AuditLog` remains administrative audit authority; AgentOps telemetry is separate.

**Compatibility invariant:** the registry may enrich the canonical aggregate and add pre-publication state, but it must not fork identity, duplicate runtime authority, invalidate execution references, or introduce a second canonical API or UI.

## 2. Prisma schema changes

### Agent

Add lifecycle status, active-version pointer, owner/creator metadata, and latest lifecycle actor/time. Preserve current identity and runtime relations. Keep `isActive` temporarily as a deprecated compatibility field; direct writes are prohibited after cutover.

Lifecycle values for slice 1 are `DRAFT`, `SANDBOX`, `CERTIFIED`, `PRODUCTION`, and `SUSPENDED`.

### AgentDraft

Add one draft per agent with `agentId`, `workspaceId`, `baseVersionId`, JSON definition, monotonically increasing `revision`, validation status/errors, editor provenance, and timestamps. A unique constraint on `agentId` enforces the one-draft rule.

### AgentVersion

Add `workspaceId`, governed definition JSON, definition schema version/hash, publication actor/time/source, and source draft ID/revision. Preserve `modelId`, `instructions`, `config`, capabilities, tools, and prompts for compatibility.

Database constraints enforce:

- draft/version workspace equals the parent agent workspace;
- active version belongs to the same agent;
- `(agentId, version)` remains unique;
- version updates are rejected after backfill and constraint cutover.

Published definition hashes use deterministic canonical JSON and SHA-256. Provenance is excluded from the semantic definition and hash.

## 3. Migration strategy

Use expand, compatibility deploy, deterministic backfill, verification/shadow, constraints, active-pointer cutover, fallback removal, exclusive publication, and immutability enablement.

The preflight artifact records every agent/version ID, legacy selected version, workspace ownership, runtime-relation counts, execution references, lifecycle disposition, and backfill status. Every inactive versioned agent receives a reviewed migration disposition before suspension becomes enforceable.

Backfill is bounded, idempotent, resumable by durable keyset checkpoints, and reconstructs definitions with deterministic collection ordering. Unknown human provenance remains null. Migration source is stored outside the semantic definition.

Cutover requires:

- active-pointer parity with the legacy resolver;
- no orphan or cross-workspace drafts/versions;
- exactly one draft per migrated agent;
- legacy-to-definition-to-legacy runtime round-trip equivalence;
- stable IDs/counts and valid execution references;
- zero fallback reads;
- a second backfill run producing no changes.

Rollback may temporarily restore legacy version selection, but it may not disable lifecycle execution enforcement after that security boundary is enabled.

## 4. AgentDefinitionV1

The canonical governed snapshot contains no aggregate identity or mutable lifecycle metadata.

```ts
interface AgentDefinitionV1 {
  schemaVersion: 1;
  purpose: string;
  businessFunction: string;
  responsibilities: string[];
  expectedOutputs: string[];
  systemInstructions: string;
  modelConfig: {
    providerRef: string;
    modelRef: string;
    temperature: number;
    maxTokens: number;
  };
  capabilities: Array<{ capabilityRef: string; description?: string }>;
  allowedActions: Array<{ actionRef: string; description: string }>;
  prohibitedActions: Array<{ actionRef: string; description: string }>;
  escalationRules: Array<{
    ruleRef: string;
    condition: string;
    action: "REQUEST_APPROVAL" | "HANDOFF" | "REFUSE";
    targetRef?: string;
    instructions?: string;
  }>;
  securityLevel: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  toolPermissions: Array<{
    toolRef: string;
    operations: string[];
    constraints?: Record<string, unknown>;
    justification?: string;
  }>;
  knowledgeSources: Array<{
    knowledgeSourceRef: string;
    access: "READ";
    purpose?: string;
  }>;
}
```

Stable references are lowercase typed opaque keys such as `provider:`, `model:`, `capability:`, `tool:`, and `knowledge:`. They are not display names. Tool operations and reference-bearing collections are unique by their stable keys.

Draft structural validation allows incomplete values but rejects unknown fields, wrong types, malformed nonempty references, and excessive depth/size. Publication validation requires completeness, resolved model references, consistent action policy, valid escalation targets, and all bounds.

Publication applies defaults, Unicode NFC and LF normalization, deterministic unordered-collection sorting, RFC 8785-compatible serialization, and SHA-256. It never trims or rewrites meaningful prompt whitespace. Stored V1 definitions remain interpreted as V1 and are never silently rewritten under a future schema.

Tool, knowledge, and capability declarations are governance metadata only in slice 1. They do not grant or revoke runtime access. Existing prompt bindings are deliberately outside `AgentDefinitionV1` and are preserved as legacy runtime state.

## 5. AgentDraft lifecycle and concurrency

The draft lifecycle is create, edit/autosave, validate, publish, and rebase. New agents receive a schema-defined V1 skeleton at revision 1 with `baseVersionId = null` and `UNVALIDATED`. Existing agents receive a draft copied from their active canonical definition.

Each autosave includes the expected draft revision. A successful scoped update writes the definition, publication-validation state, editor metadata, and increments revision atomically. A stale write changes nothing and returns `AGENT_DRAFT_REVISION_CONFLICT` with sanitized conflict metadata.

Structural failures return 422 without persistence. Publication-invalid but structurally valid content persists as `INVALID`. `VALID` always means publishable now.

Publishing additionally verifies that `baseVersionId` still equals `activeVersionId`; mismatch returns `AGENT_DRAFT_BASE_VERSION_CONFLICT`. After publication, the same draft rebases from the exact stored version JSON and increments rather than resets its revision.

Viewer/Analyst may see draft metadata but not unpublished definition content. Developer and above may read/edit the draft. Slice 1 has no personal drafts, locks, branches, merge UI, or archived draft history.

## 6. Publication transaction

Publication authorizes and scopes before any idempotent replay, then serializes work per agent. The idempotency fingerprint binds operation, agent, expected draft revision, actor, and workspace.

Within one transaction it verifies revision/base, validates and resolves the exact model, canonicalizes and hashes the stored definition, rejects unchanged content, allocates the next version, creates the immutable version and all cloned runtime bindings, updates lifecycle and active pointer, writes audit and outbox records, rebases the draft, completes idempotency, and commits.

The immutable version records the resolved provider/model identity used at publication, not only a mutable alias. Runtime tool/capability/prompt bindings clone atomically from the base version and are never inferred from governance declarations.

Lifecycle result on publication is:

| Before | After |
|---|---|
| DRAFT | DRAFT |
| SANDBOX | SANDBOX |
| CERTIFIED | SANDBOX |
| SUSPENDED | SANDBOX |
| PRODUCTION | rejected |

Deterministic domain conflicts are never retried. Serialization/deadlock failures retry the whole transaction a bounded number of times. Successful transactional audit describes final committed state; rejected security-sensitive attempts use the request/security audit channel outside the rolled-back transaction.

## 7. Agent lifecycle state machine

Lifecycle transitions are explicit typed commands, never arbitrary field updates.

```text
DRAFT --enter_sandbox--> SANDBOX --certify--> CERTIFIED --promote--> PRODUCTION
PRODUCTION --suspend--> SUSPENDED --reactivate--> PRODUCTION
```

Rules:

- `enter_sandbox` requires an active version and a draft rebased to that version.
- `certify` requires an active version, a `VALID` unchanged draft, and Admin authority. Slice 1 records an administrative attestation; evaluation-backed certification arrives later.
- `promote` requires the same certified active version and Owner authority.
- `suspend` and `reactivate` require Owner authority.
- `reactivate` is allowed only if no version was published while suspended. Publication from `SUSPENDED` resets lifecycle to `SANDBOX`, forcing recertification and promotion.
- Publishing from `CERTIFIED` resets to `SANDBOX`; publishing from `PRODUCTION` is forbidden.
- Invalid transitions return `AGENT_LIFECYCLE_CONFLICT` without mutation.

Normal execution requires `PRODUCTION`. `SUSPENDED`, `DRAFT`, `SANDBOX`, and `CERTIFIED` are not executable through the production runtime in slice 1.

## 8. Authorization and capabilities

Authorization uses capabilities mapped to existing roles:

| Capability | Viewer/Analyst | Developer | Admin | Owner |
|---|---:|---:|---:|---:|
| `agent.read` | yes | yes | yes | yes |
| `agent.create` | no | yes | yes | yes |
| `agent.draft.edit` | no | yes | yes | yes |
| `agent.version.publish` | no | no | yes | yes |
| `agent.lifecycle.certify` | no | no | yes | yes |
| `agent.lifecycle.promote_production` | no | no | no | yes |
| `agent.lifecycle.suspend` | no | no | no | yes |

Permissions are checked in application services and never inferred from UI visibility. Repository reads/writes still require scoped request context. Cross-workspace and nonexistent resources both return 404.

## 9. AgentRepository evolution

The canonical repository gains focused scoped operations for listing/detail, draft read/update, version history/detail, publication persistence, active-version resolution, and lifecycle compare-and-set. It accepts the existing transaction client through repository options.

Repository methods enforce storage/scoping invariants but do not own business authorization or lifecycle policy. No general `updateAgentVersion`, arbitrary lifecycle setter, or unscoped ID lookup is exposed. The old direct `publishVersion` becomes internal compatibility code and is removed at cutover.

## 10. Application service boundaries

Application services own use-case orchestration:

- `AgentRegistryService`: list, detail, create aggregate plus initial draft.
- `AgentDraftService`: read, autosave, validate, and conflict mapping.
- `AgentPublicationService`: exclusive publication transaction and event emission.
- `AgentLifecycleService`: explicit transition commands and guards.

Shared definition validation/canonicalization is a pure component with no database or HTTP dependency. Repositories remain persistence adapters. Routes translate transport input/output only.

## 11. `/v1/agents` API

Evolve the existing resource family:

- `GET /v1/agents`
- `POST /v1/agents`
- `GET /v1/agents/:agentId`
- `GET /v1/agents/:agentId/versions`
- `GET /v1/agents/:agentId/versions/:versionId`
- `GET /v1/agents/:agentId/draft`
- `PATCH /v1/agents/:agentId/draft`
- `POST /v1/agents/:agentId/publish`
- `POST /v1/agents/:agentId/lifecycle`

Create returns the stable agent plus draft metadata. Draft updates require `expectedRevision`. Publish requires `expectedDraftRevision` and an idempotency key. Lifecycle accepts a typed action rather than a target status.

Responses preserve legacy list/detail fields while adding registry data. Read-only users never receive draft JSON. Versions have no mutation endpoint. Direct `PATCH status`, direct version creation, and destructive agent deletion are outside slice 1.

## 12. Audit and outbox

Use canonical `AuditLog` in the same transaction for successful aggregate creation, publication, and lifecycle transitions. Metadata contains workspace, actor ID, agent/version IDs, old/new lifecycle, definition hash, draft revision, correlation/idempotency references, and publication source. It excludes full definitions, prompts, secrets, and sensitive validation content.

Autosaves rely on draft revision/editor metadata rather than emitting an audit row for every keystroke. Security-significant rejected attempts use the existing request/security audit path because the domain transaction rolls back.

Publication emits an `AgentVersionPublished` outbox event containing stable IDs, version number, definition hash, final lifecycle, workspace/tenant, and correlation metadata. Lifecycle transitions emit their own event. Consumers may retry safely using event and aggregate IDs.

## 13. Studio UX

Upgrade `/app/agents` into the registry list with search, lifecycle filters, active version, owner, draft state, and a permission-aware Create Agent action. Empty, loading, error, and unauthorized states are explicit.

Upgrade `/app/agents/[id]` into a compact detail workspace:

- Overview: identity, purpose, lifecycle, owner, active version.
- Draft: governed definition editor, validation summary, autosave state, and metadata-only warnings for tool/knowledge declarations.
- Versions: immutable history and read-only snapshot inspection.
- Governance: allowed/prohibited actions, escalation, security level, declarations.
- Lifecycle: permitted actions and requirements.

Autosave is debounced, revision-aware, and never overwrites a conflict. A 409 presents reload/manual reconciliation while preserving local unsaved content. Publish shows validation failures inline and requires confirmation. Production publication is disabled with the required suspend/edit/recertify/promote workflow explained.

## 14. Runtime compatibility

During compatibility deployment, active-pointer reads fall back observably to legacy highest-version selection. After parity and zero fallback, runtime uses `activeVersionId` exclusively.

Existing runtime consumes `modelId`, `instructions`, `config`, and normalized bindings. Publication projects only approved scalar fields and clones bindings from the base version. Governed declarations do not affect runtime permissions. Production execution checks lifecycle before resolving the version; this guard remains enabled even if version resolution rolls back temporarily.

## 15. Automated test matrix

- Definition structural/publication validation, defaults, reference uniqueness, canonicalization, and stable hashes.
- Migration idempotency, checkpoints, selected-version parity, relationship integrity, and round-trip compatibility.
- Repository workspace isolation, one-draft constraint, active-version ownership, and version immutability.
- Draft autosave success, invalid persistence, atomic revision conflicts, and base-version conflicts.
- Concurrent publication, monotonic numbering, idempotent replay, key reuse, unchanged rejection, and total rollback on each failing step.
- Lifecycle transition matrix, permissions, certification invalidation, production publication rejection, and runtime execution guard.
- API schema, status/error contracts, draft redaction, and cross-workspace non-disclosure.
- Studio component/integration coverage for list, create, edit/autosave, conflict, publish, history, and lifecycle actions.
- At least one browser E2E flow: Developer creates/edits, Admin publishes/certifies, Owner promotes, then the immutable version remains inspectable.

## 16. Rollout and backfill

Release behind workspace feature flags. Run preflight and backfill in staging, verify the manifest, exercise shadow reads, then canary selected internal workspaces. Monitor fallback counts, publication failures, conflicts, lifecycle denials, API latency, and runtime version parity.

Enable database constraints and immutability only after verification. Enable Studio actions after backend cutover. Remove fallback only after a sustained zero-use window. Preserve migration and verification artifacts with the release evidence.

## 17. First-slice non-goals

- Evaluation suites, scoring, certification based on evaluation results, and training curricula.
- Simulation lab, shadow execution, red-team automation, and synthetic scenario generation.
- Runtime tool permission enforcement or knowledge retrieval binding.
- Deployment orchestration, deployment slots, canaries, or zero-downtime version promotion.
- AgentOps telemetry, cost/latency dashboards, and production feedback learning loops.
- YAML/JSON import/export, Git synchronization, branching drafts, approvals, or merge workflows.
- Full nine-state academy lifecycle, 35-agent seeding, agent-to-agent orchestration, or autonomy levels.
- Governed prompt snapshots or changes to existing prompt-management authority.

These are subsequent Agent Academy phases built on the stable `Agent` and immutable `AgentVersion` identities established here.
