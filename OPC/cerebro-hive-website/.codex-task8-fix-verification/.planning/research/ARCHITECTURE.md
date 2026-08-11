# Architecture Research

**Domain:** Integrating a BullMQ ingestion worker + wiring ~60 unbacked Next.js pages into an existing DDD/microservice monorepo (CerebroHive Studio)
**Researched:** 2026-08-09
**Confidence:** HIGH (all findings grounded in direct inspection of the live repo, not training data or generic BullMQ/Next.js ecosystem advice)

> **Correction to `.planning/codebase/ARCHITECTURE.md` / `STRUCTURE.md`:** those files (dated 2026-08-04) describe `packages/database`, `apps/forge`, `apps/forge-api`-as-Fastify, and a pure DDD/CQRS platform-api-centric world. The **live repo does not match that** in several load-bearing ways:
> - The Prisma package is `packages/db` (not `packages/database`). `packages/database` does not exist on disk.
> - `forge-api` (NestJS), `archive-api` (Fastify), and `archive-worker` (BullMQ, stub) live under **`services/`**, not `apps/`. `apps/` contains `studio`, `platform-api`, `forge`, `platform`, `pulse`, `sphere`, plus portal apps — `forge-api`/`archive-api` are *not* there.
> - There are 30+ other `services/*` (agent-runner, workflow-api, knowledge-api, temporal-worker, etc.) and 60+ other `packages/*` not mentioned in the prior codebase docs at all — this is a much larger monorepo than that pass captured.
> - `apps/platform-api` (Fastify, DDD/CQRS, `packages/domain`, `packages/core-bus`) genuinely exists as described and is real — that part of the prior docs is accurate.
>
> Treat this file as the authoritative integration map for the archive pipeline + studio wiring; treat `.planning/codebase/*` as accurate only for the `platform-api` DDD/CQRS layer.

## Standard Architecture

### System Overview (current state, verified on disk)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  apps/studio  (Next.js App Router)                                       │
│   - app/(platform)/archive/**        Knowledge Hub UI (currently DUMMY)  │
│   - app/actions/archive.ts           'use server' fetch → archive-api    │
│   - lib/prisma.ts + @cerebro/db      direct-Prisma path (Talent/HiveForge)│
│   - lib/talent/services/*Service.ts  direct-Prisma service classes       │
│   - app/api/v1/**/route.ts           Route Handlers (some still mocked)  │
└───────────┬───────────────────────────────────────┬─────────────────────┘
            │ fetch() 'use server'                   │ import { prisma } from '@cerebro/db'
            ▼                                        ▼
┌───────────────────────────┐          ┌─────────────────────────────────┐
│ services/archive-api       │          │  packages/db  (Prisma 7 +        │
│ (Fastify, port 3405)       │◄─────────┤  @prisma/adapter-pg singleton)   │
│  - POST /uploads           │  (NOT    │  ArchiveDocument/Version/Chunk/  │
│    presigns S3 URL,        │  yet     │  Entity/Tag/ProcessingRun/Event  │
│    ⚠ does NOT persist to DB │  wired) │  Tenant/Workspace/Organization/  │
│    ⚠ does NOT enqueue job   │          │  Project/Agent*/Workflow*/...   │
│  - queue.service.ts         │          └───────────┬───────────────────┘
│    getIngestionQueue()      │                      │ same Postgres, read
│    (BullMQ Queue,           │                      │ directly by studio's
│    'archive-ingestion',     │                      │ direct-Prisma path
│    ⚠ never called)          │                      │
└──────────────┬──────────────┘                      │
               │ enqueue (Redis, BullMQ)              │
               ▼                                      │
┌───────────────────────────┐                        │
│ services/archive-worker    │────────────────────────┘
│ (BullMQ Worker — STUB:     │  writes ArchiveDocumentVersion.processingStatus,
│  package.json + tsconfig   │  ArchiveProcessingRun/Event rows, chunks,
│  only, no src/ yet)        │  entities, tags via @cerebro/db as it runs
│  Consumes 'archive-ingestion'
│  DOWNLOAD→EXTRACT→CHUNK→   │
│  EMBED→ENTITIES→TAGS→      │
│  COMPLETE                  │
└──────────────┬──────────────┘
               │ calls external providers
               ▼
   Gemini (embeddings) · Claude (entities/tags) · Qdrant (vectors) · S3/MinIO (blobs)

