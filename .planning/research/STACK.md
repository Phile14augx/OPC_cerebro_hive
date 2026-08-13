# Stack Research

**Domain:** Document ingestion (BullMQ + Gemini + Claude + Qdrant), Talent OS/Marketplace CRUD admin UI, command palette — additions to an existing Next.js/NestJS/Fastify/Prisma monorepo
**Researched:** 2026-08-09
**Confidence:** HIGH (verified live against this repo's actual `package.json` files and npm registry, not just training data)

## Cross-Check Against Existing Stack — What NOT to Re-Add

This monorepo already has most of the infra-level pieces this milestone needs. Verified by reading `services/archive-worker/package.json`, `services/archive-api/package.json`, `packages/ai-gateway/src/`, and `apps/studio/package.json` directly (not assumed from `.planning/codebase/STACK.md` alone, which is 5 days stale relative to this check).

| Need | Already present | Where | Action |
|------|------------------|-------|--------|
| Job queue (BullMQ) | `bullmq ^5.0.0`, `ioredis ^5.0.0` | `services/archive-worker/package.json` (already scaffolded, zero `src/` files yet) | Reuse as-is. Bump `bullmq` to match `archive-api`'s `^6.0.8` only if you need worker/queue API parity across both services — otherwise leave pinned, BullMQ v5 workers are compatible with v6 queues on the same Redis. |
| Redis client | `ioredis ^5.0.0` | `services/archive-worker/package.json` | Reuse. `REDIS_URL` already in `.env.example`. |
| Vector DB client | `@qdrant/js-client-rest ^1.19.0` | `services/archive-api/package.json` | **Add the same dependency + version to `services/archive-worker/package.json`** — it is not there yet. Do not introduce a second Qdrant client (e.g. the gRPC client or LangChain's Qdrant wrapper). |
| Claude API access | `@anthropic-ai/sdk` (versions 0.27–0.56 across the monorepo) wrapped by `@cerebro/ai-gateway` (`AnthropicProvider`, circuit breaker, rate limiter, response cache, cost tracking) | `packages/ai-gateway/src/gateway.ts`, `providers/anthropic.provider.ts` | **Reuse `@cerebro/ai-gateway` as a workspace dependency** (`"@cerebro/ai-gateway": "workspace:*"`) for the ENTITIES/TAGS stage. Do not add a raw `@anthropic-ai/sdk` install to archive-worker — that duplicates auth, rate-limiting, and circuit-breaking that ai-gateway already provides for free. `ANTHROPIC_API_KEY` already exists in `.env.example`. |
| Schema validation | `zod ^3.25.76` | monorepo-wide | Reuse. **Do not upgrade to Zod 4** for this milestone — it's a floating dependency used everywhere; a major bump is out of scope and would ripple across every service. |
| Server state / data fetching | `@tanstack/react-query ^5.101.4` | `apps/studio/package.json` | Reuse for all Talent OS / Marketplace CRUD data fetching. No new fetching library needed. |
| Headless UI primitives | `radix-ui ^1.6.6` (unified package) | `apps/studio/package.json` | Reuse as the Dialog/Popover shell for the command palette (cmdk composes with Radix Dialog). |
| Forms | `react-hook-form ^7.0.0` | `apps/archive-portal`, `apps/platform`, `apps/pulse` — **not yet in `apps/studio`** | Established pattern in sibling apps but missing from Studio. Add to `apps/studio/package.json` for Talent OS forms (Assessment Builder, Candidate/Hiring forms) to stay consistent with the rest of the monorepo instead of inventing a different forms approach for Studio alone. |
| Icons | `lucide-react ^1.25.0` | `apps/studio/package.json` | Reuse for all new UI (command palette icons, table icons, kanban cards). |

## Recommended Stack

### Core Technologies — Ingestion Worker (`services/archive-worker`)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@google/genai` | `^2.16.0` | Gemini API client for the EMBED stage | Google's current official unified SDK for Gemini (successor to the deprecated `@google/generative-ai` package). Actively maintained (published 3 days before this research, 2026-08-06). Verified directly against npm registry. **Pin below 3.0.0** — the 3.x line requires Node 22+; this monorepo's `engines` already requires Node ≥22 so 3.x would also work, but 2.x is the more battle-tested line as of this research; re-evaluate at next stack review. |
| `unpdf` | `^1.8.0` | PDF text extraction for the EXTRACT stage | Zero native dependencies (wraps a serverless build of PDF.js) — this matters because the worker runs in Docker/Kubernetes across the same monorepo that has already fought native-module build pain (see `patches/`, `.env.example` cross-platform concerns). `pdf-parse` (the more famous alternative) has known crashes from native `canvas` dependency resolution in containerized/serverless environments and is flagged unmaintained-but-popular by Snyk. `unpdf` is purpose-built for this exact scenario (Node/edge/serverless PDF extraction) and is actively shipped (last release 2 weeks before this research). |
| `@qdrant/js-client-rest` | `^1.19.0` | Vector storage for EMBED stage output | Already a dependency of `archive-api` at this exact version — just add it to `archive-worker` too. Don't pick a different Qdrant client; keeping the same version across both services avoids subtle API-shape drift between the two teams' code. |
| `@cerebro/ai-gateway` | `workspace:*` | Claude calls for ENTITIES/TAGS stage | Internal package already wraps `@anthropic-ai/sdk` with circuit breaker, rate limiting, response caching, and cost tracking (`packages/ai-gateway/src/gateway.ts`). Reusing it means the ingestion pipeline automatically inherits production-grade resilience instead of a bare `client.messages.create()` call with no retry/backoff logic. |

### Supporting Libraries — Ingestion Worker

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@bull-board/api` + `@bull-board/fastify` | `^8.6.0` | Queue/job observability UI (Bull Board dashboard) | Optional but recommended once the DOWNLOAD→...→COMPLETE pipeline is live — gives ops visibility into stuck/failed jobs per stage without writing a custom admin view. Mount it inside `archive-api` (which is already Fastify) rather than the worker itself, since the worker has no HTTP server. Not a hard requirement for MVP; flag as a fast-follow. |
| *(no library — hand-rolled)* | — | Text chunking for the CHUNK stage | Do **not** pull in LangChain's `RecursiveCharacterTextSplitter` for this. A single fixed-size/overlap recursive character splitter (paragraph → sentence → hard character fallback, ~40-60 lines of TS) fully covers the PDF+txt/md v1 scope and avoids importing LangChain's large, fast-churning dependency tree for one utility function. Chunk by characters, not by Gemini/Claude tokens — a token-exact splitter (`js-tiktoken`, `gpt-tokenizer`) is unnecessary complexity for v1 and those tokenizers don't even match Gemini's own tokenizer. |

### Core Technologies — Talent OS / Marketplace CRUD UI (`apps/studio`)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `cmdk` | `^1.1.1` | Command palette primitive (⌘K / global search) | The de facto standard — powers Linear, Vercel, Raycast, and shadcn/ui's `Command` component; tens of millions of weekly downloads. Verified directly against the npm registry: `peerDependencies` on the latest published version (1.1.1, released 2025-03-14) explicitly list `"react": "^18 \|\| ^19 \|\| ^19.0.0-rc"` — it **does** declare React 19 support at the dependency-resolution level, contradicting an older (2024) GitHub thread that circulates in search results. Composes directly with the `radix-ui` Dialog already in the stack (this is exactly the shadcn/ui `Command` pattern). MEDIUM confidence on zero-friction TypeScript types specifically (isolated community reports of a `ReactNode` type mismatch under strict TS + React 19 — verify in a spike before committing UI time; if it bites, wrap the cmdk import boundary with a narrow `as unknown as` cast rather than abandoning the library). |
| `react-hook-form` | `^7.85.0` (matches existing `^7.0.0` range in sibling apps) | Forms: Assessment Builder, Candidate forms, Hiring Pipeline stage forms | Already the established pattern in `apps/archive-portal`, `apps/platform`, `apps/pulse` — adopting it in Studio too keeps forms consistent monorepo-wide instead of introducing Formik or uncontrolled-form patterns just for this app. |
| `@hookform/resolvers` | `^5.7.1` | Wires `zod` schemas into `react-hook-form` validation | Verified peer dependency range `"zod": "^3.25.0 \|\| ^4.0.0"` on npm registry — directly compatible with the monorepo's existing `zod ^3.25.76` pin, no Zod major bump required. |
| `@tanstack/react-table` | `^8.21.3` — **deliberately not v9** | Headless data tables: Candidates list, Question Bank, Assessments list | v9.0.0 stable was published 5 days before this research (2026-08-04) after a long beta cycle — real, but too fresh for a production admin surface with zero ecosystem examples/Stack Overflow answers yet. v8.21.3 (April 2025) is the version nearly all current tutorials, shadcn/ui table recipes, and community patterns target, and its React adapter is confirmed compatible with React 16.8–19. Headless (no bundled styling) so it composes with the existing Radix/Tailwind design system instead of fighting it. |
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | `^6.3.1` / `^10.0.0` / `^3.2.2` | Kanban-style drag-and-drop for the Hiring Pipeline board, reorderable Question Bank / Assessment Builder question lists | The classic, most widely documented dnd-kit combo (peer dep `"react": ">=16.8.0"`, verified React-19-safe). Not the newest — `@dnd-kit/react` (0.5.0, June 2026) is the in-progress next-gen rewrite but is pre-1.0 with a shifting API; too immature to build production kanban UI against right now. Revisit once `@dnd-kit/react` reaches a stable 1.0. |

## Installation

```bash
# services/archive-worker — ingestion pipeline
pnpm --filter @cerebro/archive-worker add @google/genai@^2.16.0 unpdf@^1.8.0 @qdrant/js-client-rest@^1.19.0
pnpm --filter @cerebro/archive-worker add @cerebro/ai-gateway@workspace:*

# services/archive-api — optional queue dashboard (mount on the existing Fastify server)
pnpm --filter @cerebro/archive-api add @bull-board/api@^8.6.0 @bull-board/fastify@^8.6.0

# apps/studio — command palette, forms, tables, drag-and-drop
pnpm --filter @cerebro/studio add cmdk@^1.1.1 react-hook-form@^7.85.0 @hookform/resolvers@^5.7.1 @tanstack/react-table@^8.21.3 @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2
```

New environment variables needed (not yet in `.env.example` — verified by grep):

```bash
# Gemini (embeddings, EMBED stage)
GEMINI_API_KEY=""
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"

# Qdrant (vector storage — archive-worker needs its own URL entry even though archive-api already has one, confirm they point at the same instance)
QDRANT_URL="http://localhost:6333"
QDRANT_COLLECTION="archive_documents"
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| `@google/genai` | `@google/generative-ai` | Never for new code — Google has consolidated on `@google/genai`; `@google/generative-ai` is the older, now-secondary package. Only relevant if some other part of the monorepo already depends on it (grep found none). |
| `@google/genai` direct client | A new `GeminiProvider` inside `@cerebro/ai-gateway` | If the roadmap wants embedding-generation to share ai-gateway's circuit-breaker/cache/cost-tracking infra long-term, add an `embed()` method to ai-gateway alongside its existing `chat()` interface. Out of scope for this milestone (ai-gateway currently only models chat completions, not embeddings) — flag as a fast-follow architectural improvement, not a v1 blocker. |
| `unpdf` | `pdf-parse` (or `@cedrugs/pdf-parse` fork) | Use `pdf-parse`/fork only if a future requirement needs its specific output shape (page-by-page metadata) that `unpdf` doesn't cover as conveniently — but expect to deal with native `canvas` dependency resolution in Docker builds. |
| `unpdf` | `pdfjs-dist` directly | If you need low-level rendering (canvas output, annotations) beyond text extraction — not needed for a text-extraction-only v1 pipeline. |
| `cmdk` | `kbar` | If you want a more opinionated, ready-made command-palette *application shell* (actions registry, nested command flows) rather than a headless primitive to compose yourself. `cmdk` was chosen because it composes with the Radix Dialog already in the stack and matches the shadcn/ui pattern already implied by the rest of Studio's component system. |
| `cmdk` | `modern-cmdk` | Only once it's past its ground-up-rewrite/early-adopter phase — it explicitly targets "TypeScript 6 / ES2026" and is a from-scratch React 19 rewrite with a tiny adoption base; too risky for this milestone. |
| `@tanstack/react-table` v8 | `@tanstack/react-table` v9 | Once v9 has been stable for a few months and shadcn/ui + community examples catch up. The v8→v9 migration is a headless-API-only change (no data-model rewrite), so upgrading later is low-risk. |
| `@dnd-kit/core` (classic) | `@dnd-kit/react` (next-gen) | Once it reaches 1.0 and API stabilizes — currently 0.5.0, actively evolving. |
| Hand-rolled chunker | LangChain.js `RecursiveCharacterTextSplitter` | Only if the roadmap later wants semantic/markdown-aware splitting with heading-boundary awareness beyond what a simple recursive splitter gives you — at that point, still prefer pulling just `@langchain/textsplitters` (the scoped sub-package) over the full `langchain` metapackage. |
| `react-hook-form` + `@hookform/resolvers` | Native Zod + uncontrolled `<form>` + Server Actions | Valid if Talent OS forms end up simple enough (few fields, no dynamic field arrays). Given Assessment Builder needs dynamic question lists and conditional fields, `react-hook-form`'s field-array support (`useFieldArray`) is the better fit — this is why it's the primary recommendation, not the alternative. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `pdf-parse` (bare) | Popular but classified "unmaintained but sustainable" by Snyk; known to crash in containerized/serverless environments due to a native `canvas` dependency resolution quirk that this project's Docker-based deployment would likely hit. | `unpdf` |
| `@google/generative-ai` | Superseded by `@google/genai`; installing it alongside `@google/genai` risks two divergent Gemini client patterns in the same monorepo. | `@google/genai` |
| A second/raw `@anthropic-ai/sdk` install in `archive-worker` | Duplicates auth, retry, rate-limit, and cost-tracking logic that `@cerebro/ai-gateway` already implements; creates two different Claude-calling conventions in the same monorepo (one for forge-api-style agents, one ad hoc for the worker). | `@cerebro/ai-gateway` (workspace dependency) |
| Full `langchain` package for chunking | Massive dependency surface (100+ transitive packages), frequent breaking changes across minor versions, and this pipeline only needs one utility function (recursive text splitting) from it. | Hand-rolled recursive character splitter, or `@langchain/textsplitters` scoped package if requirements grow |
| Zod 4 upgrade as part of this milestone | `zod ^3.25.76` is a monorepo-wide floating dependency; bumping it is a cross-cutting breaking change unrelated to this milestone's scope and would need its own validation pass across every service that imports `zod`. | Keep `zod ^3.25.76`; `@hookform/resolvers ^5.7.1`'s peer range (`^3.25.0 \|\| ^4.0.0`) already supports it without a bump. |
| `@tanstack/react-table` v9 (right now) | Stable release is 5 days old at research time — real but with essentially zero accumulated production examples/troubleshooting content yet. | `@tanstack/react-table ^8.21.3` |
| `react-beautiful-dnd` | Officially deprecated/unmaintained by Atlassian, does not support React 18 concurrent features cleanly, let alone React 19. | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Building a bespoke fuzzy-search library for the Marketplace/Explore catalog | `cmdk`'s underlying `command-score` fuzzy matcher already gives you a good fuzzy filter primitive; a separate search library is redundant for client-side catalog filtering of Templates/Industry Packs. | Reuse `cmdk`'s built-in filtering (or its exported `command-score` scorer directly) for Marketplace search-as-you-type; only reach for a dedicated engine (e.g. server-side search) if the catalog grows large enough that client-side filtering becomes a real perf concern — not indicated by anything in the current scope. |

## Stack Patterns by Variant

**If the roadmap wants embedding generation to be provider-agnostic (not hard-locked to Gemini):**
- Add an `embed()` method to `@cerebro/ai-gateway` mirroring its existing `chat()` abstraction, with a `GeminiProvider` implementing it.
- Because: keeps the "swap providers via config" pattern that ai-gateway already gives `chat()` consistent across embeddings too. Skip this for v1 — PROJECT.md already commits to Gemini specifically for embeddings; only revisit if that decision changes.

**If PDF documents in practice contain large scanned-image pages (no embedded text layer):**
- `unpdf` (and `pdf-parse`) both only extract embedded text — neither does OCR.
- Because: v1 scope is explicitly "PDF + txt/md", not scanned-document OCR. If OCR becomes a requirement later, that's a distinct research question (e.g. `tesseract.js` or a cloud OCR API) — don't scope-creep it into this pass.

**If Hiring Pipeline needs cross-column virtualized rendering for very large candidate counts:**
- Pair `@tanstack/react-table` with `@tanstack/react-virtual` (same maintainer, same major-version cadence, already trusted npm scope).
- Because: not indicated by current scope (no stated candidate-volume requirement) — flag as a fast-follow only if a phase turns up a real performance problem.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `cmdk@1.1.1` | `react@19.2.4`, `react-dom@19.2.4` | Peer dependency range verified directly on npm registry: `^18 \|\| ^19 \|\| ^19.0.0-rc`. Matches the exact React version already pinned in `apps/studio/package.json`. |
| `@hookform/resolvers@5.7.1` | `zod@3.25.76` | Peer range `^3.25.0 \|\| ^4.0.0` verified on npm registry — compatible with the monorepo's exact pinned Zod version without any bump. |
| `@tanstack/react-table@8.21.3` | `react@19.2.4` | v8's React adapter supports React 16.8–19; be aware it may not play perfectly with the React Compiler if that's turned on later — not currently in use in this repo per `.planning/codebase/STACK.md`. |
| `@dnd-kit/core@6.3.1` | `react@19.2.4` | Peer range `>=16.8.0` (unbounded upper end) verified on npm registry — compatible. |
| `@dnd-kit/sortable@10.0.0` | `@dnd-kit/core@6.3.1` | Peer dependency `@dnd-kit/core: ^6.3.0` verified on npm registry — install both together, do not mix `@dnd-kit/sortable` v10 with a `@dnd-kit/core` v5 or the new `@dnd-kit/react` line. |
| `@google/genai@2.16.0` | Node.js `>=18` | The 3.x line (not yet recommended here) requires Node `>=22`; this monorepo's `engines.node >= 22.0.0` would satisfy either, but 2.x is the more field-tested line at research time. |
| `unpdf@1.8.0` | Node.js (any modern LTS), Docker/Linux containers | Zero native dependencies is the entire reason it's recommended over `pdf-parse` for this containerized worker. |
| `@qdrant/js-client-rest@1.19.0` | `services/archive-api` (already installed) | Keep the exact same version string in `archive-worker`'s `package.json` to avoid REST API-shape drift between the two services talking to the same Qdrant instance. |
| `@cerebro/ai-gateway` (workspace) | `@anthropic-ai/sdk@^0.30.0` (its internal pin) | Note this is a *different* Anthropic SDK version than `apps/pulse`/`apps/sphere` (`^0.56.0`). Not a blocker (ai-gateway encapsulates it), but worth flagging for a future monorepo-wide dependency-alignment pass — out of scope here. |

## Sources

- `/qdrant/qdrant-js` (Context7 via `ctx7` CLI) — install/usage snippets for `@qdrant/js-client-rest`, confirmed current usage pattern (createCollection/upsert/search).
- `/unjs/unpdf` (Context7 via `ctx7` CLI) — confirmed as the maintained, serverless-oriented PDF.js wrapper.
- npm registry API (`registry.npmjs.org`), queried directly for: `@google/genai` (2.16.0, 2026-08-06), `unpdf` (1.8.0, 2026-07-24), `cmdk` (1.1.1, 2025-03-14, peerDeps confirmed), `@tanstack/react-table` (9.1.2 latest but 9.0.0 only 5 days old at research time; 8.21.3 chosen instead), `@hookform/resolvers` (5.7.1, 2026-08-02, peerDeps confirmed against zod 3.25.x), `react-hook-form` (7.85.0, 2026-08-08), `@dnd-kit/core` (6.3.1), `@dnd-kit/react` (0.5.0, too new), `@dnd-kit/sortable` (10.0.0), `@dnd-kit/utilities` (3.2.2). HIGH confidence — this is registry ground truth, not training data.
- Direct repo inspection (this research session): `services/archive-worker/package.json` and `src/` (confirmed empty scaffold), `services/archive-api/package.json`, `packages/ai-gateway/src/{index,gateway}.ts`, `packages/ai/package.json`, `apps/studio/package.json`, `apps/{archive-portal,platform,pulse}/package.json`, `.env.example`. HIGH confidence — this is what's actually in the repo today, not an assumption from the prior codebase-mapping pass.
- WebSearch: "unpdf vs pdf-parse vs pdfjs-dist 2026" (PkgPulse), Snyk security page for `pdf-parse`, Google Developers Blog on `gemini-embedding-001` general availability, GitHub issue `shadcn-ui/ui#6200` and `pacocoursey/cmdk#266` (cmdk/React 19 — superseded by the direct npm registry peerDependencies check above, kept for context on reported TS-level friction). MEDIUM confidence, cross-checked against registry data where possible.

---
*Stack research for: CerebroHive Studio — document ingestion pipeline, Talent OS/Marketplace CRUD UI, command palette*
*Researched: 2026-08-09*
