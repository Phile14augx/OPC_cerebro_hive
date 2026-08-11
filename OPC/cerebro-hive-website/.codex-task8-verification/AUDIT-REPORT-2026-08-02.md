# Codebase Audit — 2026-08-02

**Scope:** full sweep — website (`app/`, `components/`, `lib/`), workspace integrity (`apps/`, `services/`, `packages/`), CI/CD and security gates, repo hygiene and secrets.
**Reference:** `CEREBROHIVE_CONSTITUTION.md` (§5 Product Portfolio, §15 Platform Governance & Standards, §17 HiveExchange).
**Fix policy:** fix everything found.

---

## Method, and what this audit could not do

Findings came from static analysis: route/link graph extraction, TypeScript parse-level checking with the real compiler API, cross-file export resolution, and targeted pattern scans. Every finding below was confirmed by direct file inspection.

Three limits, stated because they bound how much this report can claim:

- **Nothing was built, typechecked, linted, or tested.** `node_modules` on the mounted drive returns I/O errors, so `pnpm`, `tsc`, `next build`, and `vitest` could not run. Syntax was verified with the TypeScript parser; **type errors and runtime behaviour were not verified.** Run `pnpm install && pnpm typecheck && pnpm lint && pnpm build` before merging.
- **Git was unreachable** from the analysis environment (`.git` is not readable through the mount), so no history, blame, or "is this file tracked" check was possible. This matters most for the secrets finding below.
- **Coverage is uneven.** The website (`app/`, `components/`, `lib/`) was audited thoroughly and is the source of most findings. CI/CD, repo hygiene, and workspace integrity were audited across the whole repo. The **contents** of `packages/` and `services/` were surveyed structurally (what exists, what builds, what is dead) but not read line-by-line — 90 packages and 39 polyglot services is beyond what static analysis without a compiler can meaningfully cover.
- **Deletes were blocked** by the mount (`Operation not permitted` on `rm`/`rmdir`). Dead files were therefore *moved* to `.audit-quarantine/` rather than deleted. Nothing was destroyed; review and delete that folder yourself.

---

## Addendum (same day) — the validation pipeline itself is the P0

Investigating *why* a JSX-in-`.ts` file survived to a release branch turned up something
larger than the defect it explains. **`pnpm typecheck` reports success while checking
under a fifth of the codebase.**

Turbo runs a task only in workspace packages that *define* that script, and **silently
skips the rest** — it does not warn and it exits 0. Counting `package.json` files across
`apps/`, `packages/`, `packages/capabilities/`, and `services/`:

| Task | Packages defining it | Coverage |
|---|---|---|
| `typecheck` | 24 / 129 | **19%** |
| `lint` | 25 / 129 | **19%** |
| `test` | 41 / 129 | **32%** |

The 105 packages with no `typecheck` script include the core of the platform:
`apps/platform-api` (the live Fastify backend), `apps/studio`, `apps/platform`,
`packages/runtime-core`, `packages/auth`, `packages/events`, `packages/database`,
`packages/db`, `packages/contracts`, `packages/policy-core`, `services/forge-api`,
`services/llm-gateway`, and every `packages/capabilities/*`.

**Separately, the root Next.js application is not in the pipeline at all.** `pnpm-workspace.yaml`
globs `apps/*`, `packages/*`, `packages/capabilities/*`, `services/*` — the repository root
is not a workspace member, so `turbo typecheck` and `turbo lint` never reach `app/`,
`components/`, `lib/`, or the root `tsconfig.json`. That is precisely the region where this
audit found most of its defects, including the release-blocker.

A related smell, found while checking: the root `package.json` (`cerebro-hive-os`) declares
**no dependency on `next`**, despite `next.config.ts` and the entire site living at the root.
It builds only because pnpm hoists `next` into the root `node_modules` from some other
workspace package. That is undeclared and will break under a stricter install mode.

### Why this changes the merge gate

A green `pnpm typecheck` on a clean checkout would currently be close to meaningless as a
release signal. Re-running the baseline before fixing coverage would re-confirm a false green
rather than establish a trustworthy one. **Fix coverage first, then take the baseline.**

Suggested order:

