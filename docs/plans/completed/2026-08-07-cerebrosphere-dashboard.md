# CerebroSphere Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first authenticated CerebroSphere command-center dashboard at `/dashboard`.

**Architecture:** Keep `app/dashboard/page.tsx` as the authentication-aware route shell. Move executive dashboard state into a focused feature module that exposes typed snapshot contracts and a deterministic local provider; presentational sections consume that snapshot without knowing its source. This makes a later REST/GraphQL/WebSocket provider substitution local to the feature boundary.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Preserve the existing unauthenticated redirect to `/?login=required`.
- The default visible role is CEO; do not implement role selection or imply RBAC enforcement.
- Use deterministic local fixtures only; do not add backend, persistence, API, GraphQL, WebSocket, semantic-search, or anomaly-detection code.
- Every health and alert state must include a textual label in addition to visual styling.
- Keep the dashboard data source behind a typed provider function.

---

## File structure

- Create: `app/dashboard/cerebrosphere/types.ts` — snapshot and item contracts.
- Create: `app/dashboard/cerebrosphere/snapshot.ts` — deterministic CEO snapshot provider.
- Create: `app/dashboard/cerebrosphere/snapshot.test.ts` — provider contract tests.
- Create: `app/dashboard/cerebrosphere/CerebroSphereDashboard.tsx` — accessible command-center composition and presentational sections.
- Create: `app/dashboard/cerebrosphere/CerebroSphereDashboard.test.tsx` — rendering and semantic-state tests.
- Modify: `app/dashboard/page.tsx` — preserve auth behaviour and render the feature after authentication.
- Modify: `app/dashboard/layout.tsx` — update route metadata to CerebroSphere wording.

### Task 1: Establish the deterministic dashboard snapshot boundary

**Files:**
- Create: `app/dashboard/cerebrosphere/types.ts`
- Create: `app/dashboard/cerebrosphere/snapshot.ts`
- Test: `app/dashboard/cerebrosphere/snapshot.test.ts`

**Interfaces:**
- Produces `DashboardSnapshot`, `Kpi`, `ProductHealth`, `AgentActivity`, and `SystemAlert` types.
- Produces `getCerebroSphereSnapshot(): DashboardSnapshot` for the route and UI.

- [ ] **Step 1: Write the failing provider contract test**

```ts
import { describe, expect, it } from "vitest";
import { getCerebroSphereSnapshot } from "./snapshot";

describe("getCerebroSphereSnapshot", () => {
  it("returns a CEO snapshot with every command-center data group", () => {
    const snapshot = getCerebroSphereSnapshot();

    expect(snapshot.role).toBe("CEO");
    expect(snapshot.kpis).toHaveLength(4);
    expect(snapshot.products.length).toBeGreaterThan(0);
    expect(snapshot.activities.length).toBeGreaterThan(0);
    expect(snapshot.alerts.length).toBeGreaterThan(0);
  });

  it("uses textual health and severity states", () => {
    const snapshot = getCerebroSphereSnapshot();

    expect(snapshot.products.every((item) => item.health.length > 0)).toBe(true);
    expect(snapshot.alerts.every((item) => item.severity.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run app/dashboard/cerebrosphere/snapshot.test.ts`

Expected: FAIL because `./snapshot` does not exist.

- [ ] **Step 3: Define the types and minimal deterministic provider**

```ts
export type HealthState = "Healthy" | "Degraded" | "At risk";
export type AlertSeverity = "Critical" | "Warning" | "Info";

export interface DashboardSnapshot {
  role: "CEO";
  kpis: Kpi[];
  products: ProductHealth[];
  activities: AgentActivity[];
  alerts: SystemAlert[];
}

export function getCerebroSphereSnapshot(): DashboardSnapshot {
  return {
    role: "CEO",
    kpis: [
      { label: "Revenue run rate", value: "$4.8M", trend: "up", comparison: "+12.4% vs last quarter" },
      { label: "Active enterprise tenants", value: "128", trend: "up", comparison: "+8 this month" },
      { label: "Platform availability", value: "99.98%", trend: "up", comparison: "Above 99.9% target" },
      { label: "Automations completed", value: "18,426", trend: "up", comparison: "+19% this week" },
    ],
    products: [
      { name: "CerebroStudio", health: "Healthy", availability: "99.99%", note: "All systems operational" },
      { name: "HiveGateway", health: "Degraded", availability: "99.72%", note: "Elevated inference latency" },
    ],
    activities: [{ agent: "Release Guardian", summary: "Validated production release", timestamp: "08:42 UTC", state: "Completed" }],
    alerts: [{ title: "Gateway latency elevated", detail: "p95 inference latency is above the operating target.", severity: "Warning", requiresAttention: true }],
  };
}
```

