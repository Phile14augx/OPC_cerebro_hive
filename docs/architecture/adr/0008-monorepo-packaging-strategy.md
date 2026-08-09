# 0008: Monorepo Packaging Strategy (Source-First vs. Built-Artifact Consumption)

## Status
Accepted (2026-08-01) — Option A, implemented and verified for `@cerebro/auth`, the confirmed-affected package. See Implementation Notes for exact scope and what remains.

## Context

During CI-failure triage (2026-07-31), two unrelated toolchains failed for the same underlying reason, independently:

1. **`apps/forge` (Next.js/Turbopack)**: build failed with "Turbopack build failed with 62 errors," all `Module not found` on relative imports inside shared packages that use explicit `.js` extensions pointing at sibling `.ts` files (e.g. `packages/auth/src/middleware/express.ts` importing `from "../jwt/verify.js"`, where only `verify.ts` exists). `tsc` resolves this correctly under `moduleResolution: "node16"` (it's a deliberate, valid TypeScript authoring pattern); Turbopack, consuming the package's raw TypeScript source directly, does not.

2. **`apps/platform-api` (plain `tsc`)**: typecheck failed on `../../packages/auth/src/hooks/index.ts` and `packages/auth/src/index.ts` with `'--jsx' is not set` and downstream type errors, because `platform-api` (a backend service with no JSX configuration) transitively imports `@cerebro/auth`, which mixes plain TypeScript utilities with React components/hooks/contexts (`.tsx` files) in the same package, all reachable through one `"main"` entry point.

Both failures trace to the same structural cause: shared packages under `packages/*` declare `"main": "src/index.ts"` (or equivalent) in `package.json`, exposing raw, unbuilt TypeScript/TSX source as their public interface. `tsc` (the tool these packages were presumably authored against) tolerates this. Two other real consumers — a bundler (Turbopack) and a second, independent `tsc` invocation with different compiler options (no JSX) — do not.

**Confirmed evidence of scope**, gathered directly, not inferred:
- Six packages use the `.js`-suffixed internal relative-import pattern: `auth`, `db`, `errors`, `queue`, `shared-types`, `swarm-sdk`.
- `turbo.json` already defines `"build": { "dependsOn": ["^build"] }` — the dependency-ordered build graph a `dist/`-first strategy would need already exists in the pipeline definition.
- `.github/workflows/ci.yml`'s `Build` matrix job runs `pnpm --filter "${{ matrix.app.filter }}" run build` directly — **not** `turbo build`, so it does not go through the dependency-ordered pipeline above. In a fresh checkout, workspace package dependencies are never explicitly built before the app build step runs.
- Every package inspected (`domain-model`, `auth`, `db`, `config`, others) has a working `"build": "tsc"` script; none of these build scripts are wired into the app-level CI build today.

This is not a hypothetical concern — it has now broken two independent toolchains in the same repository in the same day, for the same root cause.

## Decision

**Option A** — built `dist/` output as the canonical public interface. Chosen because it's the only option that generalizes: it works identically for every current and future consumer (already independently broken twice — Turbopack and a JSX-free `tsc` invocation — with no reason to expect a third tool wouldn't hit the same wall), and `turbo.json` already had the dependency-ordered build graph (`dependsOn: ["^build"]`) this approach needs, meaning the infrastructure cost was mostly configuration, not new tooling.

Two candidate options were evaluated, with different tradeoffs:

### Option A — Built artifacts (`dist/`) as the canonical public interface
Each shared package's `"main"`/`"exports"` point at its compiled `dist/` output, not `src/`. Consumers only ever see plain, already-resolved `.js` + `.d.ts` — no bundler- or tsconfig-specific resolution behavior involved.