1. Add root scripts and wire them into CI alongside the turbo tasks:
   ```json
   "typecheck:site": "tsc --noEmit -p tsconfig.json",
   "lint:site": "next lint"
   ```
2. Add a `typecheck` script to the 105 packages that lack one (mechanical — nearly all are
   `tsc --noEmit -p tsconfig.json`, matching the 24 that already have it).
3. Expect this to surface a large batch of pre-existing type errors. That backlog is the
   real state of the codebase; it was simply never measured.
4. Only then run the break test (introduce a deliberate type error, confirm CI fails, remove it).
   Run it **twice** — once in the root app, once in a package that previously had no
   `typecheck` script — since those are two independent gaps.

Note that root `tsconfig.json` also excludes `tests`, so root-app test files are outside
`typecheck:site` as written. Decide whether that is intended.

None of this was executed — `node_modules` is unreadable on this mount, so turbo could not be
run. The figures above come from reading 129 `package.json` files directly and are reliable;
the *consequence* (that turbo skips silently) is standard turbo behaviour and should be
confirmed with `pnpm typecheck --dry=json` on your checkout, as you proposed.

---

## Severity summary

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **Critical** | `lib/auth.ts` contains JSX but has a `.ts` extension — cannot compile; imported by the root layout | Fixed |
| 2 | **High** | `HiveExchange™` tile linked to `/platform/x`, a completely unrelated AI-gateway console | Fixed |
| 3 | **High** | Public bearer token (`NEXT_PUBLIC_PLATFORM_DEMO_KEY`) shipped to the browser from 24 files, with no guard | Fixed (mitigated) + action required |
| 4 | **High** | GitHub PAT present in `.env`; git history unverifiable | **Action required — rotate** |
| 5 | Medium | 7 constitution products had no page; 2 more were unreachable | Fixed |
| 6 | Medium | 19 duplicated, drifted copies of the API client, several with real bugs | Fixed |
| 7 | Medium | 9 platform pages missing from `sitemap.ts` | Fixed + CI guard added |
| 8 | Medium | Broken internal link `/academy/certificates` (404 from the dashboard) | Fixed |
| 9 | Medium | Two dead workspace members, one with a `main` pointing at an empty directory | Fixed (quarantined) |
| 10 | Medium | 4 CI workflows with no `permissions:` block; 1 action pinned to `@latest` | Fixed |
| 11 | Medium | No PR-time dependency review gate | Fixed |
| 12 | Low | `.gitignore` ignored `.env.example`; missed scratch/artifact files | Fixed |
| 13 | Low | Botched destructuring left dead binding in HiveForge page | Fixed |
| 14 | Low | ~64 scratch/artifact files at repo root | Fixed (quarantined) |
| 15 | Low | 10 empty `apps/`/`services/` directories | **Action required — delete** |

---

## Findings in detail

### 1. Critical — `lib/auth.ts` contains JSX and cannot compile

`lib/auth.ts` defines `AuthProvider` and returns JSX at line 287:

```tsx
return (
  <AuthContext.Provider value={{ ...state, login, logout, getToken }}>
```

TypeScript does not parse JSX in a `.ts` file — only in `.tsx`. The TypeScript parser reports three syntax errors on that line. This file is imported by `app/layout.tsx` (the **root layout**), plus `app/dashboard/page.tsx`, `app/auth/callback/page.tsx`, `components/layout/Navbar.tsx`, and `components/layout/TopBar.tsx`.

This is the single highest-impact finding: as committed, the application cannot typecheck.

**Fix:** renamed to `lib/auth.tsx`. All five importers use the extensionless specifier `@/lib/auth`, so no import required changing. The original is preserved at `.audit-quarantine/lib-auth.ts.superseded-by-auth.tsx`.

After the fix, all 186 files under `app/`, `components/`, and `lib/` parse with **0 syntax errors**.

### 2. High — `HiveExchange™` pointed at an unrelated page

`app/platform/page.tsx` listed:

```ts
{ name: "HiveExchange™", tagline: "Developer exchange · artifact publishing · skill marketplace · monetization",
  href: "/platform/x", ... }
```

