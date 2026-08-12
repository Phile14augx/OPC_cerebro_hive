# Phase 2: Services Rollout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Services area (`app/services/page.tsx` index page + the `[slug]` renderer's 8 `sections/*.tsx` components, plus the 8 standalone components the index page composes) to the `Section`/`PageContainer`/`Card`/`Stack` primitives, and fix a real bug found during the survey: `.container-narrow` is referenced in 3 Services files (and 3 Products files, out of scope for this phase) but never defined in `globals.css`, so those sections currently render with zero width constraint.

**Architecture:** Same primitives as Phases 0/1, no changes to their implementation. Two structurally different areas are both in scope: the hand-rolled index page (`app/services/page.tsx` + 8 components it composes) and the data-driven `[slug]` detail-page renderer (`ServiceRenderer.tsx` reads `service.config.sections` and looks up components in `SectionRegistry.ts` — the actual markup lives in the 8 `components/services/sections/*.tsx` files, which already use the shared `SectionHeading` component for their headings, unlike the index-page components).

**Tech Stack:** Same as Phases 0/1 — Next.js 15, React, Tailwind CSS, `cn()`, `class-variance-authority` (already installed).

## Global Constraints

- Primitives are already built (Phase 0) — do not modify `components/ui/primitives/*`.
- **The `.container-narrow` bug:** `ServiceMethodology.tsx`, `ServiceFAQ.tsx`, and `ServiceCTA.tsx` use `className="container-narrow"`, a class that does not exist anywhere in `app/globals.css` (confirmed via `grep -r "container-narrow"` across the repo — it also appears in 3 Products files, which are out of scope for this phase and will be fixed in the Products phase). Replace `container-narrow` with `PageContainer size="narrow"` in all three files in this phase — this is both the primitive migration and the bug fix in one change.
- Only migrate markup matching the Card primitive's exact shape (`bg-surface`/`bg-surface-elevated`, `border border-border`, `rounded-2xl`, padding at `p-6` or `p-8`). Do NOT force `rounded-xl` items (small link tiles, FAQ accordion items, deliverable list rows), asymmetric `border-l-4` alert boxes, or `rounded-[2rem]` premium cards (`ServiceCardProgressive.tsx`) into `Card` — none of these match its shape, per the same reasoning applied in Phase 1.
- **`ServiceCardProgressive.tsx` is explicitly out of scope** — it's a bespoke `rounded-[2rem]`/`bg-surface-elevated` card, structurally and visually distinct from the `Card` primitive's shape, same category as Phase 1's `EnterpriseReadiness` panel. No task touches this file.
- **`ServiceMorphBackground.tsx`, `ServiceAnimationContext.tsx`, `ServicesHeroBg.tsx` are explicitly out of scope** — confirmed via `grep` to contain zero container/section/card patterns; they are visual-effect and context-provider files with no layout markup.
- Where a card's background differs from `Card`'s default (`bg-surface-elevated` instead of `bg-surface`, or a gradient), apply `cardVariants({ size: ... })` and override the background in the trailing `className` — this is safe even for gradients, since `bg-gradient-to-br`/`from-*`/`to-*` are background-*image* utilities that render on top of the `bg-surface` background-*color* utility without conflicting.
- Where a nested narrow-content wrapper combines `container-wide` with a second `max-w-*` class directly on the same element (`max-w-5xl`, `max-w-6xl` — found in `ExecutiveSummary.tsx`, `ConsultingCapabilityMatrix.tsx`, `ResearchInnovation.tsx`), replace with `<PageContainer><div className="max-w-{5xl|6xl} mx-auto">` — nesting a plain div guarantees the intended narrower width unambiguously (the original's two competing `max-width` sources on one element made its actual rendered width dependent on CSS cascade order between a custom class and a Tailwind utility). Where the second class is exactly `max-w-4xl` with its own `mx-auto` already present (`ConsultingProcessTimeline.tsx`), replace directly with `<PageContainer size="narrow">` — no nesting needed, since that's an exact match for the named variant.
- `Stack`'s scoped usage is the badge/label → heading → paragraph intro rhythm. Do not apply it to content flows that mix a heading with a `Link` or button as if it were the same rhythm (e.g. `ResearchInnovation.tsx`'s two-column text side, `ServiceCTA.tsx`'s plain-text eyebrow label with a non-standard 16px gap) — those are left as hand-rolled, matching the discipline already established in Phase 1 for `ResearchHighlights.tsx`'s outer row.
- Fix `react/no-unescaped-entities` ESLint errors only where they occur inside text already being touched by this plan's `Stack`/`Card`/`PageContainer` migrations (verify with `npx eslint` before relying on any specific line numbers — do not assume Phase 1's findings apply here).
- Path alias `@/*` maps to repo root; primitives import as `@/components/ui/primitives/<Name>`.

---

### Task 1: `app/services/page.tsx`

