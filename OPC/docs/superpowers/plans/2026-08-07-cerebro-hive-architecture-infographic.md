# Cerebro Hive Architecture Infographic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder developer architecture page with an accessible, animated, engineering-first Cerebro Hive architecture explorer that can be embedded, exported, and captured as a guided presentation.

**Architecture:** Keep the canonical portfolio content in a typed client-safe registry and derive layers, family summaries, drill-down information, and dependency links from that one source. Render the initial Layered Blueprint as an SVG-backed React client component; use local state for family/product selection and presentation mode, with no runtime network calls. Reuse the existing `/developers/architecture` route and its page metadata.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React, html-to-image, Playwright.

## Global Constraints

- Treat `architecture/capabilities/PRODUCT_REGISTRY.md` and `architecture/manifesto/CEREBROHIVE_EIOS_MANIFESTO.md` as the sources of truth; never infer undocumented dependencies or deployment posture.
- Show products by family in the initial view; only reveal individual products in a selected family’s drill-down.
- Render status with text and node/line style as well as colour: GA, Beta, MVP, and Research.
- Use labelled edge kinds only: request/API, event stream, identity/policy, retrieval/memory, data pipeline, workflow, and telemetry.
- Motion is non-looping, interaction-driven after the initial reveal, and disabled/reduced for `prefers-reduced-motion`.
- The explorer must work without a network call and expose a semantic text equivalent for keyboard and screen-reader users.
- Preserve existing `/developers/architecture` JSON-LD, metadata, canonical URL, and visual-test conventions.

---

## File Structure

- Create: `cerebro-hive-website/apps/studio/lib/architecture-registry.ts` — typed canonical product/family/research data and pure derived selectors.
- Create: `cerebro-hive-website/apps/studio/components/architecture/CerebroHiveArchitectureExplorer.tsx` — client state, family/product selection, filters, keyboard interaction, presentation mode, and export controls.
- Create: `cerebro-hive-website/apps/studio/components/architecture/LayeredBlueprint.tsx` — responsive SVG layer/edge/node drawing and motion variants.
- Create: `cerebro-hive-website/apps/studio/components/architecture/ArchitectureDetailPanel.tsx` — selected-family and selected-product stack/dependency/protocol detail surface.
- Create: `cerebro-hive-website/apps/studio/components/architecture/architecture-infographic.module.css` — component-scoped motion, responsive layout, reduced-motion, print, and presentation-mode rules.
- Modify: `cerebro-hive-website/apps/studio/components/architecture/LivingArchitecture.tsx` — replace placeholder with the explorer’s stable server/client boundary.
- Modify: `cerebro-hive-website/apps/studio/app/developers/architecture/page.tsx` — retain SEO wrapper and render the completed explorer.
- Create: `cerebro-hive-website/apps/studio/tests/architecture-registry.test.ts` — source-data and selector unit tests.
- Create: `cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts` — Playwright interaction, reduced-motion, presentation, and visual checks.
- Create: `cerebro-hive-website/scripts/capture-architecture-infographic.mjs` — deterministic Playwright frame capture for presentation/video assembly.
- Create: `cerebro-hive-website/docs/architecture-infographic-export.md` — embedding, SVG/PNG download, frame capture, and video assembly instructions.

### Task 1: Create the canonical, typed infographic registry

**Files:**

- Create: `cerebro-hive-website/apps/studio/lib/architecture-registry.ts`
- Create: `cerebro-hive-website/apps/studio/tests/architecture-registry.test.ts`

**Interfaces:**

- Produces: `ArchitectureProduct`, `ArchitectureFamily`, `ArchitectureLayer`, `ArchitectureEdge`, `ResearchDomain` types.
- Produces: `ARCHITECTURE_FAMILIES`, `ARCHITECTURE_EDGES`, `RESEARCH_DOMAINS`, `getFamily(id)`, `getProduct(id)`, and `getFocusedEdges(productId)`.
- Consumed by: `LayeredBlueprint`, `ArchitectureDetailPanel`, and `CerebroHiveArchitectureExplorer`.