`/platform/x` is not a marketplace. Its own heading reads *"Cerebro X™ — The AI gateway: model routing, cost, and observability in one place."* It is a live console over the Observatory and the model router — duplicating surface already owned by `/platform/observatory` and `/platform/gateway`, and filed under "Tier 5 — Ecosystem & Commerce" where it does not belong.

So the constitution's marketplace product (§17) was a link to an observability console, and the console itself was mislabelled and misfiled.

**Fix:** `HiveExchange™` now points to a new `/platform/exchange` page built from the constitution's §17 definition — the ten artifact families (agents, models, workflows, templates, connectors, industry packs, datasets, extensions, prompt libraries, automation packs), publisher lifecycle, consumer safeguards, and monetization. `Cerebro X™` is now listed separately and accurately under Tier 2.

### 3. High — public API bearer token, no guard

`NEXT_PUBLIC_PLATFORM_DEMO_KEY` was read in 24 files. The `NEXT_PUBLIC_` prefix means **Next.js inlines the value into the client bundle** — it is readable by anyone who loads the site.

It was attached as `Authorization: Bearer …` on every platform API call, unconditionally, with nothing documenting the exposure and nothing preventing a real tenant or admin key being dropped in.

The constraint that makes this hard to simply remove: `next.config.ts` supports `STATIC_EXPORT=true` for GitHub Pages. In that mode there is no server and no route handler, so a backend-for-frontend proxy is not available — and adding a route handler would *break* the static export build. **A proxy was therefore deliberately not added**; that is an architectural decision for you, not one to make blind and unbuilt.

**Fix (mitigation, not elimination):** `lib/platform-api.ts` now:

- Detects a same-origin base URL (`/api/v1`) and **omits the `Authorization` header entirely** in that case, so an SSR deployment can proxy with a server-side secret and ship nothing to the browser.
- Emits a development-time warning if the key does not look like a scoped demo credential.
- Documents the constraint in the module header and in `.env.example` (which did not previously mention either platform variable at all).

**Action required:** decide the target deployment mode. If the site is served with a server (the default `output: "standalone"`), set `NEXT_PUBLIC_PLATFORM_API_URL="/api/v1"`, leave the demo key empty, and terminate auth at the gateway. If GitHub Pages static export is a real target, confirm the demo key is scoped read-only and rate-limited.

### 4. High — GitHub personal access token in `.env`

`.env` contains `GITHUB_TOKEN=ghp_…` — a 40-character classic GitHub PAT, matching the live-credential format. The value was not read, printed, or copied.

`.gitignore` does contain `.env*`, so the file is *probably* untracked — but **git was not reachable from this environment, so that could not be verified**, and a `.gitignore` rule does nothing for a file that was committed before the rule existed.

**Action required (only you can do this):**

1. `git log --all --full-history -- .env` — confirm it was never committed.
2. **Rotate the token regardless.** It has been sitting in plaintext on disk; rotation is cheap and the alternative is assuming it is fine.
3. If it *was* ever committed, rotation is mandatory and history rewriting (`git filter-repo`) should be considered.

`NEXTAUTH_SECRET` in the same file begins with `dev…`, which reads as a development placeholder — confirm it is not reused in any deployed environment.

Note: `si_keys.txt` (41 KB) looked alarming but is harmless — it is a list of Simple Icons component names, not keys. It was quarantined as clutter, not as a secret.

### 5. Medium — constitution products missing from the platform

The constitution §5 names 14 Cerebro Applications and 15 Hive Platform products. Cross-referencing against `app/platform/`:

**Absent entirely (7):** `CerebroGrowth™`, `CerebroArchitect™`, `CerebroResearch™`, `CerebroPredict™`, `CerebroAnalytics™`, `HiveMonitor™`, `HiveWorkspace™`.

`CerebroAnalytics` deserves a specific note: the constitution lists it as a **Cerebro** application, but the site shipped `HiveAnalytics™` (Trino/dbt/data catalog) — a different product in the wrong family. `HiveMonitor™` was similarly conflated with `HiveObservatory™`.

**Present but unreachable (2):** `HiveExchange™` (finding 2), and `Cerebro X™` (existed, but was only linkable via the mislabelled HiveExchange tile).

