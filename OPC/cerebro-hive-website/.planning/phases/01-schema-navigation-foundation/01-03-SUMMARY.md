---
phase: 01-schema-navigation-foundation
plan: 03
subsystem: database
tags: [prisma, postgres, bullmq, schema-migration, governance, talent-os, explore]

# Dependency graph
requires:
  - phase: 01-schema-navigation-foundation (plan 01/02)
    provides: nav-honesty infrastructure and Studio destination audit this plan does not touch
provides:
  - Organization-scoped, audited Policy model (schema.prisma + applied migration)
  - archive-worker reconciled to BullMQ v6, matching archive-api
  - 01-SCHEMA-GAP-REPORT.md — written model-by-model verdict for Governance/Talent OS/Explore
affects: [phase-4-knowledge-hub, phase-5-governance, phase-6-talent-os, phase-7-explore]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Organization tenant-scoping convention (plain String FK, no @db.Uuid) applied to a second model (Policy) beyond OrgMembership/Invitation/etc, per D-16"

key-files:
  created:
    - packages/db/prisma/migrations/20260810115849_policy_org_scoping/migration.sql
    - .planning/phases/01-schema-navigation-foundation/01-SCHEMA-GAP-REPORT.md
  modified:
    - packages/db/prisma/schema.prisma
    - services/archive-worker/package.json
    - pnpm-lock.yaml

key-decisions:
  - "Policy extended to follow the Organization tenant-root pattern (plain String orgId, no @db.Uuid), not the Tenant/Workspace @db.Uuid pattern, per locked decision D-16"
  - "apps/studio and apps/studio/platform bullmq pins (^5.80.9) deliberately left unbumped — different queue consumers, out of SCHM-02's archive-api/archive-worker scope"
  - "Talent OS and Explore schema design deferred to Phase 6/7 per D-11; this plan only confirms and documents absence"

patterns-established:
  - "Pattern: schema-gap verdict report (CLOSED/ABSENT per model, with grep evidence) as a planning artifact future-phase planners read instead of re-deriving schema state"

requirements-completed: [SCHM-01, SCHM-02]

# Metrics
duration: 66min
completed: 2026-08-10
---

# Phase 1 Plan 3: Policy Schema Extension, BullMQ Reconciliation, Schema-Gap Report Summary

**Policy extended to an organization-scoped, audited model with a migration applied to the live local Postgres DB; archive-worker bumped to BullMQ v6.0.8 to match archive-api; written model-by-model schema-gap verdict produced for Governance/Talent OS/Explore.**

## Performance

- **Duration:** 66 min
- **Started:** 2026-08-10T11:56:53Z
- **Completed:** 2026-08-10T13:02:37Z
- **Tasks:** 3 completed
- **Files modified:** 5 (schema.prisma, migration.sql, archive-worker/package.json, pnpm-lock.yaml, 01-SCHEMA-GAP-REPORT.md)

## Accomplishments
- `Policy` model extended with `orgId`, `organization` relation (onDelete: Cascade), `description`, `isActive`, `createdAt`, `updatedAt`, `@@index([orgId])`, and the required `Organization.policies` back-relation — following the Organization convention (D-16), not Workspace/UUID
- Migration `20260810115849_policy_org_scoping` generated via `prisma migrate dev` (not `db push`) and confirmed applied against the live local database via a direct `information_schema.columns` query, not just `prisma validate`
- `services/archive-worker`'s BullMQ pin bumped from `^5.0.0` to `^6.0.8`, exactly matching `services/archive-api`; lockfile confirmed resolving both to `bullmq@6.0.8`
- `.planning/phases/01-schema-navigation-foundation/01-SCHEMA-GAP-REPORT.md` written with a CLOSED/ABSENT verdict for all 8 required model names, BullMQ v6 removed-API carry-forward warning for Phase 4, and TALN-01/TALN-07/EXPL-03 constraints carried forward for Phase 6/7 planners

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend the Policy model to be organization-scoped and audited** - `a31740f` (feat)
2. **Task 2: [BLOCKING] Generate, apply and commit the Policy migration** - `2e876b3` (feat)
3. **Task 3: Reconcile BullMQ versions and write the schema-gap report** - `2e36d32` (feat)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `packages/db/prisma/schema.prisma` - Policy model extended with org scoping + audit fields; Organization.policies back-relation added
- `packages/db/prisma/migrations/20260810115849_policy_org_scoping/migration.sql` - Additive migration: ADD COLUMN orgId/description/isActive/createdAt/updatedAt, CREATE INDEX Policy_orgId_idx, ADD FOREIGN KEY Policy_orgId_fkey
- `services/archive-worker/package.json` - bullmq `^5.0.0` -> `^6.0.8`
- `pnpm-lock.yaml` - bullmq resolution updated for archive-worker; also catches up lockfile to already-committed archive-api Fastify plugin version bumps
- `.planning/phases/01-schema-navigation-foundation/01-SCHEMA-GAP-REPORT.md` - model-by-model schema-gap verdict for Governance/Talent OS/Explore

## Pre-migration Policy row count

**0 rows.** Verified via a direct `pg` client query (`SELECT count(*) FROM "Policy"`) against the live local database before running `prisma migrate dev`, per the plan's requirement that the migration is only safe at zero rows since `orgId` and `updatedAt` are required columns with no default. Zero rows meant the straightforward additive migration was safe without an expand-backfill-contract sequence.

## Migration confirmation