┌─────────────────────────────────────────────────────────────────────────┐
│ services/forge-api (NestJS, port ~3400) — agent orchestration/codegen    │
│  - src/streaming/events.controller.ts → SSE (`GET /v1/stream/events`)   │
│    over NATS JetStream — the ONE real-time-push precedent in the repo   │
│  - prisma:generate points at packages/db schema (shared DB)             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ apps/platform-api (Fastify, DDD/CQRS) — Agent/Workflow/Runtime/          │
│  Conversations/Executions/Telemetry APIs, consumed via typed             │
│  @cerebro/api-client (e.g. EngineeringReviewClient) from studio          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Legend of what's real vs. stub today (verified by reading source, not assumed):**
- `services/archive-api/src/routes/upload.route.ts` — real Fastify route, but fabricates `doc_<random>` / `ver_1` IDs instead of writing `ArchiveDocument`/`ArchiveDocumentVersion` rows, and never calls `getIngestionQueue().add(...)`. **archive-api has no `@cerebro/db` dependency in its `package.json` at all.**
- `services/archive-worker` — package.json/tsconfig only, **no `src/` directory exists yet**. This is a from-scratch build, not a refactor.
- `apps/studio/app/actions/archive.ts` — real, well-formed server actions (`listDocuments`, `uploadDocument`, `getDashboardStats`, `getRecentDocuments`) that already `fetch()` `archive-api`'s (not-yet-existing) `/archive/documents` REST surface — this is the correct integration seam, just unconnected to any UI yet.
- `apps/studio/app/(platform)/archive/documents/page.tsx` — `"use client"` component with a hardcoded `DUMMY_DOCS` array; **does not call `app/actions/archive.ts` at all**. This is the canonical example of the "dead stub" pattern the milestone must eliminate.
- `apps/studio/lib/queue/{client,worker}.ts` — a **separate, orphaned** in-process BullMQ setup (`pm-agent-queue`, `audit-queue`) living inside the Next.js app itself. This is a different, older pattern and **must not** be extended for archive ingestion — it would run a BullMQ worker inside the Next.js server process, which contradicts having a dedicated `archive-worker` service and won't survive serverless/edge deploys. Treat as legacy/anti-pattern for this milestone.
- `apps/studio/app/api/v1/talent/metrics/route.ts` — Route Handler returning a hardcoded Prometheus text blob (`mockMetrics`) — another concrete example of the fake-data pattern to remove.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `services/archive-api` | REST surface for document upload/list/search; owns presigned-URL issuance and **must** own document/version row creation + job enqueue | Fastify + Zod schemas, `@cerebro/db` (to be added), `bullmq` `Queue` |
| `services/archive-worker` | BullMQ consumer; runs the 7-stage ingestion pipeline, writes all progress/results to Postgres via Prisma, calls Gemini/Claude/Qdrant | `bullmq` `Worker`, `@cerebro/db`, `@cerebro/archive-contracts` for job payload types |
| `packages/archive-contracts` | Shared job-payload + DTO types between archive-api (producer) and archive-worker (consumer) — currently an empty barrel (`export {}`) | Zod schemas + inferred TS types, versioned job payload shape |
| `packages/db` | Single Prisma 7 client (driver-adapter, `PrismaPg`) shared by every service that touches Postgres directly | Singleton pattern (`globalForPrisma`), already the load-bearing DB access point for `apps/studio`'s direct-Prisma path and (via schema, not yet via dependency) `archive-api`/`archive-worker` |
| `apps/studio` (Server Actions layer) | Talks to `archive-api` over HTTP for anything `archive-api` owns; talks to Postgres directly via `@cerebro/db` for domains with no dedicated backend service | `'use server'` functions in `app/actions/*.ts`, or service classes in `lib/*/services/*Service.ts` |
| `apps/studio` (UI layer) | Server Components fetch data (via the above) and pass to `"use client"` presentational components; polling for live status via `@tanstack/react-query` | App Router pages + existing design system components (do not restyle) |

## Recommended Project Structure

