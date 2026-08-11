# @cerebro/capability-registry

Schema, validation, and in-memory indexing for the **agentOS ↔ MCP capability
registry**. This is **PR #25** of the capability-registry roadmap.

## Purpose

Lets the agentOS runtime reason about tools as **capabilities** instead of
hard-coding integrations. A capability is a stable, named unit of functionality
(e.g. `source-control`) that one or more **providers** (github, gitlab, …) can
fulfill. The runtime discovers capabilities from a registry document and binds to
whichever provider is available.

```yaml
capability: source-control
providers: [github, gitlab]
operations: [read_repo, create_pr, list_issues]
risk: medium
requires: oauth
policy:
  allow: [read*, create_pr]
  deny:  [delete_repository, force_push]
```

## Roadmap position

| PR | Scope | Status |
|----|-------|--------|
| #24 | Hermes MCP docs + template + policy (dev-side) | draft |
| **#25** | **Capability Registry schema** (this package) | **this PR** |
| #26 | agentOS runtime registry loader (file/HTTP + wiring) | later |
| #27 | Policy evaluation engine (risk gating, approvals, scopes) | later |
| #28 | Runtime capability discovery | later |
| #29 | Marketplace / provider abstraction | later |

## Relationship to PR #24

The `.hermes/policies.yaml` from PR #24 is the **per-developer** guardrail for the
Hermes CLI. This registry is the **platform-level** expression of the same ideas:

| PR #24 (`.hermes/policies.yaml`) | PR #25 (`CapabilityPolicy`) |
|---|---|
| `tool_deny_patterns: [delete*, drop*, exec*]` | `policy.deny: [delete_repository, force_push]` |
| `filesystem.allowed_paths` | provider `connectionEnv` + `trustTier` |
| `trust.manual_servers` review | provider `trustTier: catalog | manual | internal` |
| `boundary.hermes_is_dev_only` | capability `lifecycle` / `status` gating |

The registry never stores secrets — only the **env var names** a provider needs
(`connectionEnv`), resolved from `~/.hermes/.env` at connect time, exactly as PR #24
specifies.

## Package layout

```
src/schema.ts        Zod schemas + inferred types (CapabilityDefinition, etc.)
src/registry.ts      validate / index / resolveProvider / policy precursor
src/index.ts         public exports
src/registry.test.ts vitest unit tests
examples/registry.example.yaml  instance aligned to the PR #24 stack
```

## API

```ts
import {
  validateCapabilityRegistry,
  buildCapabilityIndex,
  resolveProvider,
  isOperationAllowed,
} from '@cerebro/capability-registry';

const doc = validateCapabilityRegistry(jsonOrYamlParsed); // throws ZodError
const index = buildCapabilityIndex(doc);                 // Map<capabilityId, def>
const resolved = resolveProvider(index.get('source-control')!, 'gitlab');
const decision = isOperationAllowed(resolved.definition, 'read_repo');
```

## Boundaries (keep PR #25 small)

- ✅ Schema (Zod), validation, in-memory indexing, provider resolution.
- ✅ A minimal `matchOperationPattern` / `isOperationAllowed` **precursor** to prove
  the contract; deny-wins-over-allow only.
- ❌ No file/HTTP IO (that is PR #26, the runtime loader).
- ❌ No risk gating / approval flow / scope evaluation (that is PR #27, the policy engine).

## Verification

```bash
pnpm --filter @cerebro/capability-registry typecheck
pnpm --filter @cerebro/capability-registry test
pnpm --filter @cerebro/capability-registry format:check
```
