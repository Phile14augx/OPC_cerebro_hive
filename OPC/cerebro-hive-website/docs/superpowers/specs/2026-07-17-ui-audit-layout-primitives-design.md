# UI/UX Enterprise Audit — Layout Primitives & Rollout Design

**Date:** 2026-07-17
**Scope:** Landing, Services, Platform, Industries, Products, Research, Insights, Company (8 sections; other routes such as Dashboard, Enterprise, Academy, Careers, Legal, Docs are explicitly out of scope for this pass)

## Problem

The site's spacing/padding/alignment is visually inconsistent across pages, despite `app/globals.css` already defining a coherent spacing system (`.container-wide`, `.section-pad`, `.section-pad-sm`, `.card-pad`, `.card-pad-sm`, `.card-pad-lg`). A codebase survey of the 8 in-scope sections found:

- **Container**: `.container-wide` (max-width 1400px, padding 32px→24px responsive) is already used near-universally (Navbar, Footer, all 8 sections) — this is a solved problem, not a redesign target.
- **Section vertical spacing**: two competing systems coexist arbitrarily — `py-24` (Tailwind, fixed 96px, no mobile scale-down; dominant in home, services-extras, products/v2, research/v2, insights/v2, company/v3) vs `.section-pad` (CSS, 120px→80px responsive; dominant in platform, industries, and `[slug]` renderer pages). This is the single biggest inconsistency found.
- **Card padding**: `p-6` and `p-8` are used almost interchangeably for the same de-facto card shape (`bg-surface border border-border rounded-2xl`), hand-rolled dozens of times instead of using the existing `.card-pad` utilities or the `GlassCard` component (which is defined but used in exactly one, non-live, legacy file).
- **Named outliers**: `components/products/HeroEcosystem.tsx` uses `max-w-[1200px] mx-auto px-6` instead of `.container-wide` (no responsive px scaling); `EnterpriseDashboard.tsx` (home) and `ExecutiveDashboard.tsx` (insights) use an undocumented `py-12` "compact section" pattern.
- `SectionHeading` (the existing heading component) is used 52 times but roughly 99 component files still hand-roll equivalent heading markup — partial, not standardized, adoption.

Full checklist context (typography rhythm, icon alignment, button polish, borders, shadows, responsive behavior, accessibility, etc.) came from the user's original enterprise-audit brief; this design focuses on the structural fix (shared layout primitives) that the biggest, most systemic issues require, with the remaining checklist items addressed per-page during rollout.

## Non-goals

- No redesign of layout, branding, colors, typography scale, or animations (per explicit user instruction).
- No component removal — `GlassCard` stays even though it's underused; it is simply not used as the base for the new `Card` primitive.
- No pages outside the 8 listed sections in this pass.
- No visual regression tooling introduced — verification is manual (dev server + browser at multiple breakpoints).

## Design

### Architecture

New directory `components/ui/primitives/` with four components using the existing `cn()` helper (`clsx` + `tailwind-merge`, already used throughout the codebase) for class composition. `class-variance-authority` (new dependency) is used **only for `Card`**, the one primitive with a genuine multi-axis variant surface (`size` × `variant`); `PageContainer`, `Section`, and `Stack` each have a single small variant axis and are implemented as plain typed lookup objects (e.g. `const sizeClasses: Record<Size, string> = {...}`) — simpler, smaller, and easier to read than a variant library for that shape of API. The primitives codify the pixel values already defined in `globals.css` — they do not invent a new spacing language.

`Section` and `PageContainer` are deliberately **not** coupled — `Section` owns vertical rhythm only, `PageContainer` owns horizontal width only. Call sites compose them explicitly (`<Section><PageContainer>...</PageContainer></Section>`), mirroring the outer-padding/inner-max-width structure already present in the hand-rolled markup being replaced, rather than giving `Section` a second responsibility.

### Component API

**`PageContainer`** (plain lookup map)
- `size`: `"default"` (1400px max-width, matches `.container-wide` exactly) | `"narrow"` (896px, formalizes the ad-hoc `max-w-4xl mx-auto` nested-narrow-content pattern seen in Services/Industries/Research/Products)

**`Section`** (plain lookup map)
- `size`: `"tight"` (48px, formalizes the `py-12` stat-strip pattern) | `"default"` (120px→80px responsive, matches `.section-pad`; this is the value that replaces raw `py-24` everywhere it appears) | `"emphasized"` (160px→96px, formalizes the deliberate `py-32` CTA/manifesto sections)
- No container prop — compose with `PageContainer` explicitly (see Architecture above)

**`Card`** (cva; + optional `CardHeader`, `CardBody`, `CardFooter` sub-components)
- `size`: `"sm"` (20-24px) | `"md"` (24px, default) | `"lg"` (32px) | `"xl"` (48px, hero-panel cards)
- `variant`: `"surface"` (default and, for now, only value — codifies the de-facto shape `bg-surface border border-border rounded-2xl` found across all 8 sections). Kept as an explicit variant axis rather than baked-in styling so a second real appearance (if one is ever actually needed) is a non-breaking addition, not an API change. No other variants are built now — the survey found exactly one production card shape in active use; `GlassCard`, the only other card shape in the codebase, is dead code (one legacy, non-live usage), so a `ghost`/`glass`/`interactive`/`feature` variant matrix would have zero call sites at ship time.
- Sub-components are optional — `Card` works standalone for simple cases, sub-components exist for internal rhythm (icon → heading → body → button) where a card has multiple distinct content blocks