- [ ] **Step 1: Write failing registry assertions**

```ts
import { describe, expect, it } from 'vitest';
import {
  ARCHITECTURE_FAMILIES,
  getFocusedEdges,
  getProduct,
} from '../lib/architecture-registry';

describe('architecture registry', () => {
  it('keeps the documented 19 application and 32 platform products grouped by family', () => {
    expect(ARCHITECTURE_FAMILIES.find((family) => family.id === 'cerebro-applications')?.products).toHaveLength(19);
    expect(ARCHITECTURE_FAMILIES.find((family) => family.id === 'hive-platform')?.products).toHaveLength(32);
  });

  it('keeps CerebroEDA explicitly research-stage with its documented stack', () => {
    const eda = getProduct('cerebro-eda');
    expect(eda?.lifecycle).toBe('Research');
    expect(eda?.stack).toContain('gRPC');
    expect(eda?.stack).toContain('gVisor-isolated runners');
  });

  it('focuses the documented request and identity path for CerebroStudio', () => {
    expect(getFocusedEdges('cerebro-studio').map((edge) => edge.kind)).toEqual(
      expect.arrayContaining(['request/API', 'identity/policy']),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --dir cerebro-hive-website/apps/studio exec vitest run tests/architecture-registry.test.ts`

Expected: FAIL because `architecture-registry` does not exist.

- [ ] **Step 3: Implement the registry and pure selectors**

```ts
export type Lifecycle = 'GA' | 'Beta' | 'MVP' | 'Research';
export type EdgeKind = 'request/API' | 'event stream' | 'identity/policy' | 'retrieval/memory' | 'data pipeline' | 'workflow' | 'telemetry';

export interface ArchitectureProduct {
  id: string;
  name: string;
  lifecycle: Lifecycle;
  stack: readonly string[];
  dependencies: readonly string[];
  deployment?: string;
}

export interface ArchitectureFamily {
  id: string;
  name: string;
  layer: 'applications' | 'platform';
  products: readonly ArchitectureProduct[];
}

export const getProduct = (id: string) =>
  ARCHITECTURE_FAMILIES.flatMap((family) => family.products).find((product) => product.id === id);

export const getFocusedEdges = (productId: string) =>
  ARCHITECTURE_EDGES.filter((edge) => edge.source === productId || edge.target === productId);
```

Populate all 51 products from `PRODUCT_REGISTRY.md`; use `undefined` for undocumented deployment and no edge for undocumented dependencies. Define the default engineering journey explicitly as documented architectural topology, not as a product dependency.

- [ ] **Step 4: Run the registry test to verify it passes**

Run: `pnpm --dir cerebro-hive-website/apps/studio exec vitest run tests/architecture-registry.test.ts`

Expected: PASS with three tests.

- [ ] **Step 5: Commit the registry slice**

```bash
git add cerebro-hive-website/apps/studio/lib/architecture-registry.ts cerebro-hive-website/apps/studio/tests/architecture-registry.test.ts
git commit -m "feat(architecture): add canonical infographic registry"
```

### Task 2: Render the layered blueprint and its accessible text equivalent

**Files:**

- Create: `cerebro-hive-website/apps/studio/components/architecture/LayeredBlueprint.tsx`
- Create: `cerebro-hive-website/apps/studio/components/architecture/architecture-infographic.module.css`
- Modify: `cerebro-hive-website/apps/studio/components/architecture/LivingArchitecture.tsx`

**Interfaces:**

- Consumes: `ArchitectureFamily`, `ArchitectureEdge`, and `Lifecycle` from `architecture-registry.ts`.
- Produces: `LayeredBlueprint({ families, edges, selectedFamilyId, selectedProductId, onSelectFamily, onSelectProduct, presentationStep })`.
- Consumed by: `CerebroHiveArchitectureExplorer` in Task 3.

- [ ] **Step 1: Write the failing visual test for labelled initial layers**