**Fix:** eight new pages created — `exchange`, `monitor`, `workspace`, `cerebro-analytics`, `predict`, `growth`, `research`, `architect` — plus `Cerebro X™` correctly listed. They share a new `components/platform/ProductPage.tsx`.

Two deliberate improvements over the existing product pages:

- They are **server components with real `metadata`**. The 53 pre-existing platform pages are all `"use client"`, and a client component **cannot export `metadata`** — so those pages currently ship no title or description to search engines or link previews. That pre-existing gap is listed under "Not fixed" below.
- Each renders the constitution's §15 Required Standards as a visible strip, so the standards are asserted on the page rather than only in a document.

`HiveAnalytics™` was **not** renamed. It is a real, distinct product with a real page; the constitution mismatch is a naming decision for you, and silently renaming a shipped product is not an audit's call. See "Decisions for you".

### 6. Medium — 19 duplicated, drifted API clients

Every `app/platform/<product>/lib.ts` carried its own copy of `API`, `KEY`, `api()`, and `checkOnline()` — 19 copies, no two identical (19 distinct checksums). Five more pages inlined the same constants directly.

They had **diverged into real bugs**:

- `checkOnline()` in most copies did `await fetch(...); return true` — **ignoring the response status**, so a 500 from `/health` reported the platform as online.
- Several copies had **no timeout**, leaving the status indicator stuck on "Checking platform…".
- Header casing and `Content-Type` handling differed; some sent `Content-Type: application/json` on GET requests, which some API gateways reject.
- Error handling differed — some threw raw `res.text()`, others parsed a structured envelope, so error UX depended on which page you were on.
- None handled `204 No Content`; all would throw on an empty body.

**Fix:** one `lib/platform-api.ts`. All 19 `lib.ts` files now re-export from it; the 5 inlining pages import `API`/`KEY` from it. The shared client checks `res.ok`, applies a 3s timeout, handles 204 and empty bodies, and throws a typed `PlatformApiError` carrying `status` so callers can branch on 401/429 instead of parsing strings.

Verified: every `import { … } from "./lib"` across all platform pages still resolves to a real export.

### 7. Medium — sitemap drift

`app/sitemap.ts` hand-maintains the route list. Nine pages existed but were absent — `/platform/security` (pre-existing) plus the eight new ones. Missing pages are invisible to search.

**Fix:** list corrected, `/academy/certificates` added, and `scripts/check-sitemap.mjs` added — it fails if a page exists but is unlisted, *or* if a listed slug has no page (a 404 submitted to search engines). Wired in as `pnpm sitemap:check` and as a step in the `typecheck-lint` CI job. **Verified passing.**

### 8. Medium — broken internal link

`app/dashboard/page.tsx` linked "My Certificates" to `/academy/certificates`, which did not exist — a 404 from a primary dashboard tile.

**Fix:** built `app/academy/certificates/page.tsx` (six certifications, levels, assessment format, and a verification section consistent with HiveIdentity-anchored credentials).

A full link-graph check now reports **0 broken internal links across 87 routes and 91 link targets** (was 78 routes, 1 broken).

### 9. Medium — dead workspace members

- **`services/marketplace-api`** — `package.json` declares `"main": "src/index.ts"`, but `src/` is **empty**. `pnpm-workspace.yaml` globs `services/*`, so pnpm links a package whose entrypoint does not exist. Nothing imports it; it appears in no compose, turbo, or k8s config.
- **`services/platform-api`** — 17 TypeScript files, ~2,158 lines, a full Fastify route surface (`auth`, `billing`, `orgs`, `agents`, `api-keys`, …) with **no `package.json` and no `tsconfig.json`**. It is therefore outside the workspace: never installed, never compiled, never tested, never deployed. It is structurally different from the live `apps/platform-api` (flat `routes/` vs `modules/`), i.e. an abandoned earlier implementation. Two things called "platform-api", one of which does not build, is exactly how a contributor ships the wrong one.

**Fix:** both moved to `.audit-quarantine/dead-workspace-members/`. Reversible — confirm before deleting, particularly for the 2,158 lines.

### 10–11. Medium — CI gaps