**`Stack`** (plain lookup map)
- `gap`: `xs`(8) `sm`(16) `md`(24) `lg`(32) `xl`(48)
- `direction`: `"vertical" | "horizontal"`
- Scoped usage: heading→subtitle→paragraph→button rhythm and icon-to-text spacing specifically — not a blanket replacement for every `flex gap-*`/`space-y-*` in the codebase. Keeping its use case narrow avoids it becoming an abstraction developers route around.
- Not building `Row`/`Column`/`Grid` siblings now (no in-scope page currently needs a typed grid primitive per the survey); if a real repeated grid pattern shows up during rollout, `Stack` can grow siblings under the same `components/ui/primitives/` directory later without disrupting this design.

### Spacing scale

`8, 16, 24, 32, 48, 80, 96, 120, 160` — a 4/8 grid. Every variant value maps to a pixel value already present in `globals.css` or in the dominant hand-rolled Tailwind classes found in the survey; no arbitrary new values are introduced.

### Rollout plan

**Phase 0 — Build primitives.** Add `class-variance-authority`, implement the 4 primitives + 3 Card sub-components, pilot on one real section to confirm visual parity before touching other pages.

**Phases 1–8 — one per section, in this order:**
1. Landing (`app/page.tsx`, `components/home/v3/*`)
2. Services (`app/services/*`, `components/services/*`)
3. Platform (`app/platform/*` — markup lives directly in page files, no separate component dir)
4. Industries (`app/industries/*`, `components/industries/*`)
5. Products (`app/products/*`, `components/products/*`, `components/products/v2/*` — includes fixing the `HeroEcosystem.tsx` container outlier)
6. Research (`app/research/*`, `components/research/v2/*`)
7. Insights (`app/insights/*`, `components/insights/v2/*`)
8. Company (`app/company/*`, `components/company/v3/*`)

Each page phase: (a) migrate hand-rolled container/section/card markup to the new primitives — this alone resolves the `py-24`/`.section-pad` split and the `p-6`/`p-8` inconsistency for that page; (b) do a full pass against the remaining non-heading checklist items for that page specifically — icon alignment, button polish, text-boundary/edge-touching, responsive behavior at mobile/tablet/desktop, divider/border-radius/shadow consistency — fixing what's found.

**Phase 9 — Heading standardization.** Migrate the ~99 hand-rolled heading blocks to `SectionHeading` across all 8 sections, as its own dedicated pass. Kept separate from Phases 1–8 because heading markup changes produce much larger visual diffs than padding/container swaps, and bundling them would make each page phase harder to review and to isolate if something regresses. Not a blanket find-replace — some hand-rolled headings may have legitimate one-off needs `SectionHeading` doesn't cover; those are left as-is and noted.

**Phase 10 — Regression guardrail.** Add a scoped ESLint rule flagging raw `py-24`, `p-6`/`p-8` card padding, and `max-w-[...]` container widths outside `components/ui/primitives/`, so the codebase doesn't drift back to hand-rolled spacing after this migration. Added last, once the primitives are the established pattern across all 8 sections — enforcing it earlier would flag legitimate not-yet-migrated code.

### Principles

These are the human-readable rules the Phase 10 lint rule enforces mechanically; stating them explicitly gives reviewers (and future contributors) a standard to check new code against even before the lint rule catches it:

- Never set page/section vertical rhythm with raw `py-*` — use `Section`.
- Never set content width with raw `max-w-*` — use `PageContainer`.
- Never hand-build the standard surface card shape — use `Card`.
- Prefer composing primitives over nesting utility classes for layout structure; primitives own spacing, feature components own content.

### Verification

No visual regression tooling exists in this project. Each phase is verified by starting the dev server and viewing the affected page(s) in a browser at these breakpoints, before and after the change:

- **Desktop:** 1440px, 1280px
- **Tablet:** 1024px, 768px
- **Mobile:** 430px, 390px, 360px

At each breakpoint, check: no horizontal overflow, section vertical rhythm looks intentional, card alignment/padding is even, CTA button alignment, footer spacing, icon alignment. This follows the project's own standing guidance to test UI changes visually rather than relying on typecheck/build alone.

A formal migration-progress dashboard (per-page/per-primitive completion percentages) was considered and declined: at 9 phases across 8 pages, the phase-by-phase plan itself (one phase = one page, marked complete when done) already gives equivalent binary progress visibility without building and maintaining a separate tracking artifact.

### Risks / open questions

- `Section`'s `default` size (120px→80px) is *larger* than the current `py-24` (96px fixed) it replaces on pages using that pattern — sections will get visibly taller on desktop and get real mobile scale-down they didn't have before. This is an intended visual change (making `py-24` pages consistent with the already-responsive `.section-pad` pages), not a bug, but will be visible in diffs/screenshots.
- The survey found nested narrow-content widths of `max-w-4xl`, `max-w-5xl`, and `max-w-6xl` used inconsistently inside `.container-wide`. Only `max-w-4xl` (the most common case) gets a named `PageContainer` variant (`"narrow"`, 896px); `5xl`/`6xl` usages are page-specific exceptions and remain as inline Tailwind rather than being forced into a shared variant.

**Considered and declined:**
- *Reserve additional unused `PageContainer` size variants (`full`, `wide`, `content`) now, for future-proofing.* Declined — `size` is a TypeScript union; adding a new value later when an actual need exists is a trivial, non-breaking change, so there's no real API-stability benefit to pre-declaring variants with zero current call sites.
- *Build a broader `Card` variant matrix (`ghost`, `glass`, `interactive`, `feature`, `dashboard`, ...) now.* Declined for the same reason — none of these have any usage in the surveyed codebase today; `variant` is kept as an open axis (see Component API) so adding one later is additive, not a redesign.
