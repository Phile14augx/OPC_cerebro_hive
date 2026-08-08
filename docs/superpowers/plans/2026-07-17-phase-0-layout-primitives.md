# Phase 0: Layout Primitives — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the four shared layout primitives (`PageContainer`, `Section`, `Card`, `Stack`) that all 8 later page-migration phases depend on, and prove them with one real pilot migration.

**Architecture:** Four small, independent components in a new `components/ui/primitives/` directory. `Card` uses `class-variance-authority` (its only real multi-axis variant surface: `size` × `variant`); `PageContainer`, `Section`, and `Stack` use plain typed `Record<...>` lookup maps and the existing `cn()` helper. Every primitive's underlying class-map/variant function is exported alongside the component itself, so later phases (and this plan's pilot task) can apply the same classes to non-`div`/`section` elements (e.g. a `<Link>` styled as a card) without a polymorphic `as` prop.

**Tech Stack:** Next.js 15, React, Tailwind CSS, `clsx` + `tailwind-merge` (via existing `cn()` in `lib/utils.ts`), `class-variance-authority` (new).

## Global Constraints

- Spacing values used across all primitives: `8, 16, 24, 32, 48, 80, 96, 120, 160` (px) — no other values.
- `class-variance-authority` is used only in `Card`. `PageContainer`, `Section`, `Stack` must NOT use it — plain `Record<Variant, string>` maps only.
- `Section` must not accept a `container` prop or render `PageContainer` internally — callers compose them explicitly.
- `Card`'s `variant` prop has exactly one value, `"surface"`, for now — do not add `ghost`/`glass`/`interactive`/etc.
- Do not modify or remove `components/ui/GlassCard.tsx`.
- Do not touch any file outside `components/ui/primitives/*` and the single pilot file `components/home/v3/IntegratedPlatform.tsx` in this plan.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`) — import primitives as `@/components/ui/primitives/<Name>`.

---

### Task 1: Add `class-variance-authority` dependency

**Files:**
- Modify: `package.json` (via npm, not hand-edited)

**Interfaces:**
- Produces: `class-variance-authority` importable as `import { cva, type VariantProps } from "class-variance-authority"` for Task 4.

- [ ] **Step 1: Install the dependency**

Run: `npm install class-variance-authority`
Expected: `package.json` `dependencies` gains a `"class-variance-authority": "^X.Y.Z"` entry, `package-lock.json` updates, exit code 0.

- [ ] **Step 2: Verify it resolves**

Run: `node -e "console.log(require.resolve('class-variance-authority'))"`
Expected: prints a path inside `node_modules/class-variance-authority`, no error.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add class-variance-authority for Card primitive variants"
```

---

### Task 2: `PageContainer` primitive

**Files:**
- Create: `components/ui/primitives/PageContainer.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils` (existing, signature `cn(...inputs: ClassValue[]): string`)
- Produces: `PageContainer` component, `PageContainerProps` type, `PageContainerSize` type (`"default" | "narrow"`), `containerSizeClasses: Record<PageContainerSize, string>` — all used by Task 6 (pilot) and by later phase plans.

- [ ] **Step 1: Write the component**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type PageContainerSize = "default" | "narrow";

/**
 * default matches the existing `.container-wide` CSS class exactly
 * (max-width 1400px, 32px horizontal padding, 24px below the 768px
 * breakpoint). narrow formalizes the ad-hoc `max-w-4xl` nested-content
 * pattern found across Services/Industries/Research/Products.
 */
export const containerSizeClasses: Record<PageContainerSize, string> = {
  default: "max-w-[1400px] px-6 md:px-8",
  narrow: "max-w-4xl px-6 md:px-8",
};

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: PageContainerSize;
}