```
services/archive-worker/
├── src/
│   ├── worker.ts               # entry point (`tsx watch src/worker.ts` per package.json)
│   ├── config/
│   │   └── env.ts              # zod-validated env (mirror services/archive-api/src/config/env.ts)
│   ├── stages/                 # one file per pipeline stage — mirrors PROJECT.md's staged design
│   │   ├── download.stage.ts
│   │   ├── extract.stage.ts
│   │   ├── chunk.stage.ts
│   │   ├── embed.stage.ts      # Gemini embeddings
│   │   ├── entities.stage.ts   # Claude entity extraction
│   │   ├── tags.stage.ts       # Claude auto-tagging (auto-apply unapproved tags per PROJECT.md)
│   │   └── complete.stage.ts
│   ├── services/
│   │   ├── qdrant.service.ts   # mirror archive-api's own qdrant.service.ts — do not duplicate logic, extract to a shared package if both need it
│   │   ├── progress.service.ts # writes ArchiveProcessingRun/ArchiveProcessingEvent rows
│   │   └── gemini.service.ts / claude.service.ts
│   └── processor.ts            # BullMQ Worker definition, dispatches job → stage pipeline, updates run status on success/failure
├── package.json                 # already exists — add "@cerebro/db": "workspace:*" as a dependency
└── tsconfig.json                # already exists
```

### Structure Rationale

- **Mirrors `services/archive-api/src/`** (`config/`, `services/`, `routes/` → `stages/`) so the two halves of the ingestion pipeline read as siblings, not unrelated codebases — matches the existing convention of feature-grouped directories seen in `platform-api/src/modules/*` and `forge-api/src/*`.
- **`stages/` as discrete files** matches `CONVENTIONS.md`'s "prefer small, focused functions" and the DOWNLOAD→EXTRACT→CHUNK→EMBED→ENTITIES→TAGS→COMPLETE design already drafted in `PROJECT.md` — each stage should be independently testable and independently retryable (BullMQ job `attempts`/`backoff`, already used in the orphaned `apps/studio/lib/queue/client.ts` pattern — reuse that retry config shape, not the in-process worker itself).
- **No HTTP between archive-api and archive-worker.** They communicate exclusively through the BullMQ/Redis queue (`archive-ingestion`) — this is already how `archive-api/src/services/queue.service.ts` is shaped (`getIngestionQueue()`), it just needs to actually be called from `upload.route.ts` and consumed on the worker side. Do not add a REST call from worker back to archive-api for status updates — the worker should write directly to Postgres (it will share `@cerebro/db`), which is both simpler and matches how every other write path in this repo works (direct Prisma from the owning service).

## Architectural Patterns

### Pattern 1: Producer/Consumer split via BullMQ + shared Postgres, not shared HTTP

**What:** `archive-api` enqueues `{ documentId, versionId, storageKey, tenantId }` (typed via `packages/archive-contracts`) onto the `archive-ingestion` BullMQ queue backed by Redis. `archive-worker` consumes, and both sides read/write the *same* Postgres tables (`ArchiveDocument*`, `ArchiveProcessingRun/Event`) via the shared `@cerebro/db` Prisma client — there is no need for the worker to call back into archive-api's HTTP API to report status.

**When to use:** This is the standard pattern already implied by the schema: `ArchiveProcessingRun.status`/`currentStage` and `ArchiveProcessingEvent` (one row per stage transition) exist specifically to be written by the worker and read by anyone (API or UI) polling progress.