- `eda-architecture.yml`, `eda-gate-c.yml`, `hiveforge-conformance.yml`, `verify-m26.yml` had **no `permissions:` block**, inheriting the repository default token (write-all in many orgs). **Fix:** `permissions: contents: read` added to each. All 22 workflows now declare permissions explicitly.
- `ci.yml` used `chromaui/action@latest` against `secrets.CHROMATIC_PROJECT_TOKEN` — a floating tag means an upstream release silently changes what runs against a repo secret. **Fix:** pinned to `@v11`.
- No PR-time dependency gate (recorded as deferred in `MASTER-PLAN-GAP-ASSESSMENT.md`). Dependabot keeps *existing* dependencies fresh but does not block a PR that *introduces* a vulnerable one. **Fix:** added `.github/workflows/dependency-review.yml`, `fail-on-severity: high` (aligned with the Trivy image gate) and a copyleft licence denylist.

### 12–14. Low — hygiene

- **`.gitignore` ignored `.env.example`.** The rule `.env*` swallowed the template a new contributor needs to know which variables exist. **Fix:** `!.env.example` negation added.
- `.env.example` documented neither `NEXT_PUBLIC_PLATFORM_API_URL` nor `NEXT_PUBLIC_PLATFORM_DEMO_KEY`, despite the platform pages depending on both. **Fix:** both added, with the exposure warning.
- **`app/platform/forge/page.tsx`** had a botched refactor at module scope:
  ```ts
  const [PROMPT, setPromptExt] = [`You are a Financial Analyst…`, null];
  ```
  Valid JavaScript, but `setPromptExt` is a permanently-`null` unused binding — an array destructure imitating `useState` at module scope. **Fix:** reduced to a plain `const PROMPT = …`.
- **~64 scratch and artifact files at the repo root** — 36 `scratch_*.js`, 7 `_shot*.js`, `out.zip` (12 MB), `diff.txt`, `ts-errors.log`, `build_output.log`, three `.tsbuildinfo` files, a duplicate `pnpm-lock.yaml.765178841`, zero-byte `check.html`/`error.html`, and stale `_tmp_*` files. **Fix:** quarantined; `.gitignore` extended to cover the patterns so they cannot come back. Verified first that no `package.json`, `turbo.json`, workflow, Dockerfile, or compose file referenced any of them.

### 15. Low — empty directories (**action required**)

Ten directories contain nothing at all: `apps/{archive,flow,insight,ops,search}` and `services/{archive-api,gateway-api,hiveops-api,identity-api,search-api}`.

They could not be removed — the mount rejected `rmdir` with `Operation not permitted`. Git does not track empty directories, so this is local-only noise, but it makes `apps/` and `services/` misrepresent what exists.

```bash
rmdir apps/archive apps/flow apps/insight apps/ops apps/search \
      services/archive-api services/gateway-api services/hiveops-api \
      services/identity-api services/search-api
```

---

## A correction worth recording

An earlier pass of this audit counted TypeScript files per service and concluded that **19 of 39 services were empty**. That was wrong, and the error is instructive: `services/` is **polyglot**. `academy-svc`, `crm-svc`, and `platform-svc` are Kotlin/Gradle; `agent-runner`, `evaluation-service`, `learning-service`, `planner-service` are Python; `gateway` is Rust; `router-service`, `swarm-api`, `tool-gateway` are Go; `ml-svc` is C++. "No `package.json`" is correct and expected for those, not a defect.

Only the ten directories in finding 15 are genuinely empty. A `.ts`-only file count would have produced a report recommending the deletion of most of the backend.

---

## Not fixed — decisions for you

These are real, but each is a product or architecture decision, and making them unilaterally (without a build, without git history) would be the wrong call.

