# Capability Workspace Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each visible Studio sidebar destination resolve to a dedicated capability workspace instead of a 404.

**Architecture:** A typed registry owns missing route data. A constrained `/app/[...capability]` page renders a shared workspace only for exact registry matches and calls `notFound()` for all other paths; existing static routes retain precedence.

**Tech Stack:** Next.js App Router, TypeScript, React, Vitest, lucide-react, existing Studio Card/StatCard components.

## Global Constraints

- Preserve static `/app` pages and sidebar hrefs.
- Give each visible Workspace, AI, Infrastructure, Data, Security, Talent OS, and Solutions item a page-specific configuration.
- Preserve true 404 behavior for unknown paths.
- Never display credentials or secret values.
- Do not stage unrelated `.claude`, `turbo.json`, or `.superpowers` changes.

---

### Task 1: Registry and red/green unit tests

**Files:**
- Create: `cerebro-hive-website/apps/studio/app/(platform)/app/capabilities/registry.ts`
- Create: `cerebro-hive-website/apps/studio/app/(platform)/app/capabilities/registry.test.ts`
- Read: `cerebro-hive-website/apps/studio/app/(platform)/app/navigation/index.ts`

**Interfaces:** Export `CapabilityWorkspaceDefinition`, `capabilityWorkspaces`, and `getCapabilityWorkspace(pathname: string)`. A definition has `href`, `title`, `section`, `description`, `icon`, three metrics, `primaryAction`, and `relatedHrefs`. Lookup returns exact matches only.

- [ ] **Step 1: Write a failing test**

```ts
import { describe, expect, it } from "vitest";
import { capabilityWorkspaces, getCapabilityWorkspace } from "./registry";

describe("capability workspace registry", () => {
  it("registers sidebar destinations", () => {
    expect(capabilityWorkspaces.map((item) => item.href)).toContain("/app/data/pipelines");
    expect(capabilityWorkspaces.map((item) => item.href)).toContain("/app/security/audit");
    expect(capabilityWorkspaces.map((item) => item.href)).toContain("/app/infrastructure/kubernetes");
  });
  it("returns only exact workspace matches", () => {
    expect(getCapabilityWorkspace("/app/data/warehouse")?.title).toBe("Data Warehouse");
    expect(getCapabilityWorkspace("/app/not-a-capability")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Verify red**

Run: `corepack pnpm --dir cerebro-hive-website/apps/studio exec vitest run app/(platform)/app/capabilities/registry.test.ts`

Expected: FAIL because `./registry` is absent.

- [ ] **Step 3: Implement the registry**

```ts
export type CapabilityWorkspaceDefinition = {
  href: string; title: string; section: string; description: string; icon: LucideIcon;
  metrics: readonly { label: string; value: string; change: string }[];
  primaryAction: { label: string; href: string }; relatedHrefs: readonly string[];
};
export function getCapabilityWorkspace(pathname: string) {
  return capabilityWorkspaces.find((item) => item.href === pathname);
}
```

Populate every non-static visible sidebar href using matching navigation icons. Give each entry distinct copy, metrics, action, and related links.

- [ ] **Step 4: Verify green**

Run the Task 1 test. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cerebro-hive-website/apps/studio/app/\(platform\)/app/capabilities/registry.ts cerebro-hive-website/apps/studio/app/\(platform\)/app/capabilities/registry.test.ts
git commit -m "feat(studio): add capability workspace registry"
```

### Task 2: Shared UI and catch-all page

**Files:**
- Create: `cerebro-hive-website/apps/studio/app/(platform)/app/capabilities/CapabilityWorkspace.tsx`
- Create: `cerebro-hive-website/apps/studio/app/(platform)/app/[...capability]/page.tsx`
- Create: `cerebro-hive-website/apps/studio/app/(platform)/app/capabilities/CapabilityWorkspace.test.tsx`

**Interfaces:** `CapabilityWorkspace({ workspace })` renders title, description, metric cards, primary `TrackedLink`, and related links. The route reconstructs its pathname from catch-all segments, looks it up, and calls `notFound()` if missing.