**Files:**
- Modify: `app/services/page.tsx` (full file, 149 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack` (Phase 0)

Three sections in this file: the hero (custom `min-h-screen` rhythm, like Phase 1's `HomeHero` — only `container-wide` → `PageContainer`, outer `<section>` stays raw), the inline "Core Consulting Capabilities" section (`section-pad` → `Section size="default"`, `container-wide` → `PageContainer`, its `h2`+`p` intro → `Stack`), and the final CTA section (`section-pad` → `Section size="default"`, `container-wide` → `PageContainer`; its content uses a deliberate escalating-space pattern — `mb-8`/`mb-12`/`mb-16` between heading/paragraph/CTA, not the uniform intro rhythm — left as hand-rolled per the Global Constraints). The `ServiceCardProgressive` cards rendered inside the capabilities section are untouched (out of scope, see Global Constraints).

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ServiceMorphBackground } from "@/components/services/ServiceMorphBackground";
import { ArrowRight, Brain, Bot, Database, Code2, GraduationCap } from "lucide-react";
import { ExecutiveSummary } from "@/components/services/ExecutiveSummary";
import { BusinessOutcomesGrid } from "@/components/services/BusinessOutcomesGrid";
import { IndustryMapping } from "@/components/services/IndustryMapping";
import { InteractiveCapabilityMap } from "@/components/services/InteractiveCapabilityMap";
import { ConsultingCapabilityMatrix } from "@/components/services/ConsultingCapabilityMatrix";
import { TechStackShowcase } from "@/components/services/TechStackShowcase";
import { ConsultingProcessTimeline } from "@/components/services/ConsultingProcessTimeline";
import { ResearchInnovation } from "@/components/services/ResearchInnovation";
import { ServiceCardProgressive, ProgressiveServiceProps } from "@/components/services/ServiceCardProgressive";
import { ServiceAnimationProvider } from "@/components/services/ServiceAnimationContext";
import { services } from "@/lib/data/services";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

// Map the new data model to the existing progressive service props
const servicesData: ProgressiveServiceProps[] = services.map(s => ({
  id: s.slug,
  title: s.title,
  color: s.id === "ai-strategy" ? "#00E5FF" : s.id === "intelligence-modernization" ? "#FF8A00" : "#7B61FF",
  icon: Brain, // We use a default icon here, ideally we should import icons or map them dynamically
  problem: s.summary,
  outcome: s.deliverables.join(", "),
  methodology: s.engagementModel,
  link: `/services/${s.slug}`
}));

export default function ServicesPage() {
  const scrollContainerRef = useRef<HTMLElement>(null);

  return (
    <ServiceAnimationProvider>
      <div className="bg-background min-h-screen selection:bg-primary-accent/30 transition-colors duration-500">

      {/* Premium Hero Section */}
      <section ref={scrollContainerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <ServiceMorphBackground scrollContainerRef={scrollContainerRef} />

        <PageContainer className="relative z-10 flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0.4, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise AI Consulting</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
              Engineering Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00F57A]">Intelligent Future</span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
              We help enterprises design AI strategy, build production-grade AI systems, automate operations, and create measurable business value—from executive vision to deployment.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Schedule AI Strategy Workshop — Services Hero" className="group relative">
                <div className="absolute inset-0 bg-primary-accent blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg" />
                <button className="relative px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                  Schedule an AI Strategy Workshop
                </button>
              </TrackedLink>
              <TrackedLink href="#capabilities" analyticsEvent="anchor_click" analyticsCategory="navigation" analyticsLabel="Explore Capabilities — Services Hero" className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface-elevated transition-all duration-300">
                Explore Capabilities
              </TrackedLink>
            </div>
          </motion.div>
        </PageContainer>
      </section>

      {/* New Modular Sections Flow */}
      <ExecutiveSummary />
      <BusinessOutcomesGrid />
      <IndustryMapping />
      <InteractiveCapabilityMap />

      {/* Service Capabilities (Progressive Disclosure) */}
      <Section id="capabilities" size="default" className="bg-background relative z-10 scroll-mt-20">
        <PageContainer>
          <Stack gap="md" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
              Core Consulting Capabilities
            </h2>
            <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
              Specialized practices combining deep domain expertise with world-class engineering execution.
            </p>
          </Stack>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {servicesData.map((service, index) => (
              <ServiceCardProgressive key={service.id} service={service} index={index} />
            ))}
          </div>
        </PageContainer>
      </Section>

      <TechStackShowcase />
      <ConsultingCapabilityMatrix />
      <ConsultingProcessTimeline />
      <ResearchInnovation />

      {/* Final Premium CTA Section */}
      <Section size="default" className="relative overflow-hidden bg-surface-elevated border-t border-border z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-surface-elevated" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <PageContainer className="relative z-10">
          <motion.div
            initial={{ opacity: 0.4, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary leading-tight mb-8">
              Ready to Architect Your <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">AI Transformation?</span>
            </h2>

            <p className="text-lg text-text-secondary font-inter max-w-[700px] mx-auto leading-relaxed mb-12">
              Speak with a Principal Solutions Architect today to discuss your enterprise requirements and explore our engagement models.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
              <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Request AI Maturity Assessment — Services CTA" className="group relative">
                <div className="absolute inset-0 bg-primary-accent blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg" />
                <button className="relative px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                  Request an AI Maturity Assessment
                  <ArrowRight size={16} />
                </button>
              </TrackedLink>
            </div>
          </motion.div>
        </PageContainer>
      </Section>
    </div>
    </ServiceAnimationProvider>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "app/services/page"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint app/services/page.tsx`
Expected: no new errors (check output; if pre-existing warnings appear, confirm they're unrelated to this change before proceeding).

- [ ] **Step 4: Commit**

```bash
git add app/services/page.tsx
git commit -m "refactor: migrate Services index page to Section/PageContainer/Stack primitives"
```

---

### Task 2: `ExecutiveSummary.tsx`

**Files:**
- Modify: `components/services/ExecutiveSummary.tsx` (full file, 38 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer` (Phase 0)

`section-pad-sm` maps directly to `Section size="tight"`... **correction:** `.section-pad-sm` (80px flat) is a different value from `Section`'s `tight` (48px, formalizing `py-12`). Neither existing `Section` size matches 80px flat exactly (`default` is 120px→80px responsive, `tight` is 48px). Since this file's `section-pad-sm` value (80px, no further mobile reduction) most closely matches `Section`'s `default` size at *mobile* width only, and no size is an exact match, use `size="default"` — it under-shoots on desktop (80px vs the file's current 80px, i.e. **no change**, since `.section-pad-sm` never scales past 80px) — wait, re-verify: `default` is 120px desktop. Using `default` would make this section *taller* than before (120px vs the original flat 80px). Given no exact match exists, keep this section's spacing as-is with a direct Tailwind class rather than force a mismatched primitive size — do not migrate `section-pad-sm` in this task; only migrate the container. This is a smaller, deliberately compact section (a one-paragraph exec summary, not a full feature section) and forcing it to `default`'s 120px would visually overweight it relative to its content.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

export function ExecutiveSummary() {
  return (
    <section className="section-pad-sm relative z-10 border-b border-border bg-background">
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0.4, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border mb-8 shadow-sm">
              <Target size={14} className="text-primary-accent" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
                How We Help
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary leading-tight mb-8">
              From AI Strategy to Enterprise Scale
            </h2>

            <p className="text-lg md:text-xl text-text-secondary font-inter leading-relaxed max-w-4xl mx-auto">
              We partner with executive teams to identify high-impact AI opportunities,
              design production-ready architectures, implement secure intelligent systems,
              and establish governance frameworks for long-term business value.
            </p>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ExecutiveSummary"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/ExecutiveSummary.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/ExecutiveSummary.tsx
git commit -m "refactor: migrate ExecutiveSummary container to PageContainer primitive"
```

---

### Task 3: `BusinessOutcomesGrid.tsx`

**Files:**
- Modify: `components/services/BusinessOutcomesGrid.tsx` (full file, 90 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

The intro's outer `flex flex-col md:flex-row md:items-end justify-between gap-6` row now wraps only one child (the `max-w-2xl` text block) — `justify-between` has nothing to justify against, but that's pre-existing dead styling, not something this migration should silently clean up (out of scope). Only the inner `h2`/`p` becomes `Stack`. The 6 outcome cards (`p-8 rounded-2xl bg-background border border-border`) are an exact `Card` `lg` match.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, Bot, Rocket, Settings2, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const outcomes = [
  {
    icon: TrendingDown,
    title: "Reduce Operational Costs",
    description: "Automate manual knowledge-work, eliminate redundant processes, and reduce error rates across the enterprise.",
    color: "#00E5FF"
  },
  {
    icon: Bot,
    title: "Deploy Autonomous Agents",
    description: "Orchestrate multi-agent systems that reason, plan, and execute complex workflows without human intervention.",
    color: "#00F57A"
  },
  {
    icon: Rocket,
    title: "Accelerate Software Delivery",
    description: "Integrate generative AI into development lifecycles to increase engineering velocity and code quality.",
    color: "#FF8A00"
  },
  {
    icon: Settings2,
    title: "Modernize Legacy Systems",
    description: "Connect isolated data silos and legacy architectures to modern AI inference engines via secure APIs.",
    color: "#7B61FF"
  },
  {
    icon: Zap,
    title: "Improve Customer Experience",
    description: "Deploy contextual, RAG-enabled interfaces that provide immediate, accurate resolutions to complex queries.",
    color: "#FF2ED1"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise AI Governance",
    description: "Establish robust risk management frameworks, compliance checks, and security guardrails for AI adoption.",
    color: "#00C8FF"
  }
];

export function BusinessOutcomesGrid() {
  return (
    <Section size="default" className="bg-surface relative z-10 overflow-hidden">
      <PageContainer>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <Stack gap="md" className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary leading-tight">
              Driving Strategic <br /> Business Outcomes
            </h2>
            <p className="text-lg text-text-secondary font-inter">
              Executives invest in outcomes, not technologies. We architect AI solutions that deliver measurable impact across the enterprise value chain.
            </p>
          </Stack>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((outcome, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.4, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(cardVariants({ size: "lg" }), "hover:border-border-strong transition-all duration-300 group")}
            >
              <div
                className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${outcome.color}15`, color: outcome.color }}
              >
                <outcome.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-space font-bold text-text-primary mb-3">
                {outcome.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {outcome.description}
              </p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "BusinessOutcomesGrid"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/BusinessOutcomesGrid.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/BusinessOutcomesGrid.tsx
git commit -m "refactor: migrate BusinessOutcomesGrid to Section/PageContainer/Stack/Card primitives"
```

---

### Task 4: `IndustryMapping.tsx`

**Files:**
- Modify: `components/services/IndustryMapping.tsx` (full file, 118 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

Intro (`h2`+`p`, no badge, centered) → `Stack`. The industry link-cards (`Link` inside a `motion.div`, `p-8 rounded-2xl bg-background border border-border`) are an exact `Card` `lg` match, applied via `cardVariants` on the `Link` (same pattern as Phase 0's pilot).

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building, Stethoscope, Briefcase, ShoppingBag, Factory, Shield, Cpu, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const industries = [
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    icon: Stethoscope,
    description: "Clinical documentation automation, HIPAA-compliant RAG for patient history, and medical imaging analysis.",
    link: "/industries/healthcare",
    color: "#00E5FF"
  },
  {
    id: "finance",
    name: "Financial Services",
    icon: Briefcase,
    description: "Algorithmic risk assessment, automated compliance checking, and intelligent document processing.",
    link: "/industries/financial-services",
    color: "#00F57A"
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    icon: ShoppingBag,
    description: "Hyper-personalized recommendation engines, dynamic pricing models, and supply chain forecasting.",
    link: "/industries/retail",
    color: "#FF8A00"
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    description: "Predictive maintenance, computer vision for quality control, and autonomous inventory management.",
    link: "/industries/manufacturing",
    color: "#7B61FF"
  },
  {
    id: "government",
    name: "Government & Public Sector",
    icon: Shield,
    description: "Secure data lakehouses, citizen service chatbots, and automated policy analysis.",
    link: "/industries/government",
    color: "#FF2ED1"
  },
  {
    id: "technology",
    name: "Technology & SaaS",
    icon: Cpu,
    description: "AI-native feature development, automated tier-1 support, and intelligent product onboarding.",
    link: "/industries/technology",
    color: "#00C8FF"
  }
];

export function IndustryMapping() {
  return (
    <Section size="default" className="bg-surface-elevated border-y border-border">
      <PageContainer>
        <Stack gap="md" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
            Industries We Serve
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            Deep domain expertise combined with bleeding-edge AI engineering. We build
            solutions tailored to the regulatory and operational realities of your sector.
          </p>
        </Stack>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.id}
              initial={{ opacity: 0.4, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={industry.link}
                className={cn(cardVariants({ size: "lg" }), "group block hover:border-primary-accent/50 transition-all duration-300 h-full relative overflow-hidden")}
              >
                {/* Subtle gradient glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${industry.color}, transparent 60%)` }}
                />

                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-border"
                    style={{ color: industry.color }}
                  >
                    <industry.icon size={20} />
                  </div>
                  <h3 className="text-lg font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                    {industry.name}
                  </h3>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {industry.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-text-muted group-hover:text-primary-accent transition-colors">
                  Explore Solutions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "IndustryMapping"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/IndustryMapping.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/IndustryMapping.tsx
git commit -m "refactor: migrate IndustryMapping to Section/PageContainer/Stack/Card primitives"
```

---

### Task 5: `InteractiveCapabilityMap.tsx`

**Files:**
- Modify: `components/services/InteractiveCapabilityMap.tsx` (full file, 204 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

Intro (badge/`h2`/`p`, centered) → `Stack` with the `w-fit mx-auto` badge treatment. The scenario-selector buttons (`rounded-xl`, state-dependent background) are left untouched, same reasoning as Phase 1's `HumanProof`/`LivingDigitalTwin` selectors. The "Interactive Map Area" panel (`bg-surface rounded-2xl border border-border p-8 md:p-12`) is a `Card` `lg` match with a `md:p-12` override, same pattern used repeatedly in Phase 1. Its internal node/animation content is untouched.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, ArrowRight, ShieldCheck, Database, Bot, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

type MapNode = {
  id: string;
  label: string;
  icon?: any;
  type: "industry" | "problem" | "service" | "solution" | "layer";
  color?: string;
};

type Scenario = {
  id: string;
  industry: string;
  nodes: MapNode[];
  description: string;
};

const scenarios: Scenario[] = [
  {
    id: "healthcare-claims",
    industry: "Healthcare",
    description: "Automating medical claims processing while ensuring HIPAA compliance and data security.",
    nodes: [
      { id: "h1", label: "Healthcare", type: "industry", color: "#00E5FF" },
      { id: "h2", label: "Claims Automation", type: "problem" },
      { id: "h3", label: "AI Agents", type: "service", icon: Bot, color: "#00F57A" },
      { id: "h4", label: "Knowledge Retrieval", type: "solution", icon: Database },
      { id: "h5", label: "Compliance Layer", type: "layer", icon: ShieldCheck, color: "#FF8A00" }
    ]
  },
  {
    id: "finance-risk",
    industry: "Financial Services",
    description: "Real-time algorithmic risk assessment using distributed data lakes and agentic reasoning.",
    nodes: [
      { id: "f1", label: "Financial Services", type: "industry", color: "#00F57A" },
      { id: "f2", label: "Risk Assessment", type: "problem" },
      { id: "f3", label: "Data Engineering", type: "service", icon: Database, color: "#7B61FF" },
      { id: "f4", label: "Agentic Reasoning", type: "solution", icon: Bot },
      { id: "f5", label: "Audit Trail", type: "layer", icon: ShieldCheck, color: "#00C8FF" }
    ]
  },
  {
    id: "retail-supply",
    industry: "Retail",
    description: "Predicting supply chain disruptions using historical data and generative forecasting models.",
    nodes: [
      { id: "r1", label: "Retail", type: "industry", color: "#FF8A00" },
      { id: "r2", label: "Supply Chain", type: "problem" },
      { id: "r3", label: "Custom AI Dev", type: "service", icon: Network, color: "#FF2ED1" },
      { id: "r4", label: "Demand Forecasting", type: "solution" },
      { id: "r5", label: "Security & IAM", type: "layer", icon: ShieldCheck, color: "#00E5FF" }
    ]
  }
];

export function InteractiveCapabilityMap() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0].id);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId)!;

  return (
    <Section size="default" className="bg-background relative overflow-hidden border-b border-border">
      {/* Background Neural Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <PageContainer className="relative z-10">
        <Stack gap="md" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border w-fit mx-auto">
            <Network size={14} className="text-primary-accent" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
              Enterprise AI Capability Map
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-bold text-text-primary">
            Explore AI Value Chains
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            See how we connect industry challenges to AI capabilities, architecting end-to-end solutions that drive enterprise value.
          </p>
        </Stack>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* Sidebar / Filters */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-2">Select Industry Scenario</h4>
            {scenarios.map(scenario => {
              const isActive = scenario.id === activeScenarioId;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenarioId(scenario.id)}
                  className={cn(
                    "p-5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                    isActive
                      ? "bg-surface-elevated border-primary-accent/50 shadow-md"
                      : "bg-surface border-border hover:border-text-muted/30"
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="active-scenario-bg" className="absolute inset-0 bg-primary-accent/5 pointer-events-none" />
                  )}
                  <h3 className={cn(
                    "text-sm font-space font-bold mb-2 transition-colors",
                    isActive ? "text-primary-accent" : "text-text-primary"
                  )}>
                    {scenario.industry}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-inter">
                    {scenario.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Interactive Map Area */}
          <div className={cn(cardVariants({ size: "lg" }), "w-full lg:w-2/3 min-h-[400px] md:p-12 relative flex items-center justify-center")}>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0.4, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative z-10"
              >

                {/* Connecting Lines (Desktop only) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2 z-0" />
                <motion.div
                  className="hidden md:block absolute top-1/2 left-0 h-[2px] bg-primary-accent/50 -translate-y-1/2 z-0"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {activeScenario.nodes.map((node, i) => (
                  <React.Fragment key={node.id}>

                    {/* The Node */}
                    <motion.div
                      initial={{ opacity: 0.4, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.2 }}
                      className="relative z-10 flex flex-col items-center group cursor-default"
                    >
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center border bg-background shadow-sm transition-transform duration-300 group-hover:-translate-y-2",
                          node.type === "layer" ? "rounded-full" : ""
                        )}
                        style={{ borderColor: node.color || 'var(--border)' }}
                      >
                        {node.icon ? (
                          <node.icon size={24} style={{ color: node.color || 'var(--text-secondary)' }} />
                        ) : (
                          <span className="text-xs font-bold text-text-primary uppercase">{i + 1}</span>
                        )}
                      </div>

                      <div className="mt-4 text-center w-24">
                        <span className="block text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">
                          {node.type}
                        </span>
                        <span className="text-xs font-medium text-text-primary leading-tight">
                          {node.label}
                        </span>
                      </div>
                    </motion.div>

                    {/* Mobile arrow (hidden on md+) */}
                    {i < activeScenario.nodes.length - 1 && (
                      <div className="md:hidden py-2 text-border">
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "InteractiveCapabilityMap"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/InteractiveCapabilityMap.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/InteractiveCapabilityMap.tsx
git commit -m "refactor: migrate InteractiveCapabilityMap to Section/PageContainer/Stack/Card primitives"
```

---

### Task 6: `ConsultingCapabilityMatrix.tsx`

**Files:**
- Modify: `components/services/ConsultingCapabilityMatrix.tsx` (full file, 78 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer` (Phase 0)

The `container-wide max-w-5xl` double-max-width element becomes `<PageContainer><div className="max-w-5xl mx-auto">`, per Global Constraints. Intro (`h2`+`p`, no badge, centered) → `Stack gap="md"`, same as the other plain centered intros in this plan (`TechStackShowcase`, etc.). The data-table wrapper (`rounded-2xl border border-border bg-background overflow-x-auto shadow-sm`, zero padding — cell padding is handled per-cell) is **not** migrated to `Card` — `Card` always applies padding as part of its shape, which would conflict with this table's own per-cell `p-5` layout; forcing it in would require overriding padding to zero, defeating the primitive's purpose. Left as hand-rolled Tailwind, same reasoning as any shape that doesn't match `Card`'s padding+shape combination.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

const capabilities = [
  { name: "AI Strategy", phases: [true, false, false, false, false] },
  { name: "Enterprise Architecture", phases: [true, true, false, false, false] },
  { name: "AI Agents & Automation", phases: [false, true, true, true, true] },
  { name: "Data Engineering", phases: [false, true, true, true, false] },
  { name: "Custom LLM Development", phases: [false, true, true, true, true] },
  { name: "AI Governance & Security", phases: [true, true, false, true, true] },
  { name: "Corporate AI Education", phases: [true, false, false, false, true] },
];

const phases = ["Strategy", "Design", "Build", "Operate", "Optimize"];

export function ConsultingCapabilityMatrix() {
  return (
    <Section size="default" className="bg-surface border-y border-border overflow-hidden">
      <PageContainer>
        <div className="max-w-5xl mx-auto">
          <Stack gap="md" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
              End-to-End Delivery Capability
            </h2>
            <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
              Unlike point-solution vendors, we provide full-lifecycle enterprise AI transformation—from executive strategy to production operations.
            </p>
          </Stack>

          <motion.div
            initial={{ opacity: 0.4, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border bg-background overflow-x-auto shadow-sm"
          >
            <div className="min-w-[700px]">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b border-border bg-surface-elevated">
                <div className="p-5 col-span-1 border-r border-border flex items-center">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted">Capability</span>
                </div>
                {phases.map((phase, i) => (
                  <div key={phase} className="p-5 text-center flex items-center justify-center">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-text-secondary">{phase}</span>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="flex flex-col">
                {capabilities.map((cap, i) => (
                  <div key={cap.name} className="grid grid-cols-6 border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                    <div className="p-5 col-span-1 border-r border-border flex items-center">
                      <span className="text-sm font-space font-bold text-text-primary">{cap.name}</span>
                    </div>
                    {cap.phases.map((isActive, j) => (
                      <div key={j} className="p-5 flex items-center justify-center relative group">
                        {isActive ? (
                          <div className="w-8 h-8 rounded-full bg-primary-accent/10 text-primary-accent flex items-center justify-center transition-transform group-hover:scale-110">
                            <Check size={16} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-border" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ConsultingCapabilityMatrix"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/ConsultingCapabilityMatrix.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/ConsultingCapabilityMatrix.tsx
git commit -m "refactor: migrate ConsultingCapabilityMatrix to Section/PageContainer/Stack primitives"
```

---

### Task 7: `TechStackShowcase.tsx`

**Files:**
- Modify: `components/services/TechStackShowcase.tsx` (full file, 88 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

Intro (`h2`+`p`, no badge, centered) → `Stack`. The 6 tech-category cards (`p-8 rounded-2xl bg-surface-elevated border border-border`) are a `Card` `lg` match with a `bg-surface-elevated` override.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Settings2, Database, Cloud, ShieldCheck, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const stackCategories = [
  {
    category: "Foundation Models",
    icon: Brain,
    technologies: ["OpenAI GPT-4", "Anthropic Claude 3.5", "Google Gemini", "Meta Llama 3", "Mistral"]
  },
  {
    category: "Agent Frameworks",
    icon: Settings2,
    technologies: ["LangGraph", "CrewAI", "Microsoft AutoGen", "Haystack", "LlamaIndex"]
  },
  {
    category: "Data Platforms",
    icon: Database,
    technologies: ["Snowflake", "Databricks", "Pinecone", "pgvector", "Neo4j"]
  },
  {
    category: "Cloud Infrastructure",
    icon: Cloud,
    technologies: ["Microsoft Azure AI", "AWS Bedrock", "Google Cloud Vertex AI", "Vercel"]
  },
  {
    category: "MLOps & Engineering",
    icon: Box,
    technologies: ["Docker", "Kubernetes", "vLLM", "Hugging Face", "Weights & Biases"]
  },
  {
    category: "Security & Governance",
    icon: ShieldCheck,
    technologies: ["Langfuse", "Lakera Guard", "Azure Content Safety", "RBAC/IAM Systems"]
  }
];

export function TechStackShowcase() {
  return (
    <Section size="default" className="bg-background">
      <PageContainer>
        <Stack gap="md" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
            Enterprise Technology Stack
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            We are vendor-agnostic and engineering-led. We select the optimal models, frameworks, and infrastructure for your specific security and performance requirements.
          </p>
        </Stack>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackCategories.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0.4, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(cardVariants({ size: "lg" }), "bg-surface-elevated")}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-accent/10 text-primary-accent">
                  <cat.icon size={20} />
                </div>
                <h3 className="text-lg font-space font-bold text-text-primary">
                  {cat.category}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {cat.technologies.map(tech => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-full bg-background border border-border text-xs font-medium text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "TechStackShowcase"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/TechStackShowcase.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/TechStackShowcase.tsx
git commit -m "refactor: migrate TechStackShowcase to Section/PageContainer/Stack/Card primitives"
```

---

### Task 8: `ConsultingProcessTimeline.tsx`

**Files:**
- Modify: `components/services/ConsultingProcessTimeline.tsx` (full file, 120 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

`container-wide max-w-4xl mx-auto` is an exact match for `PageContainer size="narrow"` — no nesting needed, unlike the `5xl`/`6xl` cases. Intro (`h2`+`p`, no badge, centered) → `Stack`. The 8 timeline phase cards (`p-6 rounded-2xl bg-surface-elevated border border-border`) are a `Card` `md` match (24px) with a `bg-surface-elevated` override.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const processSteps = [
  {
    phase: "Assess",
    description: "Evaluate enterprise readiness, data maturity, and security posture.",
    color: "#00E5FF"
  },
  {
    phase: "Discover",
    description: "Identify high-ROI use cases and operational bottlenecks.",
    color: "#00F57A"
  },
  {
    phase: "Strategy",
    description: "Design a board-approved, prioritized implementation roadmap.",
    color: "#FF8A00"
  },
  {
    phase: "Architecture",
    description: "Engineer scalable, secure system designs and data pipelines.",
    color: "#7B61FF"
  },
  {
    phase: "Build",
    description: "Develop custom models, agents, and integration microservices.",
    color: "#FF2ED1"
  },
  {
    phase: "Deploy",
    description: "Launch to production with strict human-in-the-loop safeguards.",
    color: "#00C8FF"
  },
  {
    phase: "Govern",
    description: "Implement continuous compliance monitoring and risk management.",
    color: "#00E5FF"
  },
  {
    phase: "Scale",
    description: "Expand capabilities across business units and optimize performance.",
    color: "#00F57A"
  }
];

export function ConsultingProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use scroll position to animate the progress line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // We want the line to fill up as we scroll through the section
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <Section size="default" className="bg-background relative z-10 border-b border-border" ref={containerRef as any}>
      <PageContainer size="narrow">
        <Stack gap="md" className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary">
            The Enterprise Engagement Model
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            A structured, repeatable process designed to de-risk AI adoption and guarantee alignment with business objectives.
          </p>
        </Stack>

        <div className="relative pl-8 md:pl-0">
          {/* Center Line for Desktop, Left Line for Mobile */}
          <div className="absolute top-0 bottom-0 left-8 md:left-1/2 w-px bg-border -translate-x-1/2 z-0" />

          <motion.div
            className="absolute top-0 left-8 md:left-1/2 w-[3px] bg-gradient-to-b from-primary-accent via-secondary-accent to-primary-accent -translate-x-1/2 z-0 origin-top"
            style={{ height: lineHeight }}
          />

          {processSteps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0.4, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-12 last:mb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Connector Dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full border-4 border-background -translate-x-1/2 mt-1.5 md:mt-0 transition-transform duration-300 hover:scale-150 shadow-sm" style={{ backgroundColor: step.color }} />

                {/* Content */}
                <div className={`w-full md:w-5/12 pl-10 md:pl-0 ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                  <div className={cn(cardVariants({ size: "md" }), "bg-surface-elevated shadow-sm hover:shadow-elevated hover:border-text-muted/30 transition-all duration-300 relative")}>
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: step.color }}>
                      Phase 0{index + 1}
                    </span>
                    <h3 className="text-xl font-space font-bold text-text-primary mb-3">
                      {step.phase}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block w-5/12" />
              </motion.div>
            );
          })}
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ConsultingProcessTimeline"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/ConsultingProcessTimeline.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/ConsultingProcessTimeline.tsx
git commit -m "refactor: migrate ConsultingProcessTimeline to Section/PageContainer/Stack/Card primitives"
```

---

### Task 9: `ResearchInnovation.tsx`

**Files:**
- Modify: `components/services/ResearchInnovation.tsx` (full file, 79 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `cardVariants` (Phase 0)

`container-wide max-w-6xl mx-auto` becomes `<PageContainer><div className="max-w-6xl mx-auto">`, per Global Constraints. The left column's `h2`→`p`→`Link` flow is **not** wrapped in `Stack` (mixed content types, not the badge/heading/paragraph rhythm — same reasoning as Phase 1's `ResearchHighlights` outer row). The 4 resource link-cards (`Link`, `p-6 rounded-2xl bg-background border border-border`) are a `Card` `md` match (24px).

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Newspaper, FileText, FlaskConical, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

const resources = [
  {
    icon: Newspaper,
    title: "Daily AI Research Briefings",
    type: "Insights",
    link: "/insights"
  },
  {
    icon: BookOpen,
    title: "AI Architecture Playbooks",
    type: "Methodology",
    link: "/resources"
  },
  {
    icon: FileText,
    title: "Benchmarking & Evaluation",
    type: "Research",
    link: "/research"
  },
  {
    icon: FlaskConical,
    title: "Open-Source Initiatives",
    type: "Code",
    link: "https://github.com/Phile14augx"
  }
];

export function ResearchInnovation() {
  return (
    <Section size="default" className="bg-surface-elevated border-y border-border">
      <PageContainer>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-6">
                Research & Innovation at <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00F57A]">CerebroHive Labs</span>
              </h2>
              <p className="text-lg text-text-secondary font-inter leading-relaxed mb-8">
                We don&apos;t just implement AI; we push its boundaries. Our dedicated research arm continuously evaluates frontier models, publishes architecture patterns, and contributes to the open-source community to ensure our clients always receive state-of-the-art solutions.
              </p>

              <Link href="/research" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-primary-accent hover:text-text-primary transition-colors group">
                Explore Our Research <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.4, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Link href={item.link} className={cn(cardVariants({ size: "md" }), "block hover:border-primary-accent/30 hover:shadow-elevated transition-all duration-300 group h-full")}>
                      <item.icon size={24} className="text-text-muted mb-4 group-hover:text-primary-accent transition-colors" />
                      <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">{item.type}</span>
                      <h3 className="text-sm font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ResearchInnovation"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/ResearchInnovation.tsx`
Expected: no output (the `don't` apostrophe is already pre-fixed as `don&apos;t` above; confirm no other errors).

- [ ] **Step 4: Commit**

```bash
git add components/services/ResearchInnovation.tsx
git commit -m "refactor: migrate ResearchInnovation to Section/PageContainer/Card primitives"
```

---

### Task 10: `sections/ServiceHero.tsx`

**Files:**
- Modify: `components/services/sections/ServiceHero.tsx` (full file, 79 lines)

**Interfaces:**
- Consumes: `PageContainer` (Phase 0)

Same reasoning as Phase 1's `HomeHero` and this file's own index-page hero (Task 1): `min-h-[70vh]` custom hero rhythm with its own `pt-20 pb-10` — only `container-wide` → `PageContainer`, outer `<section>` stays raw.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

export const ServiceHero = ({ service }: { service: EnterpriseService }) => {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center z-10 border-b border-border text-center overflow-hidden">
      {/* Background ambient lighting based on category */}
      <div className="absolute inset-0 bg-gradient-to-b opacity-50 from-primary-accent/5 via-transparent to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 w-full h-[500px] bg-primary-accent/5 blur-[120px] rounded-full pointer-events-none"
      />

      <PageContainer className="flex flex-col items-center relative z-10 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise Service</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl"
        >
          {service.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10"
        >
          {service.hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0"
        >
          <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="service_hero" analyticsLabel={`Engage ${service.title}`}>
            <AnimatedButton variant="primary" size="lg">
              Discuss Engagement
            </AnimatedButton>
          </TrackedLink>
        </motion.div>

        {/* Floating tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-3 max-w-3xl"
        >
          {service.tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-surface-elevated border border-border rounded-full text-xs font-bold text-text-muted uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </motion.div>
      </PageContainer>
    </section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "sections/ServiceHero"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceHero.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceHero.tsx
git commit -m "refactor: migrate ServiceHero container to PageContainer primitive"
```

---

### Task 11: `sections/ServiceBusinessChallenges.tsx`

**Files:**
- Modify: `components/services/sections/ServiceBusinessChallenges.tsx` (full file, 92 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `cardVariants` (Phase 0)

This file already uses the shared `SectionHeading` component for both its headings — no `Stack` migration needed (there's no hand-rolled badge/heading/paragraph block to replace). The "Executive Summary Block" alert cards (`border-l-4` asymmetric accent cards) are left untouched — distinct shape, not `Card`. The "Common Enterprise Frictions" grid cards (`p-8 bg-surface-elevated border border-border rounded-2xl`) are a `Card` `lg` match with a `bg-surface-elevated` override.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceBusinessChallenges = ({ service }: { service: EnterpriseService }) => {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Section size="default" className="bg-surface border-b border-border">
      <PageContainer>

        {/* Executive Summary Block */}
        <div className="max-w-4xl mb-24">
          <SectionHeading
            label="Executive Summary"
            title="The Cost of Inaction"
            align="left"
          />
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-background border-l-4 border-l-[#FF453A] border-y border-r border-y-border border-r-border rounded-r-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#FF453A]">
                <AlertTriangle size={20} />
                <h4 className="font-space font-bold uppercase tracking-widest text-xs">The Problem</h4>
              </div>
              <p className="text-text-secondary leading-relaxed font-inter">
                {service.executiveProblem}
              </p>
            </div>
            <div className="p-6 bg-background border-l-4 border-l-[#FF8A00] border-y border-r border-y-border border-r-border rounded-r-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#FF8A00]">
                <TrendingDown size={20} />
                <h4 className="font-space font-bold uppercase tracking-widest text-xs">Business Impact</h4>
              </div>
              <p className="text-text-secondary leading-relaxed font-inter">
                {service.businessImpact}
              </p>
            </div>
          </div>
        </div>

        {/* Specific Challenges */}
        <div ref={containerRef}>
          <SectionHeading
            label="Current State"
            title="Common Enterprise Frictions"
            description="The systemic issues this engagement resolves."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
          >
            {service.businessChallenges.map((challenge, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={cn(cardVariants({ size: "lg" }), "bg-surface-elevated shadow-sm hover:border-primary-accent/30 transition-colors")}
              >
                <div className="text-4xl font-space font-black text-border mb-6">0{i + 1}</div>
                <h4 className="text-xl font-space font-bold text-text-primary mb-4">{challenge.title}</h4>
                <p className="text-text-secondary leading-relaxed text-sm">{challenge.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ServiceBusinessChallenges"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceBusinessChallenges.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceBusinessChallenges.tsx
git commit -m "refactor: migrate ServiceBusinessChallenges to Section/PageContainer/Card primitives"
```

---

### Task 12: `sections/ServiceMethodology.tsx`

**Files:**
- Modify: `components/services/sections/ServiceMethodology.tsx` (full file, 78 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `cardVariants` (Phase 0)

**Fixes the `.container-narrow` bug** (see Global Constraints) — replaced with `PageContainer size="narrow"`. Already uses `SectionHeading`. The timeline phase cards (`p-8 bg-surface border border-border rounded-2xl`) are an exact `Card` `lg` match (no background override needed — `bg-surface` is `Card`'s own default).

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceMethodology = ({ service }: { service: EnterpriseService }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section size="default" className="bg-background border-b border-border" ref={containerRef as any}>
      <PageContainer size="narrow">
        <SectionHeading
          label="Methodology & Timeline"
          title="Execution Roadmap"
          description={service.methodologyOverview}
        />

        <div className="mt-20 relative">
          {/* Vertical Progress Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
          <motion.div
            className="absolute left-8 md:left-1/2 top-0 w-1 bg-primary-accent -translate-x-1/2 hidden md:block origin-top rounded-full"
            style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-12 md:gap-24">
            {service.timeline.map((phase, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className="relative flex flex-col md:flex-row items-center justify-between group">

                  {/* Timeline Node */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-background border-2 border-border group-hover:border-primary-accent group-hover:bg-primary-accent/20 transition-colors -translate-x-1/2 z-10 hidden md:block" />

                  {/* Left Side (Empty on Odd, Content on Even) */}
                  <div className={`w-full md:w-5/12 ${isEven ? "md:text-right md:pr-12" : "md:order-last md:text-left md:pl-12"}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5 }}
                      className={cn(cardVariants({ size: "lg" }), "shadow-sm hover:shadow-md transition-shadow relative")}
                    >
                      <span className="inline-block px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4">
                        {phase.duration}
                      </span>
                      <h4 className="text-xl font-space font-bold text-text-primary mb-4">{phase.title}</h4>
                      <ul className={`flex flex-col gap-2 ${isEven ? "md:items-end" : "md:items-start"}`}>
                        {phase.activities.map((act, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            {act}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block w-5/12" />
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "sections/ServiceMethodology"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceMethodology.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceMethodology.tsx
git commit -m "refactor: migrate ServiceMethodology to Section/PageContainer/Card primitives, fix container-narrow bug"
```

---

### Task 13: `sections/ServiceArchitecture.tsx`

**Files:**
- Modify: `components/services/sections/ServiceArchitecture.tsx` (full file, 90 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer` (Phase 0)

Wrapper only — already uses `SectionHeading`. The product/capability link-tiles use `rounded-xl` (not `rounded-2xl`), so none are migrated to `Card`, consistent with the established rule.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products } from "@/lib/data/products";
import { platformCapabilities } from "@/lib/data/platform/capabilities";
import { ArrowRight, Cpu, Layers } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

export const ServiceArchitecture = ({ service }: { service: EnterpriseService }) => {
  // Resolve references
  const usedProducts = products.filter(p => service.products.includes(p.id));
  const usedCapabilities = platformCapabilities.filter(c => service.platformCapabilities.includes(c.id));

  if (usedProducts.length === 0 && usedCapabilities.length === 0) return null;

  return (
    <Section size="default" className="bg-surface-elevated border-b border-border overflow-hidden">
      <PageContainer>
        <SectionHeading
          label="Technology Stack"
          title="Powered by CerebroHive"
          description="This service leverages our proprietary platform and products to accelerate delivery."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-12">

          {/* Products Column */}
          {usedProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <Layers size={20} className="text-primary-accent" />
                <h3 className="text-xl font-space font-bold text-text-primary">Packaged Applications</h3>
              </div>
              <div className="flex flex-col gap-4">
                {usedProducts.map((prod, i) => (
                  <TrackedLink
                    key={prod.id}
                    href={`/products/${prod.slug}`}
                    analyticsEvent="service_product_click"
                    analyticsCategory="service_architecture"
                    analyticsLabel={prod.title}
                    className="group flex flex-col p-6 bg-background border border-border rounded-xl hover:border-primary-accent/50 transition-colors shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight size={20} className="text-primary-accent" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">{prod.category}</span>
                    <h4 className="text-lg font-space font-bold text-text-primary mb-2">{prod.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed pr-8">{prod.summary}</p>
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities Column */}
          {usedCapabilities.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <Cpu size={20} className="text-secondary-accent" />
                <h3 className="text-xl font-space font-bold text-text-primary">Core Platform Capabilities</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {usedCapabilities.map((cap, i) => (
                  <TrackedLink
                    key={cap.id}
                    href={`/platform/${cap.slug}`}
                    analyticsEvent="service_platform_click"
                    analyticsCategory="service_architecture"
                    analyticsLabel={cap.title}
                    className="p-5 bg-background border border-border rounded-xl hover:border-secondary-accent/50 transition-colors shadow-sm flex flex-col justify-between h-full group"
                  >
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-1 block">{cap.category}</span>
                      <h4 className="text-sm font-space font-bold text-text-primary mb-2 group-hover:text-secondary-accent transition-colors">{cap.title}</h4>
                    </div>
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}

        </div>
      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "sections/ServiceArchitecture"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceArchitecture.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceArchitecture.tsx
git commit -m "refactor: migrate ServiceArchitecture wrapper to Section/PageContainer primitives"
```

---

### Task 14: `sections/ServiceDeliverables.tsx`

**Files:**
- Modify: `components/services/sections/ServiceDeliverables.tsx` (full file, 71 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `cardVariants` (Phase 0)

Already uses `SectionHeading`. The deliverables list rows use `rounded-xl` — left untouched. The "Commercial Model Card" (`p-8 bg-gradient-to-br from-surface-elevated to-background border border-border rounded-2xl`) is a `Card` `lg` match with a gradient-background override — safe per Global Constraints (gradient `background-image` renders over `Card`'s `bg-surface` `background-color` without conflict).

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckCircle2, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceDeliverables = ({ service }: { service: EnterpriseService }) => {
  return (
    <Section size="default" className="bg-surface border-b border-border">
      <PageContainer>
        <SectionHeading
          label="Outcomes"
          title="Tangible Deliverables"
          description="What you receive at the conclusion of this engagement."
        />

        <div className="mt-16 grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* Deliverables List */}
          <div className="flex flex-col gap-4">
            {service.deliverables.map((deliverable, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 bg-background border border-border rounded-xl hover:border-primary-accent/40 transition-colors shadow-sm"
              >
                <CheckCircle2 size={24} className="text-primary-accent shrink-0 mt-0.5" />
                <span className="text-base font-medium text-text-primary">{deliverable}</span>
              </motion.div>
            ))}
          </div>

          {/* Commercial Model Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={cn(cardVariants({ size: "lg" }), "bg-gradient-to-br from-surface-elevated to-background flex flex-col shadow-md")}
          >
            <div className="w-12 h-12 rounded-xl bg-primary-accent/10 flex items-center justify-center text-primary-accent mb-6">
              <Box size={24} />
            </div>
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">Commercial Model</h4>
            <h3 className="text-2xl font-space font-bold text-text-primary mb-4">{service.engagementModel}</h3>

            {service.pricing && (
              <div className="mt-auto pt-6 border-t border-border">
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {service.pricing.description}
                </p>
                {service.pricing.startingAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium">Starting at:</span>
                    <span className="text-lg font-mono font-bold text-text-primary">{service.pricing.startingAt}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

        </div>
      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ServiceDeliverables"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceDeliverables.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceDeliverables.tsx
git commit -m "refactor: migrate ServiceDeliverables to Section/PageContainer/Card primitives"
```

---

### Task 15: `sections/ServiceROI.tsx`

**Files:**
- Modify: `components/services/sections/ServiceROI.tsx` (full file, 45 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `cardVariants` (Phase 0)

Already uses `SectionHeading`. The 3 metric cards (`p-8 bg-surface-elevated border border-border rounded-2xl`) are a `Card` `lg` match with a `bg-surface-elevated` override.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

export const ServiceROI = ({ service }: { service: EnterpriseService }) => {
  return (
    <Section size="default" className="bg-background border-b border-border">
      <PageContainer>
        <SectionHeading
          label="ROI & Impact"
          title="Measurable Success"
          description="We hold ourselves accountable to strict business outcomes."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {service.successMetrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(cardVariants({ size: "lg" }), "bg-surface-elevated shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden group")}
            >
              <div className="absolute inset-0 bg-primary-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <h3 className="text-5xl lg:text-6xl font-mono font-black text-text-primary mb-4 relative z-10">
                {metric.value}
              </h3>
              <h4 className="text-sm font-bold tracking-widest uppercase text-text-secondary mb-2 relative z-10">
                {metric.metric}
              </h4>
              <p className="text-xs text-text-muted font-medium relative z-10">
                {metric.timeframe}
              </p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ServiceROI"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceROI.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceROI.tsx
git commit -m "refactor: migrate ServiceROI to Section/PageContainer/Card primitives"
```

---

### Task 16: `sections/ServiceFAQ.tsx`

**Files:**
- Modify: `components/services/sections/ServiceFAQ.tsx` (full file, 55 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer` (Phase 0)

**Fixes the `.container-narrow` bug** — replaced with `PageContainer size="narrow"`. Already uses `SectionHeading`. FAQ accordion items use `rounded-xl` — left untouched.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

export const ServiceFAQ = ({ service }: { service: EnterpriseService }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!service.faqs || service.faqs.length === 0) return null;

  return (
    <Section size="default" className="bg-surface border-b border-border">
      <PageContainer size="narrow">
        <SectionHeading
          label="FAQ"
          title="Common Questions"
        />

        <div className="mt-16 flex flex-col gap-4">
          {service.faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl bg-background overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-elevated transition-colors"
              >
                <span className="text-base font-bold text-text-primary pr-8">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-text-muted transition-transform duration-300 shrink-0 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-text-secondary leading-relaxed font-inter">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ServiceFAQ"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceFAQ.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceFAQ.tsx
git commit -m "refactor: migrate ServiceFAQ to Section/PageContainer primitives, fix container-narrow bug"
```

---

### Task 17: `sections/ServiceCTA.tsx`

**Files:**
- Modify: `components/services/sections/ServiceCTA.tsx` (full file, 41 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer` (Phase 0)

Fixes two things at once: the raw `py-24` becomes `Section size="default"` (resolving the `py-24`/`.section-pad` split, per the core Phase 1/2 goal), and **the `.container-narrow` bug** becomes `PageContainer size="narrow"`. The eyebrow label → `h2` → `p` block is left as hand-rolled (not `Stack`) — the label is a plain `<span>`, not the pill badge shape `Stack`'s intro rhythm was built around, and its `mb-4` (16px) gap is a deliberately more compact treatment, not an inconsistency to normalize.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

export const ServiceCTA = ({ service }: { service: EnterpriseService }) => {
  return (
    <Section size="default" className="bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary-accent/5 pointer-events-none" />

      <PageContainer size="narrow" className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-primary-accent mb-4 block">Next Steps</span>
          <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-6">
            Ready to initiate your <br className="hidden md:block" />
            <span className="text-primary-accent">{service.title}</span>?
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto font-inter">
            Schedule a strategy session with our principal architects to discuss your specific business context and evaluate the ROI of this engagement.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="service_cta" analyticsLabel="Book Strategy Session">
              <AnimatedButton variant="primary" size="lg">
                Book Strategy Session
              </AnimatedButton>
            </TrackedLink>
          </div>
        </motion.div>
      </PageContainer>
    </Section>
  );
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ServiceCTA"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/services/sections/ServiceCTA.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/services/sections/ServiceCTA.tsx
git commit -m "refactor: migrate ServiceCTA to Section/PageContainer primitives, fix container-narrow bug"
```

---

### Task 18: Full verification (index page + a real detail page)

**Files:**
- None (verification only)

**Interfaces:**
- None

- [ ] **Step 1: Full-project typecheck**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 2: Full lint on all touched files**

Run: `npx eslint app/services/page.tsx components/services/*.tsx components/services/sections/*.tsx`
Expected: no errors. Any pre-existing warnings must be verified as pre-existing (present before this phase's commits) before treating them as acceptable.

- [ ] **Step 3: Visual verification of the Services index page**

Start the dev server if not already running, then load `http://localhost:3000/services`.

At Desktop 1440px, 1280px; Tablet 1024px, 768px; Mobile 430px, 390px, 360px, confirm:
- No horizontal overflow beyond what's already documented as pre-existing/masked by `overflow-x: hidden` (see Phase 1's Task 11 findings)
- Every migrated section's vertical rhythm looks intentional
- All migrated cards keep consistent padding/shape
- `ExecutiveSummary`'s section (deliberately left at its original compact spacing, not migrated to `Section`) still looks proportionally correct next to the now-taller `Section`-based sections around it

- [ ] **Step 4: Visual verification of a detail page**

Load `http://localhost:3000/services/ai-strategy` (a real slug confirmed to exist in `lib/data/services/ai-strategy.ts`) at the same 7 breakpoints. Confirm:
- `ServiceMethodology` and `ServiceFAQ` now render at a visibly constrained, centered width (this is the `.container-narrow` bug fix taking effect — before this phase, these sections rendered full-bleed with no side padding)
- `ServiceCTA` no longer has the old fixed `py-24` (compare its vertical spacing to the surrounding sections — it should now match the `.section-pad`-derived rhythm)
- All migrated cards across `ServiceBusinessChallenges`, `ServiceMethodology`, `ServiceDeliverables`, `ServiceROI` render correctly

- [ ] **Step 5: Confirm all 17 commits are present**

Run: `git log --oneline -17`
Expected: one commit per Task 1-17, each with a `refactor:` message.

## Self-Review Notes

- **Spec coverage:** All 21 content-bearing Services files are accounted for — 17 migrated in this plan (`page.tsx` + 8 standalone index-page components + 8 renderer `sections/*` components), 4 explicitly excluded with stated reasoning (`ServiceCardProgressive.tsx`, `ServiceMorphBackground.tsx`, `ServiceAnimationContext.tsx`, `ServicesHeroBg.tsx`). `layout.tsx`, `ServiceRenderer.tsx`, and `SectionRegistry.ts` have no styling markup and are not migration targets. The `.container-narrow` bug found during the survey is fixed in the 3 files where it occurs in this phase's scope; its occurrence in 3 Products files is explicitly deferred to the Products phase, not silently expanded into here.
- **Placeholder scan:** No TBD/TODO markers. During self-review, Task 8's first draft was found to have copied `ServiceMethodology.tsx`'s `phase.activities.map(...)` list rendering into `ConsultingProcessTimeline.tsx` by mistake — that file's `processSteps` array has no `activities` field, only `phase`/`description`/`color`, and its original markup renders `step.description` as a plain paragraph. Fixed inline before finalizing this plan, not left as a bug for the implementer to hit.
- **Type consistency:** `cardVariants({ size: "md" | "lg" })` calls match Phase 0's `Card.tsx` size keys. `Section size="default"` and `PageContainer size="narrow"` match the exact union values from Phase 0. No new primitive variants introduced.
- **Lint ground truth:** Unlike Phase 1, this plan does not assert specific pre-existing-warning line numbers as guaranteed, since a full `eslint` pass across all 20 files wasn't run before writing (only targeted greps for `container-narrow` and shape patterns). Task 18's Step 2 explicitly calls for verifying any pre-existing warnings are genuinely pre-existing before accepting them, rather than assuming Phase 1's specific findings carry over.