**Trade-offs:** Simpler than an event bus (no NATS needed for this v1, even though NATS/JetStream exists elsewhere in the repo for forge-api's SSE stream) — but it does mean `archive-worker` needs its own `DATABASE_URL` and `@cerebro/db` dependency, which it currently lacks.

**Example (target shape, following the existing `queue.service.ts` style):**
```typescript
// services/archive-api/src/routes/upload.route.ts (to be fixed)
const document = await prisma.archiveDocument.create({ data: { tenantId, title: filename, documentType } });
const version = await prisma.archiveDocumentVersion.create({ data: { documentId: document.id, storageKey, originalFilename: filename, mimeType: contentType, byteSize: 0n, checksumSha256: '' } });
await getIngestionQueue().add('ingest-document', { documentId: document.id, versionId: version.id, storageKey, tenantId });
```

### Pattern 2: Two coexisting data-fetching conventions in `apps/studio` — pick per-domain, not globally

**What:** The codebase already has **two established, real (non-mock) patterns** for a Studio page to get real data. New pages must pick the one that matches who owns the domain's data — do not invent a third pattern.

1. **Server Action → `fetch()` a dedicated backend service** (`app/actions/archive.ts` is the reference implementation). Use when a separate deployable service (`archive-api`, `forge-api`, `platform-api`) owns the business logic/validation for that domain. The action reads the `access_token` cookie, sets `Authorization: Bearer`, and returns a `{ data?, error? }` envelope — every new action should follow that exact shape so error states render consistently.
2. **Direct Prisma via `@cerebro/db`**, either through the shared singleton `lib/prisma.ts` or a dedicated service class in `lib/<domain>/services/*Service.ts` (reference implementations: `lib/talent/services/AssessmentService.ts`, `app/platform/hiveforge/core/repositories/*Repository.ts`). Use when the domain has **no dedicated backend service** — the Prisma schema is the only "backend," and Studio's own Server Components/Server Actions/Route Handlers are the sole data-access layer.

**When to use which, applied to this milestone's pillars:**
- **Core Workspace** (Organizations/Projects/Teams) — Prisma models (`Organization`, `Project`, `Tenant`, `Workspace`, `TenantMember`) exist with no dedicated microservice fronting them → **Pattern 2** (direct Prisma service classes), following the `AssessmentService.ts` shape.
- **Core AI / Knowledge Hub** — owned by `archive-api`/`archive-worker` → **Pattern 1**, and the wiring work is "connect existing `app/actions/archive.ts` to the real UI + finish `archive-api`'s DB/queue wiring," not "write new server actions."
- **Core AI / AI Studio, Workflows** — owned by `forge-api` (NestJS) and/or `apps/platform-api` → **Pattern 1**, but there's no typed client for `forge-api` yet (unlike `platform-api`'s `EngineeringReviewClient`). Decide per-phase whether to hand-roll `fetch()` (matches `archive.ts` today) or invest in a typed client package (matches `platform-api`'s more mature convention) — flag for phase-specific research.
- **Governance, Talent OS, Explore** — check per-feature whether a `services/*-api` exists (there are many: `governance-api`, `knowledge-api`, `evaluation-api`, etc.) before defaulting to Pattern 2; several of these pillars may already have a real backend service that hasn't been wired in yet, which would make Pattern 1 (fetch to that service) the correct choice instead of direct Prisma.

**Trade-offs:** Pattern 2 is faster to ship (no second service to stand up/deploy) but bypasses whatever domain validation a dedicated service would otherwise enforce, and duplicates DB access logic if a service *does* eventually front that domain. Pattern 1 is more work up front (two codebases to touch) but keeps Studio a thin presentation layer, consistent with the platform-api DDD/CQRS boundary already enforced elsewhere.

### Pattern 3: Polling via React Query for ingestion progress, not SSE/WebSockets

**What:** For the Knowledge Hub's "document is uploading → processing → indexed" progress UI, poll a status endpoint (`GET /archive/documents/:id` or `:id/status`, backed by `ArchiveDocumentVersion.processingStatus` + latest `ArchiveProcessingRun`) using `@tanstack/react-query`'s `refetchInterval`, rather than building SSE or WebSocket infrastructure for archive-api.

**When to use:** archive-api/archive-worker have no real-time push infrastructure today (no NATS integration, no SSE controller) — only `forge-api` has that (`events.controller.ts`, backed by NATS JetStream, for agent-execution events). Building SSE for archive-api would mean standing up NATS publishing from the worker plus a new SSE controller in archive-api — real work not currently scoped, and it duplicates infrastructure `forge-api` already owns for a different purpose.

**Trade-offs:** Polling is slightly less "live" (typically 2–5s intervals) but is a same-day build using a dependency (`@tanstack/react-query`, already in `apps/studio/package.json`) that's already present and already used elsewhere in the app. SSE/WebSockets would be a legitimate differentiator for a later milestone (and `forge-api`'s `events.controller.ts` is the pattern to copy if/when that happens — a NATS subject per tenant/document, `Content-Type: text/event-stream`, 20s heartbeat), but is out of scope for "make it functional now."

**Example:**
```typescript
// apps/studio hook, following existing app/actions/archive.ts return shape
const { data } = useQuery({
  queryKey: ['archive-document-status', documentId],
  queryFn: () => getDocumentStatus(documentId), // new server action, same pattern as listDocuments()
  refetchInterval: (query) =>
    query.state.data?.data?.status === 'indexed' || query.state.data?.data?.status === 'failed'
      ? false
      : 3000,
});
```

## Data Flow

### Ingestion Pipeline Flow (target state)

