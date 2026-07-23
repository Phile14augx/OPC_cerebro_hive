# Coding Conventions

**Analysis Date:** 2026-07-23

This is a pnpm/turborepo monorepo with two distinct stacks that follow different conventions:

- **Python backend** — `apps/studio/agentos/` (FastAPI, SQLAlchemy, pytest). A standalone service with its own `Dockerfile`/`docker-compose.yml`.
- **TypeScript/Next.js frontends** — `apps/studio/` (primary, actively developed — marketing site + platform UI + `platform/` domain backend), `apps/forge/` (minimal Next.js scaffold), `apps/platform-api/` (scaffold), plus `apps/archive`, `apps/flow`, `apps/insight`, `apps/ops`, `apps/search` (currently empty directories, not yet scaffolded). Shared code lives in `packages/*` (`@cerebro/*` workspace packages: `ui`, `domain`, `database`, `auth`, `ai`, `workflow`, `contracts`, etc.).

No repo-wide `CONTRIBUTING.md` was found. Enforced conventions come from tooling config: root `.pre-commit-config.yaml` (gitleaks secret scan, must be installed manually per `pre-commit install`), root `.gitleaks.toml` (secret-scanning allowlist), and per-app `eslint.config.mjs`/`tsconfig.json`. There is no repo-wide ESLint or Prettier config at the root — each Next.js app configures its own via `eslint-config-next`.

## Python Backend Conventions (`apps/studio/agentos/`)

**No linter/formatter config detected** — no `pyproject.toml`, `ruff.toml`, `.flake8`, or `mypy.ini` in `apps/studio/agentos/`. Style is enforced only by convention/review, not tooling. Do not assume `black`/`ruff` will reformat on commit; match the surrounding file's style manually.

### Naming Patterns

**Files:** `snake_case.py` throughout — `ledger_engine.py`, `rate_limit.py`, `test_finance.py`. Domain modules are directories under `app/` (`app/finance/`, `app/platform/`, `app/core/`), each with `__init__.py`, `models.py`, `router.py`, and domain-specific engine files (e.g. `app/finance/ledger_engine.py`, `app/finance/categorizer.py`, `app/finance/automation.py`).

**Functions/variables:** `snake_case` — `post_journal_entry`, `account_balance`, `_require_org`. Leading underscore (`_require_org`, `_seed_chart_of_accounts`, `_uuid`, `_now`) marks module-private helpers not meant to be imported elsewhere.

**Classes:** `PascalCase` for SQLAlchemy models (`Account`, `JournalEntry`, `Invoice`), Pydantic schemas (`AccountCreate`, `AccountOut`, `InvoiceOut`), and error types (`LedgerError`).

**Pydantic schema suffixes:** `*Create` for POST request bodies, `*Out` for response models. This pairing is consistent across every router (`AccountCreate`/`AccountOut`, `PartyCreate`/`PartyOut`, `JournalEntryCreate`/`JournalEntryOut`). Follow this suffix convention for any new endpoint schema.

**Constants:** `UPPER_SNAKE_CASE` module-level tuples/dicts, e.g. `ACCOUNT_TYPES = ("asset", "liability", "equity", "revenue", "expense")` in `app/finance/models.py`.

### Module Structure Pattern

Every domain module (see `app/finance/` as the reference implementation) follows:
1. `models.py` — SQLAlchemy `Mapped`/`mapped_column` declarative models only. No business logic or validation here — "SQLAlchemy models stay dumb, validation lives in the engine so it's testable independent of the ORM" (`app/finance/models.py` module docstring).
2. `<domain>_engine.py` (e.g. `ledger_engine.py`) — plain Python functions operating on a `Session`, framework-independent, unit-testable without FastAPI or HTTP.
3. `router.py` — thin FastAPI `APIRouter` layer: Pydantic request/response schemas, dependency injection (`Depends(get_db)`, `Depends(get_current_api_key)`), and translation of domain exceptions to `HTTPException`. No direct business logic beyond validation glue.
4. `automation.py` (where applicable) — orchestration across engine + governance.