- Migration directory: `20260810115849_policy_org_scoping`
- `--accept-data-loss` was never used in any command this task
- `migration.sql` contains zero occurrences of `DROP TABLE` and zero occurrences of `DROP COLUMN`
- `prisma migrate status` reports "Database schema is up to date!" (12 migrations found)
- Live table columns verified directly via `information_schema.columns` query showing `orgId` (text, NOT NULL), `description` (text, nullable), `isActive` (boolean, NOT NULL), `createdAt`/`updatedAt` (timestamp, NOT NULL) all present on `Policy`
- `pnpm --filter @cerebro/db typecheck` (via `tsc -p tsconfig.json --noEmit`) exits clean

## Decisions Made
- `Policy.orgId` implemented as plain `String` with no `@db.Uuid`, matching `OrgMembership.orgId`'s style exactly, per D-16's lock — confirmed zero occurrences of `workspaceId`/`Workspace` in the extended model
- `apps/studio` and `apps/studio/platform`'s BullMQ v5 pins (`^5.80.9`) deliberately left unchanged — different queue consumers (`pm-agent-queue`, `audit-queue`), no producer/consumer relationship with archive ingestion, and out of SCHM-02's explicit archive-api/archive-worker scope. Documented as a deliberate boundary in the gap report, not an oversight.
- Talent OS (`Candidate`, `Assessment`, `HiringPipeline`, `Question`) and Explore (`Template`, `MarketplaceItem`, `IndustryPack`) schema design intentionally NOT started this plan — only confirmed ABSENT via grep, per D-11. Design is Phase 6/7's job.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Applied pre-existing, already-approved schema drift on unrelated columns during migration**
- **Found during:** Task 2 (`prisma migrate dev --name policy_org_scoping`)
- **Issue:** `prisma migrate dev` detected the live database was also out of sync with two unrelated, already-committed `schema.prisma` defaults — `KnowledgeDocument.id` and `Organization.id` `dbgenerated(...)` prefixed-ID defaults were present in `schema.prisma` (committed by an earlier session) but had never been applied to the live DB as a `DEFAULT` clause on those columns.
- **Fix:** Allowed Prisma to include the two `ALTER TABLE ... ALTER COLUMN "id" SET DEFAULT (...)` statements in the same migration, since they are purely additive (setting a generation default, not altering existing data or types) and blocking the migration to split them out would have left the DB further out of sync with an already-committed schema for no benefit.
- **Files modified:** `packages/db/prisma/migrations/20260810115849_policy_org_scoping/migration.sql` (2 extra `ALTER TABLE ... ALTER COLUMN` lines beyond the Policy-specific changes)
- **Verification:** `prisma migrate status` reports up to date; direct DB query confirms no data was altered, only column defaults set
- **Committed in:** `2e876b3` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — pre-existing drift catch-up, non-destructive)
**Impact on plan:** No scope creep — the two extra statements are additive DEFAULT clauses on already-committed schema, not new design decisions. Documented in the Task 2 commit message.

## Issues Encountered
- `prisma db execute --file` does not print SELECT query results (only reports "Script executed successfully"), so the pre-migration row-count check was performed with a direct `pg` client query instead — documented in the migration confirmation section above.
- `prisma db execute` initially failed with "datasource.url property is required" when invoked via `pnpm --filter @cerebro/db exec` because `DATABASE_URL` wasn't inherited into that exec context; resolved by invoking `npx prisma` directly from `packages/db` with `DATABASE_URL` set explicitly on the command, matching `prisma.config.ts`'s `process.env.DATABASE_URL` read.
- The monorepo's actual pnpm workspace root is `OPC/cerebro-hive-website` (which has `package.json`/`pnpm-workspace.yaml`), one level below the git repository root (`{OPC_cerebro_hive}`, which has no `package.json`). `pnpm install` was run from the workspace root, not the git top-level, per the pre-existing project convention noted in STATE.md.

## User Setup Required

None - no external service configuration required. This plan only touched the local dev database (connection string already configured in `packages/db/.env`) and a package manifest version bump.

## Next Phase Readiness
- Phase 5 (Governance) can now design Policy CRUD against a real, org-scoped, audited schema without first doing schema discovery — `Policy.orgId` is required, indexed, and cascades on Organization delete
- Phase 4 (Knowledge Hub) can wire an archive-api producer to an archive-worker consumer on one BullMQ major version (v6.0.8); the Phase 4 planner must design `archive-worker`'s consumer against v6-native APIs from the start (no legacy v5 code exists to migrate)
- Phase 6 (Talent OS) and Phase 7 (Explore) planners have `.planning/phases/01-schema-navigation-foundation/01-SCHEMA-GAP-REPORT.md` as a written starting point instead of an assumption, including carried-forward TALN-01/TALN-07/EXPL-03 constraints
- No blockers identified for downstream phases from this plan's work

## Self-Check: PASSED

- FOUND: packages/db/prisma/migrations/20260810115849_policy_org_scoping/migration.sql
- FOUND: .planning/phases/01-schema-navigation-foundation/01-SCHEMA-GAP-REPORT.md
- FOUND: .planning/phases/01-schema-navigation-foundation/01-03-SUMMARY.md
- FOUND commit: a31740f (Task 1)
- FOUND commit: 2e876b3 (Task 2)
- FOUND commit: 2e36d32 (Task 3)
- FOUND commit: 5b48d0c (docs: summary)

---
*Phase: 01-schema-navigation-foundation*
*Completed: 2026-08-10*