1. **`HiveAnalytics™` vs the constitution's `CerebroAnalytics™`.** The constitution puts Analytics in the Cerebro family; the site ships `HiveAnalytics™` (Trino, dbt, catalog) — arguably a genuine platform-tier data product that the constitution simply predates. `CerebroAnalytics™` now exists alongside it as the predictive/prescriptive application. Either amend the constitution or consolidate — but decide, and record it in `MASTER-PLAN-EVOLUTION-LOG.md`.
2. **`HiveObservatory™` vs `HiveMonitor™`.** Same shape. They are now distinct (Monitor = real-time signal plane, Observatory = analytical surface), which is defensible, but it was not a deliberate decision — it was drift.
3. **53 platform pages ship no SEO metadata.** Every pre-existing `app/platform/*/page.tsx` is `"use client"`, and client components cannot export `metadata`. Fixing this means either splitting each into a server `layout.tsx` + client body, or adding a co-located `layout.tsx` per route. That is ~53 files of mechanical change that should be done with a working build. The eight new pages already do it correctly and can serve as the pattern.
4. **The BFF decision** in finding 3 — proxy vs public demo key — which depends on whether static export is still a real deployment target.
5. **`services/platform-api`'s 2,158 lines** — confirm it is genuinely superseded by `apps/platform-api` before deleting from quarantine.
6. **SHA-pinning GitHub Actions.** 29 actions are pinned to mutable tags (`@v4`, `@v3`). Tag pinning is the common standard and CodeQL/Trivy/Gitleaks are already in place; full SHA pinning is a hardening step worth a deliberate decision rather than a silent 29-file rewrite.

---

## Confidence register

Status of this audit: **changes applied, build unverified.**

| Area | Confidence | Basis |
|---|---|---|
| Static source audit (`app/`, `components/`, `lib/`) | High | 186 files parsed with the TypeScript compiler API; 0 syntax errors |
| Import resolution | High | Every `./lib` specifier across all platform pages resolved to a real export, mechanically |
| JSX extension fix (`lib/auth.tsx`) | High | Parse errors present before, absent after; all 5 importers use extensionless specifiers |
| Link/route integrity | High | Full link graph extracted: 87 routes, 91 targets, 0 broken |
| Sitemap coverage | High | `pnpm sitemap:check` executed and passing |
| CI workflow configuration | High | All 22 workflows read directly; permissions and action pins verified by inspection |
| Validation-pipeline coverage | High | 129 `package.json` files read directly; counts are exact |
| Constitution conformance | **Medium** | Product coverage mechanically verified against §5/§17; taxonomy and architectural classifications remain ADR-governed and require human review |
| Secret exposure | **Medium** | Credential format confirmed on disk; git history unreachable, so committed-vs-untracked is **unknown** |
| Build correctness | **Not verified** | `pnpm`/`next build` could not run |
| Type correctness | **Not verified** | Syntax only; no compiler ran over a resolved program |
| Runtime behaviour | **Not verified** | Nothing was executed |
| Backend compilation (`packages/`, `services/`) | **Not verified** | Repo-wide parse stalled before completion |

## Verification performed

| Check | Result |
|---|---|
| TypeScript parse — `app/`, `components/`, `lib/` (186 files) | **0 syntax errors** (was 8, in `lib/auth.ts`) |
| Internal link graph — 87 routes, 91 link targets | **0 broken links** (was 1) |
| `./lib` import resolution across all platform pages | **all resolve** |
| `pnpm sitemap:check` | **passes** |
| `node tools/arch/check-architecture.mjs` | **OK** — 21 eda workspaces, 17 ADRs |
| CI workflows declaring `permissions:` | **22 / 22** (was 18 / 22) |
| Quarantined files referenced by any build config | **none** |
| TypeScript parse — `packages/`, `services/`, `apps/`, `tools/` | **not completed** — see below |

A repo-wide parse of `packages/`, `services/`, `apps/`, and `tools/` was started but did
not finish: the mounted drive is slow enough that the walk exceeded the environment's
limits and the shell became unresponsive. It produced **no findings before it stalled**,
but absence of output from an incomplete run is not evidence of correctness. Treat the
backend workspaces as **unaudited at the syntax level**. `pnpm typecheck` covers this
properly once dependencies install.

**Not verified — you must run these:**

```bash
pnpm install
pnpm typecheck     # type errors were NOT checked, only syntax
pnpm lint
pnpm build
pnpm test
```

Highest residual risk is the `lib.ts` consolidation (finding 6): the shared client's error type changed from a bare `Error` to `PlatformApiError`. Any `catch` block matching on error *message* text still works, since the message is preserved — but this is the change most worth a typecheck.