export function PageContainer({
  size = "default",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto", containerSizeClasses[size], className)} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/ui/primitives/PageContainer.tsx`. (Pre-existing unrelated errors elsewhere in the repo, if any, are not this task's concern — only confirm none are newly introduced by this file.)

- [ ] **Step 3: Commit**

```bash
git add components/ui/primitives/PageContainer.tsx
git commit -m "feat: add PageContainer layout primitive"
```

---

### Task 3: `Section` primitive

**Files:**
- Create: `components/ui/primitives/Section.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`
- Produces: `Section` component, `SectionProps` type, `SectionSize` type (`"tight" | "default" | "emphasized"`), `sectionSizeClasses: Record<SectionSize, string>` — used by Task 6 and later phase plans.

- [ ] **Step 1: Write the component**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SectionSize = "tight" | "default" | "emphasized";

/**
 * tight formalizes the py-12 stat-strip pattern (EnterpriseDashboard,
 * ExecutiveDashboard). default reuses the existing global `.section-pad`
 * class (120px desktop -> 80px at <=768px) rather than redefining those
 * two numbers a second time in Tailwind arbitrary values. emphasized
 * formalizes the deliberate py-32-equivalent CTA/manifesto sections
 * (96px -> 160px, using Tailwind's md: 768px breakpoint to match
 * .section-pad's own breakpoint).
 */
export const sectionSizeClasses: Record<SectionSize, string> = {
  tight: "py-12",
  default: "section-pad",
  emphasized: "py-24 md:py-40",
};

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  size?: SectionSize;
}

export function Section({
  size = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(sectionSizeClasses[size], className)} {...props}>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/ui/primitives/Section.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/ui/primitives/Section.tsx
git commit -m "feat: add Section layout primitive"
```

---

### Task 4: `Card` primitive (+ `CardHeader`/`CardBody`/`CardFooter`)

**Files:**
- Create: `components/ui/primitives/Card.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`; `cva`, `VariantProps` from `class-variance-authority` (Task 1)
- Produces: `Card`, `CardHeader`, `CardBody`, `CardFooter` components; `CardProps` type; `cardVariants` (the raw `cva` function, exported so non-`div` elements like a `<Link>` can apply the same classes — used directly by Task 6's pilot).

- [ ] **Step 1: Write the component**

```tsx
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * size scale: sm=20px, md=24px (default, matches the slightly more
 * common hand-rolled p-6), lg=32px (matches p-8), xl=48px (hero-panel
 * cards, matches p-12). variant has one value today ("surface", the
 * de-facto bg-surface/border-border/rounded-2xl shape found across all
 * 8 in-scope sections) - kept as an explicit axis so a second real
 * appearance is additive later, not a redesign. Do not add more
 * variants without new production usage to justify them.
 */
export const cardVariants = cva("bg-surface border border-border rounded-2xl", {
  variants: {
    size: {
      sm: "p-5",
      md: "p-6",
      lg: "p-8",
      xl: "p-12",
    },
    variant: {
      surface: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "surface",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ size, variant, className, children, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ size, variant }), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 pt-6 border-t border-border flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/ui/primitives/Card.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/ui/primitives/Card.tsx
git commit -m "feat: add Card layout primitive with CardHeader/Body/Footer"
```

---

### Task 5: `Stack` primitive

**Files:**
- Create: `components/ui/primitives/Stack.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/utils`
- Produces: `Stack` component, `StackProps` type, `StackGap` type, `StackDirection` type, `stackGapClasses: Record<StackGap, string>` — used by Task 6 and later phase plans.

- [ ] **Step 1: Write the component**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type StackGap = "xs" | "sm" | "md" | "lg" | "xl";
export type StackDirection = "vertical" | "horizontal";

export const stackGapClasses: Record<StackGap, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

const stackDirectionClasses: Record<StackDirection, string> = {
  vertical: "flex flex-col",
  horizontal: "flex flex-row items-center",
};

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: StackGap;
  direction?: StackDirection;
}

/**
 * Scoped usage: heading -> subtitle -> paragraph -> button rhythm and
 * icon-to-text pairs specifically. Not a blanket replacement for every
 * flex/gap layout in the codebase.
 */
export function Stack({
  gap = "md",
  direction = "vertical",
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div className={cn(stackDirectionClasses[direction], stackGapClasses[gap], className)} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/ui/primitives/Stack.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/ui/primitives/Stack.tsx
git commit -m "feat: add Stack layout primitive"
```

---

### Task 6: Pilot migration — `IntegratedPlatform.tsx`

**Files:**
- Modify: `components/home/v3/IntegratedPlatform.tsx` (full file, currently 82 lines)

**Interfaces:**
- Consumes: `Section`/`sectionSizeClasses` (Task 3), `PageContainer` (Task 2), `Stack` (Task 5), `cardVariants` (Task 4)
- Produces: nothing new — this is the validation step proving all four primitives compose correctly in a real page section.

This component currently has: an outer `<section className="py-24 border-b border-border bg-background">`, an inner `<div className="container-wide">`, an intro block (badge → `h2` → `p`, each with `mb-6`/`mb-16` hand spacing), and a 3-card grid where each card is a `<Link>` (not a `div`) styled as a card with a footer row.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { Database, Bot, Zap, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const products = [
  {
    title: "Knowledge Hub",
    icon: Database,
    desc: "The foundational vector engine. It ingests your legacy databases and documents, transforming them into a semantic graph that agents can read.",
    color: "bg-[#00E5FF]",
    textColor: "text-accent-secondary",
    href: "/products/cerebro-archive"
  },
  {
    title: "AgentOS",
    icon: Bot,
    desc: "The orchestration layer. Deploy specialized agents to handle finance, HR, or operations workflows autonomously.",
    color: "bg-[#7B61FF]",
    textColor: "text-[#7B61FF]",
    href: "/platform/agentos"
  },
  {
    title: "Quantiva ERP",
    icon: Layers,
    desc: "The first AI-native ERP. Designed from the ground up to be operated by agents rather than human data-entry clerks.",
    color: "bg-accent-primary",
    textColor: "text-accent-primary",
    href: "/products"
  }
];

export default function IntegratedPlatform() {
  return (
    <Section size="default" className="border-b border-border bg-background">
      <PageContainer>
        <Stack gap="md" className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-accent-primary font-bold w-fit">
            <Zap size={12} /> The Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">Built to work together.</h2>
          <p className="text-lg text-text-secondary max-w-2xl font-inter">
            We don't sell disconnected tools. CerebroHive is an integrated suite designed to move your enterprise from static data to autonomous execution.
          </p>
        </Stack>

        <div className="grid lg:grid-cols-3 gap-6">
          {products.map((prod, i) => (
            <Link
              key={i}
              href={prod.href}
              className={cn(
                cardVariants({ size: "lg" }),
                "group hover:border-border-strong transition-all flex flex-col relative overflow-hidden h-full cursor-pointer"
              )}
            >
              <div className={cn("absolute top-0 left-0 w-full h-1", prod.color)} />

              <div className={cn("w-12 h-12 rounded-xl bg-surface flex items-center justify-center mb-6", prod.textColor)}>
                <prod.icon size={24} />
              </div>

              <h3 className="text-2xl font-space font-bold text-text-primary mb-4">{prod.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-8 flex-1">{prod.desc}</p>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-text-primary transition-colors">
                  Explore Product
                </span>
                <ArrowRight size={16} className={cn("transition-transform group-hover:translate-x-1", prod.textColor)} />
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
```

Note: the card grid keeps its own `<div className="grid lg:grid-cols-3 gap-6">` rather than `Stack` — `Stack`'s scoped use (per Task 5) is heading rhythm and icon/text pairs, not arbitrary grids, so this is intentionally left as plain Tailwind. The `w-fit` on the badge is a required addition (not in the original): `Stack` renders `flex flex-col`, whose default `align-items: stretch` would otherwise stretch the inline badge to the container's full width, which `inline-flex` alone prevented in the original hand-rolled markup.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/home/v3/IntegratedPlatform.tsx`.

- [ ] **Step 3: Lint**

Run: `npm run lint -- --file components/home/v3/IntegratedPlatform.tsx`
Expected: no new errors (pre-existing repo-wide lint warnings unrelated to this file are not this task's concern).

- [ ] **Step 4: Visual verification**

Run: `npm run dev` (leave running), then open `http://localhost:3000` in a browser.

Check the "Built to work together." section at these breakpoints (resize the browser or use devtools device toolbar):
- Desktop: 1440px, 1280px
- Tablet: 1024px, 768px
- Mobile: 430px, 390px, 360px

At each: confirm no horizontal overflow, the 3 cards keep identical internal padding/shape to before (visually 32px/`p-8` all around, unchanged), the section's vertical spacing above/below is now taller on desktop than before (this is the intended, documented change — `.section-pad`'s 120px replacing the old fixed 96px `py-24`) and compresses on mobile (`.section-pad`'s 80px at <=768px) rather than staying fixed, the heading block (badge/h2/p) spacing looks even, and the badge pill is not stretched full-width.

Stop the dev server when done (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add components/home/v3/IntegratedPlatform.tsx
git commit -m "refactor: migrate IntegratedPlatform to Section/PageContainer/Card/Stack primitives"
```

---

## Self-Review Notes

- **Spec coverage:** All four primitives from the spec's Component API section are covered (Tasks 2-5). The spec's Architecture decisions (CVA only for `Card`, `Section`/`PageContainer` decoupled, `Stack`'s scoped usage) are each encoded as either a Global Constraint or an inline code comment, not left implicit. Phase 0's "pilot on one real section" requirement is Task 6. Phases 1-9 (per-page rollout, heading standardization) and Phase 10 (audit script extension) are out of scope for this plan by design — each gets its own plan when reached, since their exact steps depend on this phase's real primitive shapes rather than a guessed API.
- **Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code or an exact command with expected output.
- **Type consistency:** `cardVariants({ size: "lg" })` in Task 6 matches the `size` key names defined in Task 4 (`sm`/`md`/`lg`/`xl`); `Section size="default"` and `Stack gap="md"` match the exact union values defined in Tasks 3 and 5.