```ts
import { test, expect } from '@playwright/test';

test('shows a keyboard-operable layered blueprint with status legend', async ({ page }) => {
  await page.goto('/developers/architecture');
  await expect(page.getByRole('heading', { name: 'Cerebro Hive architecture' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Cerebro Applications · 19 products/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Hive Platform · 32 products/i })).toBeVisible();
  await expect(page.getByText('GA')).toBeVisible();
  await expect(page.getByText('Research')).toBeVisible();
});
```

- [ ] **Step 2: Run the visual test to verify it fails**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts`

Expected: FAIL because the new heading and family buttons do not exist.

- [ ] **Step 3: Implement the diagram as semantic controls around responsive SVG**

```tsx
<section aria-labelledby="architecture-title" className={styles.explorer}>
  <h2 id="architecture-title">Cerebro Hive architecture</h2>
  <p id="architecture-summary" className="sr-only">
    A layered architecture with Cerebro Applications above the Hive Platform, intelligence services, trusted data infrastructure, and research domains.
  </p>
  <svg aria-describedby="architecture-summary" role="img" viewBox="0 0 1440 820">
    {/* layer bands, labelled arrows, and product-family nodes */}
  </svg>
  <div className="sr-only">
    {families.map((family) => <button key={family.id} onClick={() => onSelectFamily(family.id)}>{family.name}</button>)}
  </div>
</section>
```

Use CSS module classes for node states: `nodeGa`, `nodeBeta`, `nodeMvp`, `nodeResearch`, `edgeRequestApi`, `edgeEventStream`, `edgeIdentityPolicy`, `edgeRetrievalMemory`, `edgeDataPipeline`, `edgeWorkflow`, and `edgeTelemetry`. Apply a one-time entrance transition only when `presentationStep === 'intro'`; include `@media (prefers-reduced-motion: reduce)` to disable it.

- [ ] **Step 4: Replace the placeholder boundary**

```tsx
// LivingArchitecture.tsx
import { CerebroHiveArchitectureExplorer } from './CerebroHiveArchitectureExplorer';

export default function LivingArchitecture() {
  return <CerebroHiveArchitectureExplorer />;
}
```

Do not alter the page’s existing metadata or `JsonLd` wrapper.

- [ ] **Step 5: Run the visual test and typecheck**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts && pnpm --dir cerebro-hive-website/apps/studio typecheck`

Expected: PASS; the explorer renders, its semantic controls are discoverable, and TypeScript has no errors.

- [ ] **Step 6: Commit the blueprint slice**

```bash
git add cerebro-hive-website/apps/studio/components/architecture/LayeredBlueprint.tsx cerebro-hive-website/apps/studio/components/architecture/architecture-infographic.module.css cerebro-hive-website/apps/studio/components/architecture/LivingArchitecture.tsx cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts
git commit -m "feat(architecture): render layered blueprint"
```

### Task 3: Add family/product drill-down, focus graph, and accessible controls

**Files:**

- Create: `cerebro-hive-website/apps/studio/components/architecture/CerebroHiveArchitectureExplorer.tsx`
- Create: `cerebro-hive-website/apps/studio/components/architecture/ArchitectureDetailPanel.tsx`
- Modify: `cerebro-hive-website/apps/studio/components/architecture/LayeredBlueprint.tsx`
- Modify: `cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts`

**Interfaces:**

- Consumes: registry exports from Task 1 and `LayeredBlueprint` from Task 2.
- Produces: a controlled selection state with `selectedFamilyId: string | null`, `selectedProductId: string | null`, and `setFocusedProduct(id: string | null)`.
- Produces: `ArchitectureDetailPanel({ family, product, focusedEdges, onSelectProduct, onClose })`.

- [ ] **Step 1: Add failing interaction tests**

```ts
test('opens a family and focuses a product dependency path', async ({ page }) => {
  await page.goto('/developers/architecture');
  await page.getByRole('button', { name: /Cerebro Applications · 19 products/i }).click();
  await expect(page.getByRole('heading', { name: 'Cerebro Applications' })).toBeVisible();
  await page.getByRole('button', { name: 'CerebroStudio' }).click();
  await expect(page.getByText('Next.js 14')).toBeVisible();
  await expect(page.getByText('GraphQL Federation')).toBeVisible();
  await expect(page.getByText('request/API')).toBeVisible();
});

test('reports uncatalogued fields instead of guessing', async ({ page }) => {
  await page.goto('/developers/architecture');
  await page.getByRole('button', { name: /Hive Platform · 32 products/i }).click();
  await page.getByRole('button', { name: 'HiveCloud' }).click();
  await expect(page.getByText('not yet catalogued')).toBeVisible();
});
```

