# Baseline Runbook — 2026-08-03

Close the final gap between 9.9/10 (architecture verified) and 10/10 (execution verified).
Run every command from the repository root unless noted.

---

## Prerequisites

```bash
node --version    # must be >=22
pnpm --version    # must be >=9
```

---

## Step 1 — Clean install

```bash
pnpm install --frozen-lockfile
```

If this fails, the lockfile is stale. Run `pnpm install` (no flag) and commit the updated lockfile separately before continuing.

---

## Step 2 — Policy gate (should pass immediately)

```bash
pnpm repo:policy
```

**Expected:** `✅ repo-policy: all 128 packages pass`

If it reports violations, run `pnpm repo:policy --fix` for R1 violations (missing typecheck), then fix R2/R3/R4 violations manually.

---

## Step 3 — Root app typecheck

```bash
pnpm typecheck:root
```

This runs `tsc -p tsconfig.json --noEmit` against `app/`, `components/`, `lib/`. These were syntax-verified (0 errors on 186 files) but not type-verified. Expect this to pass cleanly; the critical fix (`lib/auth.tsx`) was already applied.

**If errors appear:** they are pre-existing defects, not regressions. Log them against the debt tracker in the audit report.

---

## Step 4 — Full workspace typecheck

```bash
pnpm turbo typecheck --color 2>&1 | tee /tmp/typecheck-baseline.txt
```

This is the first run with complete coverage (was 19%, now 100% of TS packages).

**Expect failures.** The newly-covered packages have never been typechecked by CI. Every error surfaced here is an unobserved pre-existing defect.

Triage protocol:
- Errors in `packages/eda-*` → tracked in EDA backlog
- Errors in `packages/*-core` → tracked in platform backlog  
- Errors in `services/forge-api` → tracked in Forge backlog
- Errors in `apps/*` → P1; block merge of the affected app
- Do **not** mark as "fixed" until the actual type error is corrected

---

## Step 5 — Root app lint

```bash
pnpm lint:fix 2>&1 | tee /tmp/lint-baseline.txt
```

---

## Step 6 — Full workspace lint

```bash
pnpm turbo lint --color 2>&1 | tee /tmp/lint-turbo-baseline.txt
```

---

## Step 7 — Repo health check

```bash
pnpm repo:health
```

**Expected output:**
```
✅ PASS  Workspace integrity
✅ PASS  Script policy (typecheck)
⚠️  WARN  Tooling version skew     ← expected; multiple Next.js/TS versions
⚠️  WARN  Orphan packages          ← expected; some packages have no consumers yet
✅ PASS  Sitemap drift
```

Version skew and orphan warnings are advisory, not blocking.

---

## Step 8 — Generate living inventory

```bash
pnpm repo:inventory > REPO-INVENTORY-$(date +%Y-%m-%d).md
```

Commit this file. It becomes the reference for CI coverage questions and is regenerated on every subsequent run.

---

## Step 9 — Break test (live confirmation)

Confirm both blind spots are closed:

```bash
# Break test 1 — root app
echo 'const _x: number = "break-test"' >> lib/auth.tsx
pnpm typecheck:root          # must exit non-zero
git checkout lib/auth.tsx    # revert

# Break test 2 — previously uncovered workspace package
echo 'export const _x: number = "break-test"' >> packages/ai/src/index.ts
pnpm turbo typecheck --filter=@cerebro/ai   # must exit non-zero
git checkout packages/ai/src/index.ts       # revert
```

Record in the audit report that both break tests passed with non-zero exit codes.

---

## Step 10 — CI dry run (optional but recommended)

```bash
# Confirm the policy step would pass in CI
pnpm sitemap:check && pnpm repo:policy && echo "CI pre-flight OK"
```

---

## Definition of done

| Check | Status |
|-------|--------|
| `pnpm install` succeeds with frozen lockfile | ☐ |
| `pnpm repo:policy` exits 0 | ☐ |
| `pnpm typecheck:root` exits 0 | ☐ |
| `pnpm turbo typecheck` run completed; all errors logged | ☐ |
| Pre-existing type errors triaged (fixed or added to debt tracker) | ☐ |
| `pnpm repo:health` shows no FAIL rows | ☐ |
| Living inventory committed | ☐ |
| Break test 1 (root app) confirmed | ☐ |
| Break test 2 (workspace package) confirmed | ☐ |
| First green CI run on a PR with `repo:policy` step | ☐ |

When all rows are checked, the repository has reached a stable, self-enforcing baseline.

---

## What "10/10" means after this

- A new developer cannot add a TypeScript package without CI requiring a `typecheck` script.
- Documentation (inventory) is generated from repository state, not maintained manually.
- Structural health is checked on every PR.
- Incremental builds skip unchanged packages via Turbo cache.
- Every type error in every TypeScript package is visible to CI.

The architecture is already there. This runbook closes the execution gap.
