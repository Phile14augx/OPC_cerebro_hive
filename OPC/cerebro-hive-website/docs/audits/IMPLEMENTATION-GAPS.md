# Implementation Gaps

Day 1 closed navigation honesty, fake-action P0s, client/server URL mismatch, typecheck no-ops, and control-plane schema. The 7-day studios are **not** complete.

## P0 remaining

| Gap | Evidence | Next |
|---|---|---|
| Live click-through of 99 sidebar items | No Playwright nav suite against running Studio | Day 1 live verification |
| forge-api unauthenticated project/AI routes | JwtGuard only on workflow/stream | Send tokens, then require auth |
| Unfiltered `pnpm lint` / `pnpm build` historically fail | missing ESLint configs; empty `archive-worker` src | quality gate, do not paper over |
| Talent schema dropped | baseline migration | restore in Talent phase or keep 501 |

## P1

- Studio client still declares knowledge/billing/prompts methods; platform-api does not implement them (now under `/api/v1/*`, so failures are real 404/401, not silent wrong host)
- Workflow execute writes RUNNING row only — no Temporal dispatch
- Twin Studio tenant headers spoofable
- Feature flags unused at runtime

## Day 2–7 (not started)

Architecture persistence UI, generators, Database Studio adapters, Web/Mobile/Desktop, Testing Intelligence, Git, AI review, CerebroBots, deployment adapters, golden path.

## Explicit non-goals of Day 1

Implementing 30 languages, faking AWS deploys, or marking sidebar logos as supported.