```
Browser: file picker → uploadDocument(formData) [Server Action, app/actions/archive.ts]
    ↓ fetch POST archive-api /uploads (multipart or presign+PUT, TBD in Phase design)
archive-api: creates ArchiveDocument + ArchiveDocumentVersion rows (Prisma) [MISSING TODAY]
    ↓ presigned S3/MinIO PUT URL returned to browser, OR archive-api streams to S3 itself
Browser/archive-api: object lands in S3/MinIO
    ↓ archive-api enqueues BullMQ job on 'archive-ingestion' [MISSING TODAY — queue.service.ts unused]
archive-worker: consumes job → DOWNLOAD (S3) → EXTRACT (text) → CHUNK → EMBED (Gemini) →
                ENTITIES (Claude) → TAGS (Claude, auto-apply) → COMPLETE
    ↓ at each stage: writes ArchiveProcessingEvent row, updates ArchiveProcessingRun.currentStage/status,
      updates ArchiveDocumentVersion.processingStatus, writes ArchiveDocumentChunk /
      ArchiveEntity / ArchiveChunkEntity / ArchiveTag / ArchiveDocumentTag rows, upserts vectors into Qdrant
    ↓ (all via @cerebro/db, same Postgres instance apps/studio and archive-api use)
apps/studio: Server Component renders document list via listDocuments() [already fetches archive-api]
             Client component polls getDocumentStatus(id) via react-query every ~3s until terminal state
```

### Studio Page → Backend Data Flow (general pattern for the ~60 unbacked routes)

```
Request Flow (Pattern 1 — dedicated backend service owns the domain)
[Server Component] → [Server Action 'use server' fetch()] → [service's Fastify/Nest route]
      → [service's own Prisma/business logic] → [Postgres]
[Response] ← [{data,error} envelope] ← [DTO] ← [query result]

Request Flow (Pattern 2 — no dedicated service, Studio owns the query)
[Server Component] → [lib/<domain>/services/*Service.ts] → [@cerebro/db prisma.*.findMany()]
      → [Postgres]
[Response] ← [Prisma model] ← [query result]
```

### Key Data Flows

1. **Document upload → indexed state:** browser → archive-api (create rows + presign) → S3 → archive-api (enqueue) → archive-worker (7 stages, writes progress + results to Postgres/Qdrant) → studio polls via react-query. This is the only flow in this milestone that crosses a message queue.
2. **Studio page render (any pillar):** Server Component decides Pattern 1 vs Pattern 2 per the domain-ownership rule above, fetches on the server, passes plain data down to existing `"use client"` presentational components — **no restyling**, only replacing `DUMMY_*`/hardcoded arrays with real fetched data or an explicit empty state.

## Scaling Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Ingestion throughput | Single `archive-worker` process, default BullMQ concurrency (1–2) is fine | Increase `Worker` `concurrency` option, add a 2nd worker replica sharing the same Redis queue (BullMQ handles fan-out natively) | Split queues per stage (e.g. separate `embed` queue) so slow Gemini/Claude calls don't block cheap DOWNLOAD/EXTRACT stages; this repo already has the naming convention for it (`*-worker` per service, e.g. `eda-execution-worker`, `temporal-worker`) |
| Progress polling load | React Query polling every 3s per open document tab is negligible | Still fine — polling only happens while a tab with an in-progress document is open; terminal states stop refetching | Consider the SSE pattern already proven in `forge-api/events.controller.ts` (NATS-backed) if concurrent in-progress documents per tenant become large |
| Postgres write contention | Non-issue | `ArchiveProcessingEvent` is an append-only audit-style table — fine as-is | Partition/prune old `ArchiveProcessingEvent` rows once ingestion volume is high; not a concern for this milestone |

### Scaling Priorities

1. **First bottleneck:** archive-worker not existing at all (0 → 1). Build order matters more than throughput right now.
2. **Second bottleneck (later milestone, not this one):** Gemini/Claude API rate limits during EMBED/ENTITIES/TAGS stages — BullMQ's built-in `attempts`/`backoff` (already the pattern in the orphaned `apps/studio/lib/queue/client.ts`) is the right tool, just needs applying in `archive-worker`'s job options.

## Anti-Patterns

### Anti-Pattern 1: Extending the in-Next.js BullMQ worker (`apps/studio/lib/queue/*`)

**What people might do:** See `apps/studio/lib/queue/worker.ts` already exists with a working `Worker` pattern and be tempted to add an `archive-ingestion` consumer there since it's "already wired."