When adding a new domain module, mirror this four-file split rather than putting logic directly in the router.

### Type Hints

`from __future__ import annotations` is used at the top of files with forward-referenced types (`app/finance/router.py`, `app/finance/ledger_engine.py`). Modern union syntax (`str | None`) is used throughout instead of `Optional[str]`. SQLAlchemy 2.0-style `Mapped[T]` / `mapped_column(...)` typed columns are used exclusively — no legacy `Column(...)` declarations.

### Docstrings

Every module has a top-of-file docstring explaining *why* the module exists and its invariants, not just what it contains — e.g. `app/finance/ledger_engine.py`:
```python
"""The actual accounting logic: post a balanced double-entry transaction,
compute an account's running balance, and produce a trial balance. Kept
independent of FastAPI/Pydantic so it's testable as plain functions...
"""
```
Class docstrings explain business meaning, not just structure (`Account`, `JournalEntry` in `app/finance/models.py` each explain the accounting concept they represent). Follow this pattern for new modules: explain the *invariant* the module enforces and *why* it's structured the way it is, in the module/class docstring.

### Error Handling

**Domain errors** are custom exception subclasses of a built-in (e.g. `class LedgerError(ValueError)` in `app/finance/ledger_engine.py`), raised deep in the engine layer with a human-readable message.

**Routers** catch the domain exception and translate to `HTTPException` with `from exc` chaining:
```python
try:
    entry = ledger_engine.post_journal_entry(db, ...)
except LedgerError as exc:
    raise HTTPException(400, str(exc)) from exc
```
Use this pattern — a dedicated `ValueError` subclass per domain, caught once in the router — for any new domain module rather than raising `HTTPException` from inside engine functions.

**Guard clauses** raise early with a specific message rather than nesting: see `_require_org` in `app/finance/router.py`, or the sequential validation checks in `ledger_engine.post_journal_entry` (line count, non-negative amounts, single debit-or-credit, balance check — each its own `raise LedgerError(...)` with a distinct message).

**Comments explain "why", not "what"** — nearly every non-trivial function has an inline or docstring comment justifying a design decision (e.g. why `_BALANCE_TOLERANCE = 0.005` exists, why both debit and credit are stored on `JournalLine` instead of a signed amount). Match this density of rationale-comments in new code.

### Security-Sensitive Code

`hmac.compare_digest` is used for constant-time secret comparison (`app/security.py::require_admin_secret`) — always use this instead of `==` when comparing secrets/tokens. API keys are generated with `secrets.token_urlsafe(32)`, prefixed `aos_` (`app/security.py::generate_api_key`).

### Multi-Tenancy Pattern

Every domain query filters on `organization_id`. Routers call a `_require_org(key)` guard (raises `HTTPException(400, ...)` if the API key predates the org column) before any query. New endpoints in any domain module must follow this same tenant-scoping pattern — never query without an `organization_id` filter.

### FastAPI Router Conventions

- `router = APIRouter(prefix="/<domain>", tags=["<domain>"])` at module top.
- Every handler takes `db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)` as its last parameters.
- `response_model=` is always declared explicitly on the decorator.
- `status_code=201` explicit on POST/create endpoints.
- Pydantic schemas use `model_config = ConfigDict(extra="forbid")` on every `*Create`/input schema to reject unknown fields (returns 422) — apply this to any new input schema.
- Section-header comments (`# ─── Accounts ────...`) divide a router file into logical groups (see `app/finance/router.py`).
- Audit logging: every mutating endpoint writes an `AuditLog(actor=key.owner, action="<domain>.<entity>.<verb>", target=<id>, meta={...})` row and commits it after the primary commit. Follow `<domain>.<entity>.<verb>` (dot-separated, past-tense verb) for the `action` string on any new mutation.

## TypeScript / Next.js Frontend Conventions