- **Advantages**: Works uniformly across every current and future consumer (Turbopack, plain `tsc`, NestJS, esbuild, vitest, anything) because it's just standard Node module resolution — no tool-specific configuration needed. Decouples a package's internal authoring choices (JSX, `.js`-extension imports, target ES version) from what consumers must accommodate. `turbo.json`'s `dependsOn: ["^build"]` already models the required ordering.
- **Consequences**: `ci.yml`'s Build job needs to actually go through Turborepo's pipeline (or an explicit pre-build step) instead of a bare `pnpm --filter <app> run build`, so dependency packages build first in a fresh checkout. Adds a build step to local dev loops unless paired with `turbo watch`/incremental builds. `dist/` and `src/` can drift if a package's build script silently fails or is stale — needs the build step to be a real, enforced gate, not optional.

### Option B — Source-first consumption, consumers adapt
Keep `"main": "src/index.ts"` as-is; instead fix each consumer (Turbopack config, `tsc` config, NestJS build config, etc.) to correctly resolve `.js`→`.ts` and to not require JSX where it isn't needed.

- **Advantages**: No build step in the loop; source is always current, no `dist`/`src` drift possible. Matches the pattern already working today for `tsc`-only consumers of JSX-free packages (e.g. `packages/domain-model`).
- **Consequences**: Requires per-tool configuration (Turbopack resolve rules, possibly separate tsconfigs per consumer type), which has already independently broken twice for two different tools — a third tool (a future esbuild- or Vite-based consumer, for instance) would need its own accommodation too, with no guarantee it's even possible for every tool. Doesn't resolve the more fundamental problem that `@cerebro/auth` (and potentially others) mix JSX-bearing and JSX-free code behind one entry point — that would need splitting into separate exports/subpaths (e.g. `@cerebro/auth/react` vs `@cerebro/auth/core`) regardless of the dist-vs-source choice, since a backend service should not need JSX configuration to resolve backend-relevant exports from an auth package.

### Not a real third option, but a necessary sub-decision either way
Whichever option is chosen, `@cerebro/auth` (and any other package mixing React-specific and framework-agnostic exports in one entry point) should likely expose separate entry points for its UI and non-UI surfaces. `platform-api`'s failure specifically was triggered by needing something from `@cerebro/auth` and transitively pulling in `.tsx` files it will never render. This is orthogonal to the dist/source question — it's about the granularity of what's exported, not how it's built.

## Alternatives Considered

Already covered above as Option A vs. Option B, since this ADR's purpose is to present that choice rather than default to one. No third option was found that avoids the packaging question entirely — every consumer that needs a shared package must resolve it somehow, and the two failures above show the current approach (source-first, no consumer accommodation) is not tenable as-is.

## Consequences

- **If left undecided**: `apps/forge` and `apps/platform-api` remain broken in CI, and any new consumer of these six packages (or others authored the same way) is likely to hit the same class of failure, discovered only when that consumer's build runs — as happened twice already.
- **Positive (either option, once chosen)**: A single, explicit, documented answer to "how do I consume a shared package" removes the need to rediscover this per-incident, which is what happened today.
- **Negative (either option)**: Real implementation work either way — Option A needs CI build-step and possibly `package.json` changes across at least 6 packages; Option B needs per-consumer tooling configuration that has already proven fragile twice.

## Implementation Notes

**Scope of what was actually done**: `@cerebro/auth` only — the one package confirmed (not assumed) to be breaking real consumers. The other five packages flagged in Context (`db`, `errors`, `queue`, `shared-types`, `swarm-sdk`) still use `"main": "src/index.ts"` and were left untouched, because none of them have been shown to break a real consumer via this mechanism: `db`'s `.js`-suffixed imports resolve fine through every consumer that's actually been tested (`forge-api` via `nest build`); `errors`, `queue`, and `shared-types` have no `package.json` at all and are not consumed by any workspace package (`grep` for `"@cerebro/errors"` etc. across every `package.json` returns nothing) — they are dead directories, not live packages, and out of scope for this ADR. Applying Option A to unconfirmed packages would have been the exact kind of speculative work this repository's own governance findings (`SPECIFICATION-GOVERNANCE-FINDING.md`) warn against.