**Why it's wrong:** That worker runs inside the Next.js process. It's already a legacy/orphaned pattern for a different feature (`pm-agent-queue`/`audit-queue`) and mixing a long-running CPU/IO-heavy ingestion pipeline into the web server process contradicts having a dedicated `services/archive-worker`, breaks horizontal scaling of the web tier independently from ingestion capacity, and won't survive a serverless/edge Next.js deployment target.

**Do this instead:** Build out `services/archive-worker/src/` as its own process, per Recommended Project Structure above.

### Anti-Pattern 2: Route Handlers / Server Actions returning hardcoded data disguised as real endpoints

**What people might do:** `apps/studio/app/api/v1/talent/metrics/route.ts` already ships a `mockMetrics` string labeled as if it were a real Prometheus registry. It's easy to replicate this shape ("looks like a real endpoint, returns a constant") for other unbacked routes to make them "pass" quickly.

**Why it's wrong:** Violates this milestone's explicit Core Value ("never a fake number... never a blank stub") and is exactly the debt this program exists to remove.

**Do this instead:** Every route/action either queries real data (Pattern 1 or 2 above) or renders an explicit, honestly-labeled empty state (e.g., "No metrics recorded yet") — never a plausible-looking constant.

### Anti-Pattern 3: Worker reporting status back over HTTP instead of shared Postgres

**What people might do:** Have `archive-worker` `POST` status updates back to `archive-api` over HTTP, treating them as separate systems that must talk via REST.

**Why it's wrong:** Adds a network hop and a new internal API surface for something Postgres already models (`ArchiveProcessingRun`/`ArchiveProcessingEvent`) and that every other service in this repo accesses directly via the shared `@cerebro/db` singleton.