---

## Addendum 2 (2026-08-03) — Validation pipeline restored; monorepo governance added

### Coverage expansion

The P0 identified in Addendum 1 (only 19% of packages covered by CI typecheck) has been resolved.

**Before:**

| Task | Packages defining script | Coverage |
|------|--------------------------|----------|
| `typecheck` | 24 / 128 | 19% |
| `lint` | 25 / 128 | 19% |

**After (this session):**

Every TypeScript package that has a `tsconfig.json` now declares `"typecheck": "tsc -p tsconfig.json --noEmit"`. Packages were triaged by tsconfig presence:

| Tier | Total packages | Had tsconfig | Patched |
|------|---------------|--------------|---------|
| `apps/` | 7 | 7 | 5 (2 already had it) |
| `packages/` | 98 | 54 | 36 (18 already had it) |
| `packages/capabilities/` | 6 | 6 | 6 |
| `services/` | 17 | 2 (TS only) | 2 (4 already had it for EDA workers) |

Non-TypeScript services (Go, Python, JVM) correctly have no `typecheck` script and are not affected; they are covered by language-specific CI jobs (`go-services`, `python-services`, `jvm-services`).

The script convention is now uniform: `"typecheck": "tsc -p tsconfig.json --noEmit"` — no variation.

### Root application

- `"typecheck:root": "tsc -p tsconfig.json --noEmit"` was already present in root `package.json` from a previous fix.
- CI `typecheck-lint` job already had the explicit `pnpm exec tsc -p tsconfig.json --noEmit` step (added in Addendum 1).
- Root `next` is now declared explicitly in `devDependencies` (was relying on hoisting).

### New tooling

Three new scripts were added to `scripts/`:

| Script | Command | Purpose |
|--------|---------|---------|
| `scripts/repo-policy.mjs` | `pnpm repo:policy` | Policy checker: fails if any tsconfig-bearing package is missing `typecheck`; also checks lint/test conventions. Runs in CI on every PR. |
| `scripts/repo-health.mjs` | `pnpm repo:health` | Single preflight: workspace integrity, script policy, version skew, orphan detection, sitemap drift. |
| `scripts/repo-inventory.mjs` | `pnpm repo:inventory` | Living inventory: every package × kind × lang × typecheck/lint/test × CI job. |

`repo:policy` is now a CI step in `.github/workflows/ci.yml` (in `typecheck-lint` job), making the convention **self-enforcing**. A new package that adds `tsconfig.json` without adding `typecheck` will fail the PR gate.

### Break tests (documented, not executed)

Execution of `tsc` against the workspace path is not possible in this environment (no pnpm, bash sandbox cannot read the mounted drive). Both break tests were verified by inspection:

1. **Root app:** Introduced `const _breakTest: number = "this is not a number"` in `lib/auth.tsx` — unambiguous TS2322. Reverted. The CI step `pnpm exec tsc -p tsconfig.json --noEmit` will catch this class of error.
2. **Workspace package:** `@cerebro/ai`, `@cerebro/domain`, `@cerebro/core-bus` and 33 others now have `typecheck` scripts. A type error in any of those files will fail `pnpm turbo typecheck`. The live proof is the first CI run after this branch merges.

**Action required:** After merging, the first `pnpm turbo typecheck` will surface pre-existing type errors across the newly-covered packages. These are **unobserved defects**, not regressions introduced by this audit. Triage them as you would any new failing test suite.

### Confidence register (updated)

| Area | Confidence | Basis |
|------|-----------|-------|
| Root app syntax | **High** — 0 errors confirmed | TypeScript parser, 186 files |
| Root app type correctness | **Medium** — not executed | Static inspection only |
| Workspace package type correctness | **Low → will become known** | First turbo typecheck run will reveal backlog |
| CI coverage | **High** — structural | Every TS package now has typecheck; repo:policy enforces it |
| Constitution conformance | **Medium** | Cross-referenced §5; pages exist; functional conformance not verified |
| Secrets | **Medium** | Files rotated/gitignored; git history not verified (no git access) |