**What changed in `@cerebro/auth`**:
- Split the single `src/index.ts` barrel (which mixed JSX-bearing `contexts/AuthContext.tsx` and `providers/MockAuthProvider.tsx` with framework-agnostic `jwt/verify.ts`, `rbac/permissions.ts`, `middleware/express.ts`) into two new barrels: `src/server.ts` (no JSX — types, interfaces, JWT, RBAC, Express middleware) and `src/react.ts` (types, interfaces, context, hooks, mock provider). `src/index.ts` unchanged, still exports everything, for `dist/index.js` as the default entry.
- `package.json`: `"main"`/`"types"` now point at `dist/index.js`/`dist/index.d.ts` (not `src/`); added an `"exports"` map with `.`, `./server`, and `./react` subpaths.
- Updated all three real consumers to import from the correct subpath instead of the bare package: `apps/forge` (`useUser`, `MockAuthProvider`) → `@cerebro/auth/react`; `apps/platform-api` (`AuthMiddleware.ts`) and `services/forge-api` (`jwt.guard.ts`, `express.d.ts`) → `@cerebro/auth/server`.
- `apps/platform-api/tsconfig.json`: added a local `"module": "node16"` / `"moduleResolution": "node16"` override (its inherited config, from `packages/domain/tsconfig.json`, predates `exports`-map-aware resolution and doesn't support subpath exports at all). Scoped to `platform-api` only — confirmed nothing else extends that base config.
- `.github/workflows/ci.yml`: added a `Build @cerebro/auth` step (`pnpm --filter @cerebro/auth run build`) to the same 4 jobs already patched for dual Prisma generation (`typecheck`, `unit-tests`, `integration-tests`, `build` matrix), since a fresh checkout has no `dist/` until it's built.

**Verified** (simulating a fresh checkout by removing `packages/auth/dist` before each check):
- The original, confirmed root cause is completely gone from both apps: `apps/forge`'s Turbopack build no longer shows any `.js`→`.ts` resolution errors from `@cerebro/auth`; `apps/platform-api`'s `tsc --noEmit` no longer shows any `'--jsx' is not set` or JSX-related errors.

**What remains — explicitly NOT resolved by this ADR**:
- `apps/forge`'s build still fails, but now on a completely different, unrelated problem: 56 Turbopack errors, all "Export X doesn't exist in target module" against `@cerebro/ui` (`Button`, `Card*`, `Dialog*`, `Table*`, `ThemeProvider`, etc.). Not investigated — this is a `@cerebro/ui` export/API-mismatch bug, unrelated to packaging.
- `apps/platform-api`'s `tsc --noEmit` still reports 18 real errors — the same ones already catalogued before this ADR was accepted: `bootstrap.ts` unknown-typed catch variables, a Fastify plugin registration type mismatch (`'bus' does not exist in type 'FastifyRegisterOptions'`), missing `express`/`@prisma/client` dependencies, `RequestLogger.ts`'s `routerPath` (likely a Fastify version rename), and several `string | undefined` strict-null gaps. None of these are packaging-related; they were deliberately deferred pending this ADR and should be picked up as their own, separate work now that this is resolved.
- `packages/db`, `errors`, `queue`, `shared-types`, `swarm-sdk` remain source-first. If any of them is later shown to break a real consumer the way `auth` did, the same Option A treatment (split if it mixes concerns, point `main`/`exports` at `dist/`, add a CI build step) should be applied — do not apply it speculatively ahead of that evidence.

## Related ADRs
- `docs/adr/0001-monorepo.md` — establishes the monorepo package-boundary philosophy this ADR extends into a consumption-mechanics question.
- `docs/architecture/adr/0005-kernel-lifecycle-management.md`, `0007-runtime-lifecycle-contract.md` — prior ADRs in this same sequence; numbering continues from `0007`.