**Do this instead:** Give `archive-worker` its own `@cerebro/db` dependency and `DATABASE_URL`, write progress directly to Postgres, and let `archive-api` (and Studio, if using Pattern 2) simply read the same rows.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Redis (BullMQ) | `archive-api` produces via `getIngestionQueue()`, `archive-worker` consumes via `bullmq` `Worker` on the same queue name (`'archive-ingestion'`) | `archive-api` uses `bullmq@^6`, `archive-worker` uses `bullmq@^5` — version mismatch should be reconciled before wiring (BullMQ requires matching major versions across producer/consumer for job schema compatibility) |
| PostgreSQL | Every service that needs it depends on `@cerebro/db` (workspace package) and constructs the `PrismaPg` driver adapter + `DATABASE_URL` — `archive-api` and `archive-worker` currently lack this dependency and must add it | Follow `apps/studio/lib/prisma.ts` / `packages/db/index.ts`'s singleton-with-global-caching pattern exactly |
| S3/MinIO | `archive-api/src/services/storage.service.ts` already implements presigned PUT/GET via `@aws-sdk/client-s3`, `forcePathStyle: true` for MinIO compatibility | `archive-worker`'s DOWNLOAD stage should reuse the same env vars (`S3_ENDPOINT`, `S3_BUCKET`, etc.) already defined in `archive-api/src/config/env.ts` — worth extracting a shared storage client into a package if both services need GET, to avoid duplicating the S3 client setup |
| Qdrant | `archive-api/src/services/qdrant.service.ts` already exists (used for search) | `archive-worker`'s EMBED stage needs write access to the same collection — decide whether `archive-worker` gets its own Qdrant client or a shared `packages/*` client is extracted |
| Gemini (embeddings) | Not yet integrated anywhere in `archive-api`/`archive-worker` source — only `GEMINI_API_KEY` exists in `archive-api/src/config/env.ts`'s env schema | New integration for `archive-worker`'s EMBED stage per `PROJECT.md`'s design |
| Claude (entities/tags) | Not yet integrated in archive services — `packages/ai-gateway` (used by `platform-api`) already has an Anthropic provider that could potentially be reused instead of a bespoke client | Worth checking during implementation whether `@cerebro/ai-gateway` or `services/forge-api`'s `ai.provider.ts` can be reused for archive-worker's Claude calls, rather than a third bespoke Anthropic client in the repo |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `apps/studio` ↔ `archive-api` | HTTP via `'use server'` fetch (`app/actions/archive.ts`) | Already correctly shaped; needs archive-api's DB/queue wiring finished and the UI page connected to it |
| `archive-api` ↔ `archive-worker` | Redis/BullMQ only, no HTTP | Reconcile `bullmq` version between the two `package.json`s first |
| `archive-worker`/`archive-api` ↔ Postgres | Direct Prisma via `@cerebro/db`, not yet a dependency of either | Add `"@cerebro/db": "workspace:*"` to both `package.json`s |
| `apps/studio` ↔ `apps/platform-api` | Typed client (`@cerebro/api-client`'s `EngineeringReviewClient`) for at least one module; other `platform-api` modules likely still accessed via raw fetch or not yet wired | Check per-module during roadmap phases whether a typed client exists before hand-rolling fetch calls |
| `apps/studio` ↔ Postgres (direct) | `lib/prisma.ts` singleton + domain service classes (Talent OS, HiveForge) | This is the fallback for any Core Workspace/Governance/Explore domain with no dedicated backend service |

## Build Order Implications

1. **Core Workspace primitives first (Organizations/Projects/Teams/Workspace CRUD via Pattern 2).** `ArchiveDocument.tenantId` and every other domain-scoped model requires a real `Tenant`/`Workspace`/`Organization` to attach to. Building Knowledge Hub, Talent OS, or Governance pages against a workspace concept that itself returns dummy data produces pages that are "real" in isolation but meaningless in context (a document list scoped to a fake workspace ID). This matches the phase ordering already logged as a Key Decision in `PROJECT.md` ("nav → workspace → AI/knowledge → governance → talent → explore → cleanup → verification").
2. **archive-worker + archive-api DB/queue wiring must land together, before the Knowledge Hub UI phase.** The UI's server actions (`app/actions/archive.ts`) already exist and are correctly shaped — they're waiting on a real backend, not the other way around. Sequence: (a) add `@cerebro/db` to both services, wire real row creation + queue enqueue in `archive-api`, (b) build `archive-worker/src/` from scratch, (c) only then wire the `(platform)/archive/documents/page.tsx` UI to `listDocuments()`/`getDashboardStats()` instead of `DUMMY_DOCS`.
3. **BullMQ version mismatch (`archive-api` v6 vs `archive-worker` v5) should be resolved as a small first step**, not discovered mid-implementation — pin both to the same major version before writing job producer/consumer code.
4. **Per-pillar, check for an existing `services/*-api` before defaulting to direct Prisma.** Given the number of stub/partial services already in `services/` (governance-api, evaluation-api, knowledge-api, etc.), a later research or design pass per phase should confirm whether Governance/Talent OS/Explore pillars have a dedicated backend already scaffolded before committing to Pattern 2 for them — this file only verified Core Workspace/Knowledge Hub in depth.

## Sources

- `d:/{MY_PROJECTS}/{OPC_cerebro_hive}/OPC/cerebro-hive-website/.planning/PROJECT.md` — milestone scope, requirements, prior decisions
- `d:/{MY_PROJECTS}/{OPC_cerebro_hive}/OPC/cerebro-hive-website/.planning/codebase/{ARCHITECTURE,STRUCTURE,CONVENTIONS}.md` — prior mapping pass (accurate for `platform-api` DDD/CQRS layer only; superseded elsewhere per correction note above)
- Live repo inspection (2026-08-09): `apps/`, `services/`, `packages/` directory listings; `services/forge-api/package.json` + `src/` tree; `services/archive-api/package.json`, `src/routes/upload.route.ts`, `src/services/{queue,storage}.service.ts`, `src/config/env.ts`; `services/archive-worker/package.json` (no `src/`); `packages/db/package.json`, `index.ts`; `packages/archive-contracts/src/index.ts`; `packages/db/prisma/schema.prisma` (Archive* models, Tenant/Workspace/Organization/Project models); `apps/studio/lib/prisma.ts`, `apps/studio/app/actions/archive.ts`, `apps/studio/app/actions/agentos-runtime.ts`, `apps/studio/lib/config/api.ts`, `apps/studio/lib/talent/services/AssessmentService.ts`, `apps/studio/lib/queue/{client,worker}.ts`, `apps/studio/app/(platform)/archive/documents/page.tsx`, `apps/studio/app/api/v1/talent/metrics/route.ts`, `apps/studio/package.json`; `services/forge-api/src/streaming/events.controller.ts`; `packages/api-client/src/*`

---
*Architecture research for: CerebroHive Studio — archive-worker + Knowledge Hub integration, studio data-fetching convention*
*Researched: 2026-08-09*