- [ ] **Step 2: Run the interaction tests to verify they fail**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts`

Expected: FAIL because the details panel does not exist.

- [ ] **Step 3: Implement controlled selection and the details panel**

```tsx
const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
const selectedFamily = selectedFamilyId ? getFamily(selectedFamilyId) : undefined;
const selectedProduct = selectedProductId ? getProduct(selectedProductId) : undefined;

<ArchitectureDetailPanel
  family={selectedFamily}
  product={selectedProduct}
  focusedEdges={selectedProductId ? getFocusedEdges(selectedProductId) : []}
  onSelectProduct={setSelectedProductId}
  onClose={() => { setSelectedProductId(null); setSelectedFamilyId(null); }}
/>
```

Render a product as a `button`. The panel must show lifecycle, complete stack list, documented dependencies, documented deployment or the literal `not yet catalogued`, and edge-kind labels. Give the panel `role="region"`, an `aria-labelledby` heading, a visible close button, and focus management that returns to the family button on close.

- [ ] **Step 4: Run the interaction tests to verify they pass**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts`

Expected: PASS; family drill-down, product focus, stack disclosure, and uncatalogued state are verified.

- [ ] **Step 5: Commit the drill-down slice**

```bash
git add cerebro-hive-website/apps/studio/components/architecture/CerebroHiveArchitectureExplorer.tsx cerebro-hive-website/apps/studio/components/architecture/ArchitectureDetailPanel.tsx cerebro-hive-website/apps/studio/components/architecture/LayeredBlueprint.tsx cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts
git commit -m "feat(architecture): add product drill-downs"
```

### Task 4: Implement presentation mode and export/capture workflow

**Files:**

- Modify: `cerebro-hive-website/apps/studio/components/architecture/CerebroHiveArchitectureExplorer.tsx`
- Modify: `cerebro-hive-website/apps/studio/components/architecture/architecture-infographic.module.css`
- Create: `cerebro-hive-website/scripts/capture-architecture-infographic.mjs`
- Create: `cerebro-hive-website/docs/architecture-infographic-export.md`
- Modify: `cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts`

**Interfaces:**

- Produces: query-string presentation state `?presentation=1&step=0..4` and buttons labelled `Start presentation`, `Next layer`, `Download PNG`, and `Download SVG`.
- Produces: `node scripts/capture-architecture-infographic.mjs --base-url http://localhost:3000 --output artifacts/architecture-frames`.
- Consumed by: website embeds, presentation/video capture, and engineering documentation.

- [ ] **Step 1: Add failing presentation and reduced-motion checks**

```ts
test('supports presentation steps and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/developers/architecture?presentation=1&step=2');
  await expect(page.getByText('Hive Platform')).toBeVisible();
  await expect(page.locator('[data-animation="intro"]')).toHaveCSS('animation-duration', '0s');
  await expect(page.getByRole('button', { name: 'Next layer' })).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts`

Expected: FAIL because the route does not yet parse presentation state.

- [ ] **Step 3: Implement deterministic presentation and downloads**

```tsx
const initialStep = Number(new URLSearchParams(window.location.search).get('step') ?? 0);
const [presentationStep, setPresentationStep] = useState(Math.min(4, Math.max(0, initialStep)));

<button type="button" onClick={() => setPresentationStep(0)}>Start presentation</button>
<button type="button" onClick={() => setPresentationStep((step) => Math.min(4, step + 1))}>Next layer</button>
```

Use `html-to-image` against the explorer root for named PNG and SVG downloads. Presentation steps must reveal: foundation, intelligence, platform, applications, then research/industry edge. Ensure print CSS hides controls and leaves the title, legend, diagram, and selected panel visible.

