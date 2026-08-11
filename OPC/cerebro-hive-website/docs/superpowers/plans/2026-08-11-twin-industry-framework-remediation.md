# Twin Industry Framework Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make industry-model approval durable, immutable, validated, route-bound, and authorized before PR #34 is merged.

**Architecture:** Keep industry generation in the Twin Studio application module. Persist preview proposals separately from immutable `TwinVersion` snapshots, and publish a version plus the twin's active pointer in one Prisma transaction. Resolve request identity through verified JWT claims and database membership/workspace checks behind an injectable request-context port.

**Tech Stack:** Next.js 15 route handlers, TypeScript, Zod, Prisma 7/PostgreSQL, `@cerebro/auth`, Node test runner through `tsx`.

## Global Constraints

- Do not merge PR #34 during remediation.
- Do not move industry vocabulary or provider logic into runtime core.
- Preview may persist proposal metadata but must not create or activate a `TwinVersion`.
- Approval must create exactly one immutable snapshot and activate it transactionally.
- Tenant identity must come from a verified token; caller-supplied tenant headers are ignored.
- Workspace selection must be checked against tenant ownership and user membership.
- Tests must enter the normal `test` and `verify` paths.

---

### Task 1: Persistence and immutability contract

**Files:**
- Create: `apps/twin-studio/tests/version-proposal-service.test.ts`
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260811110000_twin_version_proposals/migration.sql`
- Modify: `packages/db/src/twin-studio/twin-repository.ts`
- Modify: `apps/twin-studio/modules/twin-definition/version-proposal-service.ts`

**Interfaces:**
- Produces: `TwinVersionStore.createProposal`, `TwinVersionStore.applyProposal`, and `TwinVersionStore.listVersions`.
- `applyProposal(scope, twinId, proposalId)` returns the persisted version DTO and is idempotent by proposal ID.

- [ ] Write tests proving preview creates no version, approval creates one version, the active pointer changes only after approval, service recreation observes persisted state, cross-twin apply fails, and post-approval caller mutation cannot alter the stored definition.
- [ ] Run `pnpm --filter @cerebro/twin-studio test` and confirm failures are caused by the current process-local implementation.
- [ ] Add `TwinVersionProposal` with scope, model snapshot, status, timestamps, and optional applied-version relation; add matching SQL migration.
- [ ] Extend the repository/client port so proposal creation and approval use transactions, unique version allocation, and defensive serialized snapshots.
- [ ] Replace module-level maps with an injected persistence service and a Prisma-backed application adapter.
- [ ] Re-run the focused tests until green.

### Task 2: Runtime command validation and resource binding

**Files:**
- Modify: `packages/twin-contracts/src/industry-model.ts`
- Modify: `packages/twin-contracts/src/index.ts`
- Create: `apps/twin-studio/tests/version-route-contract.test.ts`
- Modify: `apps/twin-studio/app/api/twins/[twinId]/versions/route.ts`

**Interfaces:**
- Produces: discriminated `CreateVersionProposalCommandSchema` and `ApplyVersionProposalCommandSchema`.
- APPLY always calls `applyVersionProposal(scope, routeTwinId, proposalId)`.

- [ ] Write tests for malformed JSON, malformed models, unknown actions, missing approval, and cross-twin application.
- [ ] Run the tests and confirm each expected validation/resource-binding failure.
- [ ] Parse JSON inside the route error boundary and validate commands with Zod.
- [ ] Reject unknown actions and bind APPLY to the URL `twinId` at both route and service boundaries.
- [ ] Re-run tests until green.

### Task 3: Authenticated tenant/workspace context

**Files:**
- Create: `apps/twin-studio/lib/authenticated-request-context.ts`
- Create: `apps/twin-studio/tests/authenticated-request-context.test.ts`
- Modify: `apps/twin-studio/app/api/twins/[twinId]/versions/route.ts`
- Modify: `apps/twin-studio/app/api/industry-models/generate/route.ts`
- Modify: `apps/twin-studio/package.json`

**Interfaces:**
- Produces: `resolveAuthenticatedScope(request, permission)` returning `{ tenantId, workspaceId, userId }`.
- Dependencies are injectable: token verifier and membership/workspace authorizer.

- [ ] Write tests proving missing/invalid credentials fail, `x-tenant-id` cannot override verified `org_id`, non-members fail, cross-tenant workspaces fail, viewers cannot write, and authorized developers can generate/apply.
- [ ] Run tests and verify red failures against the header-trusting implementation.
- [ ] Read bearer token or `access_token` cookie, verify with `@cerebro/auth/server`, derive tenant from `org_id`, and authorize membership plus workspace ownership via Prisma.
- [ ] Require read/write authorization consistently on generation and version routes.
- [ ] Re-run tests until green.

### Task 4: Standard verification integration

**Files:**
- Modify: `apps/twin-studio/package.json`
- Modify: `apps/twin-studio/scripts/verify-industry.ts`

**Interfaces:**
- Produces: package `test` command used by Turbo and package `verify` command covering baseline plus industry checks.

- [ ] Add `test: tsx --test tests/*.test.ts`.
- [ ] Make `verify` run tests, `scripts/verify.ts`, and `scripts/verify-industry.ts`.
- [ ] Run package test, verify, typecheck, Prisma validate/generate, and production build.

### Task 5: Aggregate CI repair and re-review

**Files:**
- Modify only the workflow/docs/package files proven by current failed job logs.

**Interfaces:**
- Produces: green required checks without weakening gates.

- [ ] Fix forge-api dependency build ordering/resolution without suppressing TypeScript errors.
- [ ] Replace local absolute documentation links with repository-relative links.
- [ ] Pin valid third-party action references and ensure Semgrep emits SARIF before upload.
- [ ] Correct security-gate working directories.
- [ ] Run corresponding local checks, commit atomic changes, push `codex/twin-industry-framework`, and request re-review of PR #34.
- [ ] Do not merge until all four invariants and required GitHub checks pass.
