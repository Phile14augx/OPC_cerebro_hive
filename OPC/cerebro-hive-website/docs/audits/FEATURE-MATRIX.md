# Feature Matrix

**Date:** 2026-08-13  
Statuses: `PRODUCTION` · `FUNCTIONAL_BETA` · `PARTIAL` · `PLACEHOLDER` · `NOT_IMPLEMENTED` · `REFUSES` (honest failure)

| Feature | UI | API | Persistence | Runtime | Tests |
|---|---|---|---|---|---|
| Studio shell + 99-item nav | FUNCTIONAL_BETA | n/a | n/a | catch-all placeholder | `audit-nav-routes.mjs` |
| CerebroForge 9 tools | FUNCTIONAL_BETA | forge-api | Prisma Project | SSE codegen | forge-api jest |
| Architecture Studio | PLACEHOLDER | none | schema added | none | none |
| Backend / API / Database studios | PLACEHOLDER | none | none | none | none |
| Web / Mobile / Desktop generate | PLACEHOLDER | none | registry ids only | none | none |
| Runtime dashboard | PLACEHOLDER | in-memory execute | `PlatformJob` unused | NotYetWired | none |
| Talent assessments | REFUSES | 401/501 | tables dropped | throws | honesty tests |
| Engineering review Trivy | REFUSES | skipped | n/a | AnalyzerUnavailable | unit |
| Workspace/project CRUD UI | PLACEHOLDER | partial | Prisma models exist | none | none |
| Git / deploy / bots | PLACEHOLDER | none | Repository model exists | none | none |

Registry source of truth: `packages/plugin-sdk/src/technology.ts`. `generator.supported` is `false` until a generator writes real files.
