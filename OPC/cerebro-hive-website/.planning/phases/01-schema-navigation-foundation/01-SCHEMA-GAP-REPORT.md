# Phase 1 Schema Gap Report

Model-by-model exists/stub/absent verdict for Governance, Talent OS and Explore, produced by Plan 01-03 (SCHM-01, SCHM-02). This is the artifact Phase 5, Phase 6 and Phase 7 planners read instead of re-discovering schema state from scratch.

## 1. Governance — `Policy`

**Verdict: `stub -> CLOSED this phase`**

`Policy` was a bare 3-field stub (`id`, `name`, `rules`) with no tenant scoping and no audit trail. This plan extended it in place:

- `orgId String` (plain String, no `@db.Uuid`) + `organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)` — follows the Organization tenant-root pattern per D-16, matching `OrgMembership.orgId`'s style, NOT the `Workspace`/`Tenant` `@db.Uuid` pattern used by `Agent.workspaceId`
- `description String?`
- `isActive Boolean @default(true)`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `@@index([orgId])`
- Back-relation `policies Policy[]` added to `Organization`

Migration: `20260810115849_policy_org_scoping`, applied to the live local database (verified via `prisma migrate status` and a direct `information_schema.columns` query against `Policy`, not just `prisma validate`). Pre-migration row count was 0, so the required, no-default `orgId` and `updatedAt` columns applied cleanly with no expand-backfill-contract sequencing needed.

**No Governance CRUD, service, controller, or UI was built in this task.** Per D-10, that is Phase 5's scope. This plan only makes the schema real.

## 2. Talent OS — zero backing models (ABSENT, confirmed)

Verdict for all four: **`ABSENT`**. Evidence: `grep -n "^model <Name> " packages/db/prisma/schema.prisma` returned no match for each.

| Model | Verdict | Evidence |
|-------|---------|----------|
| `Candidate` | ABSENT | `grep -n "^model Candidate " packages/db/prisma/schema.prisma` → no match |
| `Assessment` | ABSENT | `grep -n "^model Assessment " packages/db/prisma/schema.prisma` → no match |
| `HiringPipeline` | ABSENT | `grep -n "^model HiringPipeline " packages/db/prisma/schema.prisma` → no match |
| `Question` | ABSENT | `grep -n "^model Question " packages/db/prisma/schema.prisma` → no match |

Per D-11, schema **design** for these models happens in Phase 6, not this plan. This report only confirms the absence so Phase 6 does not have to re-derive it.

**Carried-forward constraints for the Phase 6 planner** (do not rediscover these — they are locked requirements, not suggestions):
- **TALN-01:** All four models must be tenant-scoped and audited from day one — i.e., designed with the same `orgId`/`createdAt`/`updatedAt` discipline this plan just applied to `Policy`, not bolted on later.
- **TALN-07:** Scoring signals must not use protected-class-adjacent fields. This is a hard prohibition on the `Assessment`/`Question` scoring design, not a nice-to-have.

## 3. Explore — zero backing models (ABSENT, confirmed)

Verdict for all three: **`ABSENT`**. Evidence: `grep -n "^model <Name> " packages/db/prisma/schema.prisma` returned no match for each.

| Model | Verdict | Evidence |
|-------|---------|----------|
| `Template` | ABSENT | `grep -n "^model Template " packages/db/prisma/schema.prisma` → no match |
| `MarketplaceItem` | ABSENT | `grep -n "^model MarketplaceItem " packages/db/prisma/schema.prisma` → no match |
| `IndustryPack` | ABSENT | `grep -n "^model IndustryPack " packages/db/prisma/schema.prisma` → no match |

Per D-11, schema design happens in Phase 7, not this plan.

**Carried-forward constraint for the Phase 7 planner:** EXPL-03 requires Industry Packs to be modeled as a **taxonomy over the catalog** (e.g. a category/tag structure applied to `Template`/`MarketplaceItem` rows), not as a separate first-class entity with its own duplicated catalog data.

