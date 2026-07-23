# Testing Patterns

**Analysis Date:** 2026-07-23

Two independent testing stacks exist, matching the two independent tech stacks. **CI (`.github/workflows/ci.yml`) currently runs neither test suite** — the "Unit Tests" step (`pnpm run test`) is commented out, and there is no pytest step for the Python backend at all. Only type-check (`tsc --noEmit`), lint (allowed to fail via `|| true`), and `pnpm run build` run on every push/PR. Treat both suites below as developer-run-only until CI is updated.

## Python Backend Testing (`apps/studio/agentos/`)

### Test Framework

**Runner:** pytest `>=8.3` with `pytest-asyncio>=0.24` (`apps/studio/agentos/requirements.txt`). No `pytest.ini`/`pyproject.toml` pytest config section found — pytest runs with defaults (auto-discovers `tests/test_*.py`).

**HTTP client for tests:** `fastapi.testclient.TestClient` (backed by `httpx`).

**Run commands:**
```bash
cd apps/studio/agentos
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest                       # run all tests
pytest tests/test_finance.py # run one module
pytest -k test_name          # run by name
```

### Test File Organization

**Location:** All tests live in `apps/studio/agentos/tests/`, flat (no subdirectories), one file per domain area: `test_smoke.py` (end-to-end platform smoke tests across agents/runtime/governance/knowledge/tools/workflows/marketplace), `test_finance.py` (finance/ERP module), `test_mesh.py` (multi-agent mesh), `test_cortex_simulator.py`, `test_context_governance_observability.py`, `test_production_gates.py` (security/production-readiness gates: admin secret, rate limiting, body-size limits, security headers, strict schema validation).

**Naming:** `test_<module_or_feature>.py` for files; `test_<behavior_described_in_words>` for functions — function names are full sentences describing the behavior under test, e.g. `test_invoice_with_low_confidence_requires_approval_then_posts`, `test_posting_fails_cleanly_without_an_ap_control_account` (`tests/test_finance.py`). Follow this "test name reads as a spec sentence" convention for new tests — no abbreviated/generic names like `test_case_1`.

### Fixtures (`apps/studio/agentos/tests/conftest.py`)

```python
@pytest.fixture(autouse=True)
def _reset_db():
    # Full schema reset before every test — shared on-disk SQLite otherwise
    # leaks state (agents, policies, approvals) across test functions.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

@pytest.fixture(autouse=True)
def _reset_rate_limits():
    # slowapi's in-memory limiter is process-wide state; reset so legitimate
    # test traffic doesn't trip the same 429s a real abusive caller would.
    limiter.reset()
    yield

@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture()
def auth_headers(client: TestClient) -> dict:
    resp = client.post("/auth/api-keys", json={"owner": "test-suite"})
    token = resp.json()["api_key"]
    return {"Authorization": f"Bearer {token}"}
```

- `_reset_db` and `_reset_rate_limits` are `autouse=True` — every test gets full isolation for free, no per-test setup boilerplate needed.
- Test DB is SQLite (`DATABASE_URL=sqlite:///test_agentos.db`, forced in `conftest.py` before app import) — never Postgres, even though production uses Postgres. No dedicated Postgres integration test tier exists.
- All AI provider keys are forced empty (`ANTHROPIC_API_KEY=""`, etc.) so the app falls back to its deterministic mock LLM provider — the entire suite runs **fully offline**, zero external API calls, zero network dependency.
- `client` fixture wraps `TestClient(app)` in a context manager (triggers FastAPI lifespan startup/shutdown).
- `auth_headers` fixture mints a fresh API key scoped to a new organization — use this (or the `_new_org_headers(client, owner)` local helper pattern in `test_finance.py`) rather than hardcoding a token.

### Multi-Tenancy Test Pattern

Tests that need two isolated tenants call the auth endpoint twice with different `owner` values (each call auto-creates a new `Organization`) rather than manipulating the DB directly:
```python
def _new_org_headers(client, owner: str) -> dict:
    resp = client.post("/auth/api-keys", json={"owner": owner})
    return {"Authorization": f"Bearer {resp.json()['api_key']}"}
```
This is the standard way to assert tenant-isolation invariants (see `test_chart_of_accounts_is_isolated_between_organizations` in `tests/test_finance.py`).

