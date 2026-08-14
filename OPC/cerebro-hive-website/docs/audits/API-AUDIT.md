# API Audit

**Date:** 2026-08-13  
**Rule:** Clients must call the service that actually implements the route. A 401/404/501 is honest; a silent wrong host is not.

## Canonical local endpoints

| Service | Bind | Prefix | Auth today |
|---|---|---|---|
| Studio | `:3401` | UI only | NextAuth / Keycloak (partial) |
| platform-api | `:3406` | `/api/v1/*` | JWT via `KEYCLOAK_SERVER_URL` |
| forge-api | `:4005` | `/api/forge/*` and related Nest controllers | JwtGuard on workflow/stream only — **project/AI routes are unauthenticated** |
| Marketing / gateway | `:8900` | `/api/v1/*` | Keycloak at the gateway |

Studio `api-client.ts` defaults to `http://localhost:3406` and always requests `/api/v1/...`. A trailing `/api/v1` on `NEXT_PUBLIC_API_URL` is stripped so the marketing-site env value does not double-prefix.

## Client vs server

| Client method family | Target after Day 1 | Server status |
|---|---|---|
| `/api/v1/auth/me`, workflows, agents | platform-api | Implemented (auth required) |
| `/api/v1/knowledge/*`, `/api/v1/billing/*`, `/api/v1/prompts/*` | platform-api | **Missing** — callers now fail against the real host |
| `/api/v1/talent/*` | Studio Next routes | **501** after Bearer check; Prisma tables dropped |
| Forge generate / review / docs | forge-api `:4005` | FUNCTIONAL_BETA, unauthenticated |
| Runtime execute SSE | platform-api | In-memory; `NotYetWired` for some streams |

## Error contract

Shared codes in `packages/shared-types/src/api/errors.ts` now include `CAPABILITY_NOT_IMPLEMENTED`, `TALENT_SCHEMA_UNAVAILABLE`, and `ANALYZER_UNAVAILABLE`. APIs must not return `200` with invented payloads for those cases.

## Deliberate non-change

forge-api is **not** globally JwtGuard-wrapped in Day 1. The nine live CerebroForge tools would break until Studio sends tokens. Tracked in [`IMPLEMENTATION-GAPS.md`](./IMPLEMENTATION-GAPS.md).