- [ ] **Step 4: Implement frame capture and documented video assembly**

```js
// capture-architecture-infographic.mjs
for (let step = 0; step <= 4; step += 1) {
  await page.goto(`${baseUrl}/developers/architecture?presentation=1&step=${step}`);
  await page.locator('[data-testid="architecture-explorer"]').screenshot({ path: path.join(outputDir, `architecture-${step}.png`) });
}
```

Document the exact commands to run the capture script and assemble frames with an installed FFmpeg binary, keeping FFmpeg optional rather than bundling it.

- [ ] **Step 5: Run visual, type, and capture verification**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts && pnpm --dir cerebro-hive-website/apps/studio typecheck && node cerebro-hive-website/scripts/capture-architecture-infographic.mjs --base-url http://localhost:3000 --output cerebro-hive-website/artifacts/architecture-frames`

Expected: PASS; five deterministic PNG frames are written and the explorer passes visual/reduced-motion checks.

- [ ] **Step 6: Commit the export slice**

```bash
git add cerebro-hive-website/apps/studio/components/architecture/CerebroHiveArchitectureExplorer.tsx cerebro-hive-website/apps/studio/components/architecture/architecture-infographic.module.css cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts cerebro-hive-website/scripts/capture-architecture-infographic.mjs cerebro-hive-website/docs/architecture-infographic-export.md
git commit -m "feat(architecture): add presentation exports"
```

### Task 5: Perform page integration and final verification

**Files:**

- Modify: `cerebro-hive-website/apps/studio/app/developers/architecture/page.tsx`
- Modify: `cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts`

**Interfaces:**

- Consumes: `LivingArchitecture` from Tasks 2–4.
- Produces: the production `/developers/architecture` page with unchanged `Metadata` and `JsonLd` values plus finished UI content.

- [ ] **Step 1: Add a final page-level visual contract**

```ts
test('keeps architecture metadata content and explorer together at desktop and mobile widths', async ({ page }) => {
  await page.goto('/developers/architecture');
  await expect(page.getByRole('heading', { name: 'Enterprise Architecture' })).toBeVisible();
  await expect(page.getByTestId('architecture-explorer')).toBeVisible();
  await expect(page).toHaveScreenshot('architecture-desktop.png', { fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot('architecture-mobile.png', { fullPage: true });
});
```

- [ ] **Step 2: Run it to verify the integration gap**

Run: `pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts`

Expected: FAIL until the page includes the completed explorer and baselines are approved.

- [ ] **Step 3: Preserve the route’s technical-documentation framing**

Keep existing `Metadata`, `buildTechArticleSchema`, `JsonLd`, and the three architecture paradigm cards. Update only the introduction sentence if necessary so it describes the layered explorer rather than the old placeholder. Add `data-testid="architecture-explorer"` to the explorer root.

- [ ] **Step 4: Run final checks and approve visual baselines**

Run: `pnpm --dir cerebro-hive-website/apps/studio typecheck && pnpm --dir cerebro-hive-website/apps/studio lint && pnpm --dir cerebro-hive-website/apps/studio test:e2e -- tests/visual/architecture-infographic.spec.ts`

Expected: PASS with no TypeScript or lint errors; desktop and mobile screenshots show readable layers, legend, controls, and details without clipping.

- [ ] **Step 5: Commit the integrated feature**

```bash
git add cerebro-hive-website/apps/studio/app/developers/architecture/page.tsx cerebro-hive-website/apps/studio/tests/visual/architecture-infographic.spec.ts
git commit -m "feat(architecture): ship Cerebro Hive infographic"
```

## Plan Self-Review

- Spec coverage: Tasks 1–3 cover canonical products, status, stack, dependencies, focused links, and accessibility; Task 2 covers layers and motion; Task 4 covers embed/export/presentation; Task 5 retains route SEO and validates responsive integration.
- Placeholder scan: no TBD/TODO or deferred implementation references remain.
- Interface consistency: all components consume the registry types from Task 1; selection and focus APIs are defined in Task 3 and passed to the rendering/detail components consistently.