### Assertion Style

Plain `assert` statements (pytest-native, no separate assertion library). Response-body assertions read the JSON directly: `assert resp.status_code == 201, resp.text` (message-on-failure pattern includes `resp.text` so a failing test shows the actual error body, not just the status code — use this `assert cond, resp.text` pattern for any status-code assertion on a mutation).

Multi-step workflow tests chain requests within one test function to exercise a full pipeline end-to-end (e.g. `test_invoice_with_confident_categorization_auto_posts` in `tests/test_finance.py` walks create-account → create-party → create-invoice → submit → assert-posted → assert-trial-balance-updated, all in one test) rather than isolating each API call into its own test.

### Mocking

No `unittest.mock`/`pytest-mock` usage found. Instead of mocking, the suite relies on:
- A **deterministic mock LLM provider** built into the app (activated automatically when no provider API key is set) — real code paths run, just against a fake model, rather than mocking the LLM client itself.
- `monkeypatch` (pytest built-in) for environment variables — e.g. `_set_admin_secret(monkeypatch, value)` in `tests/test_production_gates.py` sets/unsets `AGENTOS_ADMIN_SECRET` and clears the `get_settings()` `lru_cache` so the change takes effect.

### Coverage

No coverage tool (`pytest-cov`, `coverage.py`) configured. No enforced threshold.

### Test Types Present