Define the remaining fields used by these fixture records in `types.ts`; no fixture value may be generated from the clock or random input.

- [ ] **Step 4: Run the provider test to verify it passes**

Run: `pnpm exec vitest run app/dashboard/cerebrosphere/snapshot.test.ts`

Expected: PASS with two passing assertions.

- [ ] **Step 5: Commit the provider boundary**

```bash
git add app/dashboard/cerebrosphere/types.ts app/dashboard/cerebrosphere/snapshot.ts app/dashboard/cerebrosphere/snapshot.test.ts
git commit -m "feat: add CerebroSphere dashboard snapshot"
```

### Task 2: Render the accessible command center and connect the existing route

**Files:**
- Create: `app/dashboard/cerebrosphere/CerebroSphereDashboard.tsx`
- Create: `app/dashboard/cerebrosphere/CerebroSphereDashboard.test.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/layout.tsx`

**Interfaces:**
- Consumes `DashboardSnapshot` and `getCerebroSphereSnapshot()` from Task 1.
- Produces `CerebroSphereDashboard({ snapshot }: { snapshot: DashboardSnapshot })`.
- The route renders this component only after existing authentication checks complete.

- [ ] **Step 1: Write the failing dashboard rendering test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CerebroSphereDashboard } from "./CerebroSphereDashboard";
import { getCerebroSphereSnapshot } from "./snapshot";

describe("CerebroSphereDashboard", () => {
  it("renders the four executive command-center areas", () => {
    render(<CerebroSphereDashboard snapshot={getCerebroSphereSnapshot()} />);

    expect(screen.getByRole("heading", { name: /cerebrosphere/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /business kpis/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /product health/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /agent activity/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /system alerts/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the component test to verify it fails**

Run: `pnpm exec vitest run app/dashboard/cerebrosphere/CerebroSphereDashboard.test.tsx`

Expected: FAIL because `CerebroSphereDashboard` does not exist.

- [ ] **Step 3: Implement the presentational dashboard component**

```tsx
export function CerebroSphereDashboard({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <main aria-labelledby="cerebrosphere-title">
      <header>
        <p>Executive command center · {snapshot.role}</p>
        <h1 id="cerebrosphere-title">CerebroSphere</h1>
      </header>
      {/* KPI, product-health, agent-activity, and alert sections map typed snapshot items. */}
    </main>
  );
}
```

Use responsive Tailwind grids and card surfaces consistent with existing `text-*`, `bg-*`, and `font-space` dashboard tokens. Render state text from the fixture (`Healthy`, `Degraded`, `Critical`, and similar) in each affected card or list item.

- [ ] **Step 4: Replace course loading in the route without changing auth checks**

Keep the `useAuth`, loading, and unauthenticated redirect flow. Remove the enrollment/course fetch and the course/quick-access sections. Import the provider and component, then render:

```tsx
const snapshot = getCerebroSphereSnapshot();
return <CerebroSphereDashboard snapshot={snapshot} />;
```

Update `app/dashboard/layout.tsx` metadata to title the route `CerebroSphere` and describe it as the executive command center.

- [ ] **Step 5: Run focused tests to verify they pass**

Run: `pnpm exec vitest run app/dashboard/cerebrosphere/snapshot.test.ts app/dashboard/cerebrosphere/CerebroSphereDashboard.test.tsx`

Expected: PASS with all provider and component assertions green.

- [ ] **Step 6: Run static checks**

Run: `pnpm typecheck:root && pnpm lint:root`

Expected: exit code 0 with no TypeScript or ESLint errors caused by the dashboard changes.

- [ ] **Step 7: Commit the command-center UI**

```bash
git add app/dashboard/page.tsx app/dashboard/layout.tsx app/dashboard/cerebrosphere/CerebroSphereDashboard.tsx app/dashboard/cerebrosphere/CerebroSphereDashboard.test.tsx
git commit -m "feat: build CerebroSphere executive dashboard"
```

## Plan self-review

- Scope coverage: Task 1 supplies typed, deterministic KPI/product/activity/alert data; Task 2 supplies the accessible CEO UI, preserves authentication, updates metadata, and verifies it with tests and static checks.
- Out-of-scope protection: no task introduces transport, persistence, tenants, RBAC, search, anomaly detection, or deployment work.
- Type consistency: Task 1 defines the `DashboardSnapshot` contract and provider consumed by Task 2 with identical names and signatures.
- Placeholder scan: no incomplete markers or unspecified test steps remain.