## 4. BullMQ version state (SCHM-02, D-12)

| Package | Before | After | Status |
|---------|--------|-------|--------|
| `services/archive-api` | `^6.0.8` | `^6.0.8` | unchanged (already the target) |
| `services/archive-worker` | `^5.0.0` | `^6.0.8` | **bumped this plan** |
| `apps/studio` (`pm-agent-queue` consumer) | `^5.80.9` | `^5.80.9` | **deliberately unchanged** |
| `apps/studio/platform` (`audit-queue` consumer) | `^5.80.9` | `^5.80.9` | **deliberately unchanged** |

**Scope decision:** SCHM-02's requirement names only `archive-api` and `archive-worker` as the pair that must share a major version for the Phase 4 Knowledge Hub producer/consumer wiring. `apps/studio` and `apps/studio/platform` pin BullMQ for `pm-agent-queue` and `audit-queue` respectively — different queue names, different consumers (`apps/studio/lib/queue/client.ts` and `worker.ts`), and no producer/consumer relationship with archive ingestion. Bumping them was out of scope for this requirement and would have pulled an unrelated major-version migration into this plan. They are left on v5 deliberately, not by oversight.

`archive-worker` has no `src/` directory and no existing BullMQ consumer code, so there was no v5→v6 code migration to perform — the bump is a manifest + lockfile change only. Its `build` script (`tsc`) fails with "no inputs were found" for this reason and is correctly excluded from this plan's verification commands.

Verification: `pnpm-lock.yaml` resolves `bullmq` for both `services/archive-api` and `services/archive-worker` to `bullmq@6.0.8`. The major-version comparison script printed `BULLMQ-MAJOR-MATCH ^6.0.8 ^6.0.8` and exited 0.

## 5. Carry-forward warning for Phase 4 (Knowledge Hub)

BullMQ v6.0.0 (released 2026-07-30) is a breaking major release. It removed:

- `Queue#client`
- `Worker#blockingClient`
- `Queue#redisVersion`
- `Queue#databaseType`
- `FlowProducer#client`

It also changed `Worker#waitUntilReady()` to resolve `void` instead of the underlying Redis client. Any code that previously read the Redis client instance off a `Queue`/`Worker`/`FlowProducer` object, or awaited `waitUntilReady()` expecting a client back, must be rewritten against the pluggable `IQueueBackend` abstraction instead.

`archive-api`'s only BullMQ consumer (`services/archive-api/src/services/queue.service.ts`) was checked and uses none of these removed APIs — the existing v6 pin there is safe. `archive-worker`'s consumer does not exist yet (no `src/` directory); when the Phase 4 planner designs it, it must be written against v6 conventions from the start — there is no legacy v5 code to migrate away from, only a v6-native implementation to write.

## 6. Tenant-scoping convention note

The schema has two parallel tenant-root conventions that do not interoperate:

- **`Tenant -> Workspace -> Agent/Workflow/Project`**: FKs are `@db.Uuid` typed (e.g. `Agent.workspaceId String @db.Uuid`)
- **`Organization -> OrgMembership/Invitation/AIUsageRecord/Subscription/Invoice/UsageBudget/Prompt/Policy`**: FKs are plain `String` with a prefixed generated value (e.g. `Organization.id` defaults to `'org_' || ...`), matching `OrgMembership.orgId String` (no `@db.Uuid`)

`Policy` was extended to follow the **Organization** convention per D-16, matching GOVN-01's "scoped per organization" wording. Future models must pick one convention deliberately and match its FK typing exactly — do not mix `@db.Uuid` FKs with the Organization root or vice versa.

`Metric`, `Alert` and `Incident` are themselves bare stubs with **no** tenant scoping at all. They are not a precedent to copy for any future model — they represent unfinished work in the Observability domain, not a design decision.