- **Integration/API tests** (the large majority): full HTTP round-trip through `TestClient` against real routers, real (SQLite) DB, real business logic — this is the dominant test style, not unit tests against isolated functions.
- **Smoke tests** (`test_smoke.py`): one broad end-to-end pass across most subsystems (agent registry, runtime execution, governance blocking, knowledge search, tool invocation, workflow DAG execution, marketplace).
- **Security/production-gate tests** (`test_production_gates.py`): admin-secret gating, rate limiting (`test_key_issuance_rate_limit_kicks_in_after_10_per_minute`), request body size limits (413), security headers presence, strict schema rejection (422 on unknown fields / invalid patterns), DoS-guard on the knapsack optimizer input size.
- No pure unit tests isolated from FastAPI/DB were found for the engine layer (e.g. `ledger_engine.post_journal_entry` is only exercised indirectly through `tests/test_finance.py`'s HTTP-level tests, not called directly in a unit test) — if adding tests for a new `*_engine.py` module, consider adding direct function-level unit tests in addition to the router-level integration tests, since none currently exist as a pattern to follow.

## TypeScript/Next.js Frontend Testing

Two testing setups exist at different levels of maturity — **be aware they are not equivalent**:

### 1. `apps/studio/platform/` — Real, Wired-Up Vitest Suite (domain backend)

This is the only TS test suite in the repo that is both realistic and actually runs via its package's `"test"` script. `apps/studio/platform` is a separate Fastify-based domain backend package (`@cerebrohive/platform`) nested inside the `apps/studio` app directory.

**Framework:** Vitest `^4.1.10`.

**Config** (`apps/studio/platform/vitest.config.ts`):
```ts
export default defineConfig({
  css: { postcss: {} }, // stop vite walking up to the website's postcss config
  test: { include: ["test/**/*.test.ts", "src/**/*.test.ts"], environment: "node", testTimeout: 15000 },
});
```

**Run commands:**
```bash
cd apps/studio/platform
npm run test         # vitest run (single pass)
npm run test:watch   # vitest (watch mode)
```

**Test file organization:** All tests in `apps/studio/platform/test/`, one file per subsystem/domain group: `kernel.test.ts`, `domains.test.ts`, `hivecloud.test.ts`, `cerebroforge.test.ts`, `cerebrogrowth.test.ts`, `cerebroinsight.test.ts`, `cerebrostudio.test.ts`, `cerebroswarm.test.ts`, `governance-registries-ontology-web3.test.ts`, `router-compiler-swarm-actions.test.ts`, `worldmodel-digitaltwin-research-zerotrust-dataplatform.test.ts`, plus `helpers.ts` (shared test setup, not a test file itself). Imports use explicit `.js` extensions on relative imports even though source is `.ts` (ESM/`"type": "module"` requirement) — e.g. `import { newId } from "../src/kernel/ids/id.js"`.

**Test structure pattern** (`apps/studio/platform/test/kernel.test.ts`):
```ts
import { describe, expect, it } from "vitest";
import { testPlatform } from "./helpers.js";

describe("kernel", () => {
  it("generates sortable unique ids with recoverable time", () => {
    const a = newId("x"); const b = newId("x");
    expect(a).not.toBe(b);
  });

  it("authenticates api keys and rejects bad ones", async () => {
    const { platform } = await testPlatform();
    await expect(platform.identity.authenticate("chk_bogus")).rejects.toThrow();
  });
});
```
`describe`/`it`/`expect` are imported explicitly from `"vitest"` (no global injection configured) — always import them rather than relying on globals.

**Test data / fixture factory** (`apps/studio/platform/test/helpers.ts`):
```ts
export async function testPlatform(): Promise<{ platform: Platform; ctx: RequestContext }> {
  const platform = await buildPlatform({ withDatabase: false, startScheduler: false, config: { EVENT_BUS: "memory", LOG_LEVEL: "error" } as never });
  const boot = await platform.identity.bootstrapOrganization({ name: "Test Org", slug: `t-${Math.random().toString(36).slice(2, 8)}`, ownerEmail: "test@cerebropchive.org", ownerName: "Tester" });
  const principal = await platform.identity.authenticate(boot.apiKey.secret);
  return { platform, ctx: { principal, requestId: "test", traceId: "test-trace" } };
}
```
The whole platform is built **in-memory** (`withDatabase: false`, `EVENT_BUS: "memory"`) — no real Postgres/NATS/Redis connection needed to run this suite; call `testPlatform()` (or the module-specific equivalent) to get a ready `{ platform, ctx }` pair rather than constructing dependencies by hand.

**Assertion style:** Native vitest `expect(...).toBe(...)` / `.toEqual(...)` / `.rejects.toThrow()`. Multi-assertion tests exercise a whole invariant per `it()` block (e.g. `"enforces tenant isolation and role grants"` checks 4 different policy combinations in one test).

**Mocking:** No mocking library in use — the in-memory platform build (above) substitutes for mocking external infra. No `vi.mock(...)` usage found in the files inspected.

**Coverage:** No coverage tool configured for this package.

### 2. `apps/studio/` (root app) — Playwright Visual Regression + Unwired Skeleton Tests

**IMPORTANT for future Playwright work:** `apps/studio/package.json` has **no `"test"` script at all** — only `"test:e2e": "playwright test"`. `apps/studio/vitest.config.ts` exists but only configures a Storybook-interaction-test project (via `@storybook/addon-vitest`), pointed at `apps/studio/.storybook` — **which does not exist** (the only `.storybook/` directory in the repo is at the repo root, not inside `apps/studio`). There is also no `"storybook"` script in `apps/studio/package.json`. Treat the Storybook/Vitest wiring in `apps/studio` as **not currently functional** — do not assume `vitest` runs anything meaningful in this app today.

**Playwright** (`apps/studio/playwright.config.ts`) is the one actually-configured and runnable test tool in this app:
```ts
export default defineConfig({
  testDir: './tests/visual',
  timeout: 30 * 1000,
  expect: { timeout: 5000, toHaveScreenshot: { maxDiffPixels: 100 } },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: { command: 'npm run dev', port: 3000, reuseExistingServer: !process.env.CI },
});
```
- **`testDir: './tests/visual'`** — Playwright only picks up files under `apps/studio/tests/visual/`. Files in `apps/studio/tests/api/` and `apps/studio/tests/e2e/` are **not** matched by this config despite using `.test.ts` naming and `describe`/`it`/`expect` syntax — they appear to be written for a Jest/Vitest-style runner that isn't currently wired to run them (no matching script, no matching vitest `include` glob). Do not assume these files execute in any pipeline today; if picking up this area of work, either wire a real runner to `tests/api/`/`tests/e2e/` or migrate their intent into the Playwright suite.
- **`webServer`** auto-boots `npm run dev` on port 3000 before running tests (reused if already running outside CI).
- 5 browser/device projects run every spec: Desktop Chrome, Firefox, Safari (webkit), Pixel 5, iPhone 12.
- **Run command:** `cd apps/studio && npx playwright test` (or `npm run test:e2e`).

**Visual regression test structure** (`apps/studio/tests/visual/theme-parity.spec.ts`, `icons.spec.ts`, `apps/studio/tests/visual.spec.ts`):
```ts
import { test, expect } from '@playwright/test';

test.describe('Theme Motion Parity & Visual Regression', () => {
  test('Home Hero - Light Theme (Executive Blueprint)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(1500); // let animations settle before snapshot
    await expect(page).toHaveScreenshot('home-hero-light.png', { fullPage: true, maxDiffPixels: 200 });
  });
});
```
Patterns to follow for new visual tests:
- Theme switching is done by directly manipulating `document.documentElement.classList` + `localStorage.setItem('theme', ...)` via `page.evaluate(...)`, not through UI interaction with a toggle control.
- A fixed `page.waitForTimeout(...)` (1000–1500ms typical) is used to let animations/motion settle before snapshotting — there is no animation-completion event awaited.
- Per-test `maxDiffPixels` (absolute) or `maxDiffPixelRatio` (relative, e.g. `0.05` = 5%) overrides the global `expect.toHaveScreenshot` default of `maxDiffPixels: 100` — override when a page has more visual noise (e.g. `apps/studio/tests/visual.spec.ts` uses `maxDiffPixelRatio: 0.05` for full-page homepage/research-hub screenshots).
- `test.use({ colorScheme: 'light' | 'dark', reducedMotion: 'reduce' })` at the `describe` level sets per-suite browser emulation (`apps/studio/tests/visual/icons.spec.ts`) — use `reducedMotion: 'reduce'` for any new icon/component visual test to freeze CSS animations for a stable screenshot.
- Icon/component tests parameterize over a list and generate nested `test.describe` blocks per item (`ICONS_TO_TEST` loop in `icons.spec.ts`) rather than one test per icon written out by hand — follow this loop pattern when adding visual coverage for a new set of similar components.
- No committed baseline screenshots (`*-snapshots/` directories) were found alongside these spec files — running `npx playwright test` for the first time will generate baselines rather than compare against existing ones; use `npx playwright test --update-snapshots` deliberately when intentionally changing a UI's visual output.

**Storybook** (root `.storybook/main.ts`, `.storybook/preview.tsx`): configured but not wired to a run script anywhere in the repo, and `stories/` in `apps/studio` contains only the default Storybook CLI scaffold (`Button.tsx`, `Button.stories.ts`, `Configure.mdx`, default asset PNGs) — no actual product component stories exist yet. Treat Storybook as **scaffolded but unused**; do not assume any component in `apps/studio/components/` has a story today.

### API/E2E "Skeleton" Tests (`apps/studio/tests/api/*.test.ts`, `apps/studio/tests/e2e/platform.test.ts`)

These files exist and are well-organized by intent (`tests/api/assessments.test.ts`, `contract.test.ts`, `execution.test.ts`, `sessions.test.ts`; `tests/e2e/platform.test.ts` for the Talent OS pipeline) but, per the Playwright config above, are **not currently executed by any configured runner**. Their content is largely mocked/hand-constructed response objects rather than real HTTP calls:
```ts
describe('API Contract Tests', () => {
  it('should return a standardized success response structure', async () => {
    const mockResponse = { success: true, data: { status: 'OK' }, traceId: 'uuid-1234' };
    expect(mockResponse).toHaveProperty('success', true);
  });
});
```
(`apps/studio/tests/api/contract.test.ts`) — this asserts against a literal object built in the test, not an actual API response; it documents the intended contract shape rather than verifying it. Comments in these files (e.g. `// In a real execution, we'd use supertest against the Next.js local server`) confirm they are placeholders for real integration tests, not finished ones. Do not treat these files as a reliable behavioral safety net for the routes they name.

### Coverage (TypeScript)

No coverage tool/threshold configured in either `apps/studio` or `apps/studio/platform`.

### Other Apps (`apps/forge`, `apps/platform-api`, `apps/archive`, `apps/flow`, `apps/insight`, `apps/ops`, `apps/search`)

No test files, test scripts, or test framework config found in any of these. `apps/forge` and `apps/platform-api` are minimal scaffolds; `apps/archive`, `apps/flow`, `apps/insight`, `apps/ops`, `apps/search` are empty directories with no files at all.

---

*Testing analysis: 2026-07-23*