- [ ] **Step 1: Write a failing component test**

```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CapabilityWorkspace } from "./CapabilityWorkspace";
import { getCapabilityWorkspace } from "./registry";

it("renders data pipeline content", () => {
  const workspace = getCapabilityWorkspace("/app/data/pipelines");
  render(<CapabilityWorkspace workspace={workspace!} />);
  expect(screen.getByRole("heading", { name: "Data Pipelines" })).toBeVisible();
  expect(screen.getByRole("link", { name: /create pipeline/i })).toHaveAttribute("href", "/app/data/pipelines");
});
```

- [ ] **Step 2: Verify red**

Run: `corepack pnpm --dir cerebro-hive-website/apps/studio exec vitest run app/(platform)/app/capabilities/CapabilityWorkspace.test.tsx`

Expected: FAIL because the component is absent.

- [ ] **Step 3: Implement UI and route**

Render a workspace header, three `StatCard`s, a primary `TrackedLink`, and related `Card` links using the registry only. Add `generateMetadata` from registry values. The Secrets page renders aggregate posture metrics only.

- [ ] **Step 4: Verify green**

Run the Task 2 test. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cerebro-hive-website/apps/studio/app/\(platform\)/app/capabilities/CapabilityWorkspace.tsx cerebro-hive-website/apps/studio/app/\(platform\)/app/capabilities/CapabilityWorkspace.test.tsx cerebro-hive-website/apps/studio/app/\(platform\)/app/[...capability]/page.tsx
git commit -m "feat(studio): render capability workspace pages"
```

### Task 3: Sidebar coverage and full verification

**Files:**
- Create: `cerebro-hive-website/apps/studio/app/(platform)/app/capabilities/sidebar-route-coverage.test.ts`
- Modify: `cerebro-hive-website/apps/studio/app/(platform)/app/capabilities/registry.ts`

- [ ] **Step 1: Write a failing coverage test**

```ts
const visibleGroups = new Set(["Workspace", "AI", "Infrastructure", "Data", "Security", "Talent OS", "Solutions"]);
const hrefs = platformNavigation.filter((group) => visibleGroups.has(group.title)).flatMap((group) => group.items.map((item) => item.href));
const registered = new Set(capabilityWorkspaces.map((item) => item.href));
expect(hrefs.filter((href) => !concreteRoutes.has(href) && !registered.has(href))).toEqual([]);
```

- [ ] **Step 2: Verify red**

Run: `corepack pnpm --dir cerebro-hive-website/apps/studio exec vitest run app/(platform)/app/capabilities/sidebar-route-coverage.test.ts`

Expected: FAIL for unregistered sidebar hrefs.

- [ ] **Step 3: Complete only reported registry entries**

Add each reported non-static href. Do not introduce redirects or blanket path matching.

- [ ] **Step 4: Verify**

```bash
corepack pnpm --dir cerebro-hive-website/apps/studio exec vitest run app/\(platform\)/app/capabilities
corepack pnpm --dir cerebro-hive-website/apps/studio run typecheck
corepack pnpm --dir cerebro-hive-website/apps/studio run lint
corepack pnpm --dir cerebro-hive-website/apps/studio run build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add cerebro-hive-website/apps/studio/app/\(platform\)/app/capabilities/sidebar-route-coverage.test.ts cerebro-hive-website/apps/studio/app/\(platform\)/app/capabilities/registry.ts cerebro-hive-website/apps/studio/app/\(platform\)/app/[...capability]/page.tsx
git commit -m "test(studio): cover sidebar capability routes"
```

## Self-Review

- Spec coverage: registry, dedicated URLs, shared UI, static-route precedence, true 404 behavior, secrets safety, route coverage, and full verification are covered.
- Placeholder scan: no unresolved markers remain.
- Type consistency: all tasks use `CapabilityWorkspaceDefinition` and `getCapabilityWorkspace`.
