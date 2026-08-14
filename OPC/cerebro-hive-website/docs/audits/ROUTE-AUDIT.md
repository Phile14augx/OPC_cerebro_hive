# Route Audit

**Date:** 2026-08-13  
**Scope:** Studio sidebar, marketing nav, archive, auth, satellite apps  
**Method:** Static registry/filesystem audit plus Day 1 code repairs. Live click-through of all 99 items is still pending.

## Classification legend

`PRODUCTION` · `FUNCTIONAL_BETA` · `PARTIAL` · `MOCK` · `PLACEHOLDER` · `404` · `BROKEN` · `NOT_IMPLEMENTED`

## Sidebar (99 items / 14 groups)

| Area | UI Route | UI Status | API | API Status | Persistence | Runtime | Tests | Deployment | Gap | Required Fix |
|---|---|---|---|---|---|---|---|---|---|---|
| CerebroForge (9 backed tools) | `/app/forge/*` | FUNCTIONAL_BETA | forge-api `:4005` | FUNCTIONAL_BETA | Prisma `Project` | SSE codegen | forge-api jest | Helm forge-api | Unauthenticated controllers; review auto-fix was fake | Auth + real patch API (Day 6) |
| Other Forge studios | `/app/forge/{backend,database,api,...}` | PLACEHOLDER | none | NOT_IMPLEMENTED | none | none | PlaceholderModule | n/a | Generators not built | Days 2–5 |
| HiveOps | `/app/hiveops/*` | PLACEHOLDER | `/api/v1/hiveops/*` PARTIAL | PARTIAL | mixed | none | none | n/a | UI is placeholder | Later |
| Workspace CRUD | `/app/organizations` etc. | PLACEHOLDER | none | NOT_IMPLEMENTED | Prisma Workspace exists | none | none | n/a | Header switcher is dead | Phase 2 / Day 1 models exist |
| Runtime | `/app/runtime` | PLACEHOLDER | platform-api runtime | PARTIAL / in-memory | InMemoryExecutionRepository | SSE NotYetWired | none | n/a | Fabricated dashboard removed Day 1 | Wire jobs |
| Talent OS | `/app/talent/*` | MOCK / PLACEHOLDER | `/api/v1/talent/*` | BROKEN → 501 | tables dropped | eval sandbox removed | honesty tests | n/a | Schema restoration deferred | Phase 6 |
| Remaining ~72 registry routes | catch-all | PLACEHOLDER | none | NOT_IMPLEMENTED | none | none | `audit-nav-routes.mjs` | n/a | Honest placeholder by design | Per-studio later days |

## P0 link repairs in this change

| Link | Before | After |
|---|---|---|
| Login / register | `/dashboard` (404) | `/app` |
| Resources → Documentation | `/docs` (404) | `/developers` |
| Dashboard Create Agent | `/app/ai/agents/new` | `/app/agents` |
| Dashboard Knowledge Base | `/app/ai/knowledge/new` | `/app/ai/knowledge` |
| Archive models/datasets | 404 | honest placeholder pages |
| Archive portal `/search`, `/admin` | 404 | honest placeholder pages |

## Automated coverage

- `node scripts/audit-nav-routes.mjs` — 99 registry items
- `node scripts/audit-route-health.mjs` — nav + auth/docs/archive/fake-UI assertions
- CI job `typecheck-lint` now runs route-health

Live HTTP 200 against a running Studio is **not** claimed until Day 1 live verification completes.