Primary reference: `apps/studio/` (actively developed; contains the marketing site under `app/`, `components/`, `lib/`, plus a separate domain backend under `apps/studio/platform/`). `apps/forge/` and `apps/platform-api/` are minimal, largely-unpopulated scaffolds with their own `package.json`/`tsconfig.json` but should be treated as not-yet-conventionalized.

### Linting & Formatting

- ESLint via `eslint.config.mjs` (flat config), extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` (`apps/studio/eslint.config.mjs`). Run per-app with `next lint` (wired as `"lint"` script) or repo-wide via `turbo lint`.
- No Prettier config found in `apps/studio` specifically, but the root `package.json` has a `"format": "prettier --write \"**/*.{ts,tsx,md}\""` script — prettier is available repo-wide with default settings (no `.prettierrc` — defaults apply: double quotes off, semicolons on, etc., per Prettier's own defaults).
- `tsconfig.json` per app: `"strict": true` is set everywhere checked (`apps/studio`, `apps/forge`). `apps/studio` targets `ES2017`, `moduleResolution: "bundler"`; `apps/forge` targets `ES2022`, `moduleResolution: "node"` — the two apps are not aligned on TS config, don't assume identical resolution behavior between apps.
- Path alias `@/*` maps to the app root in every Next.js app's `tsconfig.json`. `apps/studio` additionally aliases `@cerebro/ai`, `@cerebro/workflow`, `@cerebro/database` directly to package source (not `dist`) for workspace packages.

### Naming Patterns

**Files:**
- React components: `PascalCase.tsx` (`GlassCard.tsx`, `AnimatedButton.tsx`, `ThemeToggle.tsx` in `apps/studio/components/ui/`).
- Next.js App Router special files: lowercase (`page.tsx`, `layout.tsx`, `route.ts`) per Next.js convention, inside route-segment folders including parenthesized route groups (`app/(auth)/login/`, `app/(platform)/studio/`).
- Library/service modules: **mixed** — `auth.service.ts`, `audit.service.ts`, `platform.service.ts` use dot-suffix `*.service.ts` (`apps/studio/lib/services/`), but `organizationService.ts` in the same directory uses `camelCase` with no dot. When adding a new service in `lib/services/`, prefer the dominant `*.service.ts` pattern (3 of 4 existing files) for consistency, but expect to encounter both.
- Domain backend (`apps/studio/platform/src/`): `kebab-case.ts` / lowercase module files (`policy.ts`, `events.ts`, `memory-bus.ts`, `id.ts`) under `src/kernel/<subsystem>/`.

**Classes:** `PascalCase`, often static-method-only "service" classes acting as namespaces (`AuthService`, `PlatformService`, `AuditService` in `apps/studio/lib/services/`) — all methods are `static async`, the class is never instantiated. New services following the `lib/services/*.service.ts` pattern should follow this static-class style, not instance-based.

**React components/hooks:** `PascalCase` for components (`GlassCard`), `camelCase` with `use` prefix for hooks (`useCerebroMotion` in `components/motion/foundation/MotionProvider`).

**Types/interfaces:** `PascalCase`, props interfaces suffixed `Props` (`GlassCardProps extends React.HTMLAttributes<HTMLDivElement>`).

### Import Organization

No enforced import-order rule detected (no `eslint-plugin-import`/`simple-import-sort` config found). Observed convention in most files: external packages first, then relative imports, roughly grouped but not strictly sorted (see `apps/studio/lib/services/auth.service.ts`: `@/lib/prisma`, `bcryptjs`, `jose`, then local relative service imports). `@/*` alias preferred over deep relative paths in most `lib/`/`components/` code, but some files under `app/api/v1/talent/**` use long relative paths (`../../../../../lib/talent/...`) instead of `@/` — prefer `@/` for new code.

### Component Design

- `React.forwardRef` used for components that wrap a DOM element and need ref passthrough (`GlassCard` in `apps/studio/components/ui/GlassCard.tsx`), with `displayName` set explicitly afterward.
- Utility-class merging via `cn()` from `@/lib/utils` (clsx + tailwind-merge convention) wraps every `className` composition — always use `cn(...)` rather than template-string concatenation for conditional Tailwind classes.
- Variant props modeled as a `Record<string, string>` lookup object (`intensityClasses` in `GlassCard.tsx`) indexed by a typed prop union (`"low" | "medium" | "high"`), rather than long ternary chains — follow this pattern for new components with a small fixed set of visual variants.
- Framer Motion (`framer-motion`) is the animation library; motion variants come from a shared `useCerebroMotion()` hook/provider rather than being defined inline per component.

### API Route Conventions (Next.js Route Handlers, `app/api/**/route.ts`)

**Two co-existing patterns** — be aware of both, but prefer the guard+zod pattern (below) for new routes outside the `talent` module:

1. **`lib/security/guard.ts` + zod pattern** (used by top-level routes like `app/api/leads/route.ts`, `app/api/contact/route.ts`, `app/api/tickets/route.ts`):
   - Call `guardMutatingRequest(request, { routeName, limit, windowMs })` (origin check + rate limit + body-size check) or `guardReadRequest(...)` first; early-return its `.response` if `!guard.ok`.
   - Parse body with `parseJsonBody(request)`, early-return on failure.
   - Validate with a zod schema's `.safeParse(...)`, return `NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })` on failure.
   - Wrap the actual mutation in `try/catch`, `console.error("API Error in <METHOD> <path>:", error)` on catch, return a generic `NextResponse.json({ error: "..." }, { status: 500 })` (never leak the raw error to the client).

2. **`ApiUtils` + `withAuthorization` pattern** (used inside `app/api/v1/talent/**`, see `app/api/v1/talent/assessments/route.ts`):
   - Wrap the handler body in `withAuthorization(req, '<PERMISSION>', '<resource>', async (req, userContext) => { ... })`.
   - Return via `ApiUtils.success(data, meta?, status?)`, `ApiUtils.error(message, status, error)`, or `ApiUtils.badRequest(message)` rather than constructing `NextResponse.json` directly.
   - Every response carries a `traceId` (see `ApiUtils` contract exercised in `tests/api/contract.test.ts`: `{ success, data, traceId }` / `{ success: false, error, traceId }`).

Both patterns always return typed JSON error bodies (`{ error: string }` or `{ success: false, error, traceId }`) with an explicit HTTP status — never throw an unhandled error out of a route handler.

### Error Handling (General)

- Backend/service layer: `throw new Error('<message>')` with a plain human-readable string (`apps/studio/lib/services/auth.service.ts`) — no custom error class hierarchy in the `lib/services/*.service.ts` layer.
- Domain backend (`apps/studio/platform/src/`) uses `expect(...).rejects.toThrow()` in tests, implying thrown `Error`s (or subclasses) from service methods like `platform.identity.authenticate(...)`.
- API routes never let a raw exception reach the client — always caught and mapped to a JSON error response with a safe message (see API Route Conventions above).

### Module/Package Design (`packages/*`)

Each `@cerebro/*` package (`packages/domain`, `packages/ui`, `packages/database`, etc.) is a thin workspace package: `package.json` with `"main": "./index.ts"` and `"types": "./index.ts"` pointing directly at TypeScript source (no build step for consumption within the monorepo — consumers import the `.ts` directly via the workspace protocol). Only `"lint": "eslint \"**/*.ts*\""` is defined as a script on most packages — no per-package `"test"` script (see TESTING.md for where real tests actually live).

### Comments

Both stacks favor **rationale comments** over restating code — explaining *why* a non-obvious choice was made (rate-limit thresholds, tolerance constants, security trade-offs) rather than describing *what* the next line does. Match this density when adding non-trivial logic.

---

*Convention analysis: 2026-07-23*
