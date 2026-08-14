# Fake UI Audit

**Date:** 2026-08-13  
**Rule:** Action verbs must invoke a real backend or the UI must refuse/label the capability.

## Resolved this Day 1

| Finding | Path | Resolution |
|---|---|---|
| Runtime fabricated executions and metrics | `apps/studio/app/(platform)/app/runtime/page.tsx` | Replaced with `PlaceholderModule` |
| Forge Auto-fix `setTimeout` theatre | `forge/review/page.tsx` | Button disabled; label “Auto-fix unavailable” |
| Talent “Run tests” invented JUnit output | `talent/assessments/[id]/page.tsx` | Prints `TALENT_EXECUTION_NOT_IMPLEMENTED` |
| Talent `eval(code)` sandbox | `MockProviders.ts` | Throws; no eval |
| Docker provider always `exitCode: 0` | `DockerExecutionProvider.ts` | Throws `DOCKER_EXECUTION_NOT_IMPLEMENTED` |
| Random/hardcoded grading | `talent/engine/evaluation.ts` | Throws instead of scores |
| Talent auth `isAuthorized = true` | `talent/auth/middleware.ts` | 401 without Bearer; 501 thereafter |
| Trivy stub CVE as `succeeded` | `TrivyAdapter.ts` | `skipped` + `AnalyzerUnavailable` |
| LangGraph fake success | `packages/domain/src/adapters/langgraph.ts` | `success: false` with explicit error |
| Archive invented document/model counts | `archive/page.tsx` | Availability labels only |
| Hollow execution test | `apps/studio/tests/api/execution.test.ts` | Asserts refusal, not fake lifecycle |
| platform-api / forge-api `typecheck: exit 0` | package.json | `tsc --noEmit` |

## Honest by design (not deception)

- `PlaceholderModule` for planned sidebar items
- Cost/Reliability/Compliance review agents `status: skipped`
- Runtime SSE `NotYetWired` on platform-api
- Marketing assistants that disclose demo copy

## Remaining (tracked, not claimed fixed)

| Finding | Why still present | Owner |
|---|---|---|
| platform-api mock LLM fallback registered | Real AI gateway is preferred; mock still in bootstrap | Day 3+ |
| In-memory execution store | Schema `PlatformJob` added; worker not wired | Day 5 |
| LLM gateway mockLiteLlmExecution | Satellite service, not Studio nav | Day 6 |
| Feature flags in-memory default false | DB model exists, OpenFeature not wired | later |
| forge-api JwtGuard not global | Enabling it would break the 9 local Forge tools until Studio sends tokens | Day 1 security note |
| `.codex-task8-*` duplicate trees | Repo hygiene, not product UI | separate cleanup |

Do not treat a remaining mock in a non-production path as a green capability.
