# Phase 1: Landing Page Rollout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the remaining 10 Landing page components (`app/page.tsx` renders 11 total; `IntegratedPlatform.tsx` was already migrated in Phase 0) to the `Section`/`PageContainer`/`Card`/`Stack` primitives built in Phase 0, resolving the `py-24` vs `.section-pad` split and `p-6`/`p-8` card-padding inconsistency across the Landing page.

**Architecture:** Same primitives from Phase 0, no changes to their implementation. Each component gets its outer `<section className="py-24|py-12 ...">` / `<div className="container-wide">` swapped for `Section`/`PageContainer`, and its intro heading block (badge → `h2` → `p`) swapped for `Stack`. Only markup that matches the de-facto Card shape (`bg-surface border border-border rounded-2xl`, found via the original Phase 0 survey) is migrated to `Card`/`cardVariants` — bespoke panels that don't match that shape (different radius, different background, or already using the existing `theme-panel`/`theme-card` CSS classes) are deliberately left untouched. See the per-task notes for the reasoning on each file.

**Tech Stack:** Same as Phase 0 — Next.js 15, React, Tailwind CSS, `cn()`, `class-variance-authority` (already installed).

## Global Constraints

- Primitives are already built (Phase 0, commits `abd61d8`..`eabb748`) — do not modify `components/ui/primitives/*` in this plan.
- Only migrate markup that matches the Card primitive's exact shape (`bg-surface`/`bg-surface-elevated`, `border border-border`, `rounded-2xl`). Do NOT force `theme-panel`, `theme-card`, or any `rounded-3xl`/`rounded-xl` bespoke panel into `Card` — those are either already using a different existing shared mechanism or are intentionally distinct visual treatments, not the pattern this migration targets.
- Where a card's original padding is a responsive pair not matching a single `Card` size (e.g. `p-8 md:p-10`, `p-8 md:p-12`), apply the closest `Card` size (`lg` = 32px, matching the mobile/base value) via `cardVariants({ size: "lg" })` and add the `md:*` override in the same `className`, preserving the exact original responsive behavior. Do not invent a new `Card` size for these.
- Where a card's original background differs from the default (`bg-surface-elevated` instead of `bg-surface`), apply `cardVariants({ size: ... })` and override the background in the trailing `className` — `cn()`/`tailwind-merge` resolves the conflict in favor of the later class.
- `Stack`'s scoped usage (per the design spec) is the badge → `h2` → `p` intro rhythm. When a `Stack` wraps a centered intro block, the badge pill needs both `w-fit` (so it doesn't stretch to the flex container's full cross-axis width) and `mx-auto` (to center it, since flex items don't otherwise respond to an inherited `text-align: center`); `h2`/`p` need no extra classes since `text-align` is inherited by ordinary block content within each flex item. For left-aligned intro blocks (none in this plan touch a left-aligned intro besides the already-completed pilot), only `w-fit` is needed, no `mx-auto`.
- One inconsistency is deliberately normalized, not left as-is: `ResearchHighlights.tsx`'s intro block uses `mb-4` (16px) between its `h2` and `p` where every other Landing intro block uses `mb-6` (24px). Migrating it to `Stack gap="md"` (24px) intentionally fixes this drift to match the dominant site-wide rhythm — this is exactly the kind of inconsistency the Phase spec's per-page checklist pass is for, not an accidental change.
- Fix `react/no-unescaped-entities` ESLint errors only where they occur inside text already being touched by a `Stack`/`Card` migration in this plan (confirmed via `npx eslint` against all 10 files before writing this plan: `BusinessChallenges.tsx` lines 20 and 47, `ResearchHighlights.tsx` line 37 — all inside intro/card blocks being migrated). Do NOT fix the pre-existing unused-import warnings found in `HomeHero.tsx`, `HumanProof.tsx`, `LivingArchitecture.tsx`, `ResearchHighlights.tsx` — those are unrelated to this migration and out of scope.
- Path alias `@/*` maps to repo root; primitives import as `@/components/ui/primitives/<Name>`.

---

### Task 1: `HomeHero.tsx`

**Files:**
- Modify: `components/home/v3/HomeHero.tsx` (full file, 150 lines)

**Interfaces:**
- Consumes: `PageContainer` (Phase 0, `@/components/ui/primitives/PageContainer`)

This is the only Landing component with intentional non-standard vertical rhythm (`min-h-[100svh]` full-viewport hero, `pt-32 pb-20` asymmetric top/bottom padding) — it does not fit `Section`'s `tight`/`default`/`emphasized` scale (all symmetric), so the outer `<section>` stays hand-rolled. Only `container-wide` → `PageContainer` is migrated (an exact equivalent, zero visual change). The intro copy uses `framer-motion` `staggerChildren` variants on individual `motion.div`/`motion.h1`/`motion.p` elements with their own `mb-*` spacing tied to animation timing — do not wrap these in `Stack`, which would change the DOM structure the stagger animation depends on.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Play, Database, BrainCircuit, Bot, Network, Lightbulb, Target } from "lucide-react";
import dynamic from 'next/dynamic';
import { TrackedLink } from "@/components/ui/TrackedLink";
import { TrackedButton } from "@/components/ui/TrackedButton";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

const BackgroundEngine = dynamic(
  () => import("@/components/ui/BackgroundEngine").then((mod) => mod.BackgroundEngine),
  { ssr: false }
);

const stages = [
  { id: "disconnected", title: "Disconnected Enterprise", icon: Database, color: "text-warning" },
  { id: "unified", title: "Unified Knowledge", icon: BrainCircuit, color: "text-accent-secondary" },
  { id: "agents", title: "Intelligent Agents", icon: Bot, color: "text-[#7B61FF]" },
  { id: "workflows", title: "Autonomous Workflows", icon: Network, color: "text-accent-primary" },
  { id: "decisions", title: "Better Decisions", icon: Lightbulb, color: "text-warning" },
  { id: "outcomes", title: "Measurable Outcomes", icon: Target, color: "text-accent-secondary" }
];

export default function HomeHero() {
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[100svh] flex flex-col justify-center bg-background">
      
      {/* Immersive Theme-Aware Ambient Background */}
      <BackgroundEngine type="hero" />

      <PageContainer className="relative z-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Copy */}
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0.4 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.2 }
              }
            }}
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0.4, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-text-muted font-bold mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              The Enterprise AI Operating System
            </motion.div>
            
            <motion.h1 
              variants={{
                hidden: { opacity: 0.4, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] mb-6"
            >
              Engineering the <br />
              <span className="text-accent-secondary dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#00E5FF] dark:to-[#00F57A]">AI-Native</span> Enterprise.
            </motion.h1>
            
            <motion.p 
              variants={{
                hidden: { opacity: 0.4, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="text-lg text-text-secondary max-w-xl font-inter mb-10 leading-relaxed"
            >
              We architect enterprise AI systems, build production software, and deploy intelligent agent swarms that transform disconnected data into autonomous business outcomes.
            </motion.p>
            
            <motion.div 
              variants={{
                hidden: { opacity: 0.4, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="flex flex-wrap gap-4"
            >
              <TrackedLink href="/products" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Explore The Platform — Hero">
                <button className="theme-button-primary px-8 py-4 text-sm tracking-widest uppercase flex items-center gap-2 group">
                  Explore The Platform <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </TrackedLink>
              <TrackedLink href="/research" analyticsEvent="cta_click" analyticsCategory="engagement" analyticsLabel="Read Research — Hero">
                <button className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-full hover:bg-surface-secondary shadow-sm transition-all duration-250">
                  Read Research
                </button>
              </TrackedLink>
            </motion.div>
          </motion.div>

          {/* Right: The Transformation Animation */}
          <div className="relative h-[500px] flex items-center justify-center">
            
            <div className="absolute inset-0 border border-border rounded-full animate-[spin_60s_linear_infinite] opacity-50" />
            <div className="absolute inset-8 border border-border rounded-full animate-[spin_40s_linear_infinite_reverse] opacity-50" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0.4, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                {React.createElement(stages[activeStage].icon, {
                  size: 80,
                  className: `mb-6 ${stages[activeStage].color} drop-shadow-[0_0_30px_currentColor]`
                })}
                <h3 className="text-3xl font-space font-bold text-text-primary tracking-wide">
                  {stages[activeStage].title}
                </h3>
              </motion.div>
            </AnimatePresence>

            {/* Stage Indicators */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {stages.map((stage, i) => (
                <div 
                  key={i}
                  className={`h-1 transition-all duration-500 rounded-full ${i === activeStage ? 'w-8 bg-surface' : 'w-2 bg-surface-elevated'}`}
                />
              ))}
            </div>

          </div>

        </div>
      </PageContainer>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "HomeHero"`
Expected: no output (no errors referencing this file).

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/HomeHero.tsx`
Expected: only the 3 pre-existing unused-import warnings (`ChevronRight`, `Play`, `TrackedButton`) — no new errors, no new warnings.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/HomeHero.tsx
git commit -m "refactor: migrate HomeHero container to PageContainer primitive"
```

---

### Task 2: `EnterpriseDashboard.tsx`

**Files:**
- Modify: `components/home/v3/EnterpriseDashboard.tsx` (full file, 65 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `cardVariants` (Phase 0)

This is the exact `py-12` "tight" stat-strip pattern the spec's `Section` `tight` size was built to formalize. The `-mt-8 relative z-20` classes (pulling the strip up under the hero) move onto `Section`'s `className`. Each metric tile (`bg-surface border border-border rounded-2xl p-6`) is an exact match for `Card`'s `md` size (24px) — migrated via `cardVariants({ size: "md" })` since the tile also needs `flex flex-col items-center text-center group hover:...` behavior classes that `Card`'s bare wrapper doesn't apply, so `cardVariants` (not the `Card` component) is used directly on the existing `div`.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { Activity, Database, Bot, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { cardVariants } from "@/components/ui/primitives/Card";

const metrics = [
  {
    theme: "Operational Excellence",
    icon: Activity,
    value: "42%",
    label: "Process Automation",
    color: "text-accent-primary"
  },
  {
    theme: "Knowledge Intelligence",
    icon: Database,
    value: "3.2M",
    label: "Documents Indexed",
    color: "text-accent-secondary"
  },
  {
    theme: "AI Workforce",
    icon: Bot,
    value: "27",
    label: "Active Agents",
    color: "text-[#7B61FF]"
  },
  {
    theme: "Business Impact",
    icon: DollarSign,
    value: "$4.2M",
    label: "Annual Savings",
    color: "text-warning"
  }
];

export default function EnterpriseDashboard() {
  return (
    <Section size="tight" className="border-b border-border bg-background relative z-20 -mt-8">
      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className={cn(
                cardVariants({ size: "md" }),
                "flex flex-col items-center text-center group hover:border-border-strong transition-colors shadow-2xl relative overflow-hidden"
              )}
            >
              
              <div className="absolute top-0 left-0 w-full h-1 bg-surface group-hover:bg-surface-elevated transition-colors" />

              <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4 flex items-center gap-1">
                <metric.icon size={12} className={metric.color} /> {metric.theme}
              </div>
              
              <div className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-2">
                {metric.value}
              </div>
              
              <div className="text-sm font-bold text-text-secondary">
                {metric.label}
              </div>

            </div>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "EnterpriseDashboard"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/EnterpriseDashboard.tsx`
Expected: no output (no errors or warnings).

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/EnterpriseDashboard.tsx
git commit -m "refactor: migrate EnterpriseDashboard to Section/PageContainer/Card primitives"
```

---

### Task 3: `BusinessChallenges.tsx`

**Files:**
- Modify: `components/home/v3/BusinessChallenges.tsx` (full file, 82 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

The intro block's `max-w-4xl mx-auto text-center` wrapper is a *nested* narrow-content block already inside `PageContainer`'s own padding — per the design spec's stance on `max-w-5xl`/`max-w-6xl` nested widths, this stays as plain Tailwind (not `PageContainer size="narrow"`, which would add a second, unwanted layer of horizontal padding). Its badge/`h2`/`p` rhythm becomes `Stack`. The two problem/opportunity cards use `p-8 md:p-10` (32px base, 40px at `md:`) — `cardVariants({ size: "lg" })` supplies the 32px base and shape; `md:p-10` is added as an override, which `cn()`/`tailwind-merge` resolves correctly since `p-8` and `md:p-10` are different responsive-variant classes, not a direct conflict.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { AlertCircle, ArrowRight, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

export default function BusinessChallenges() {
  return (
    <Section size="default" className="border-b border-border bg-background">
      <PageContainer>
        <Stack gap="md" className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-text-muted font-bold w-fit mx-auto">
            The Enterprise Reality
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary leading-tight">
            Data is abundant. <br />
            <span className="text-text-muted">Execution is paralyzed.</span>
          </h2>
          <p className="text-lg text-text-secondary font-inter">
            Enterprises don&apos;t need more dashboards or chat interfaces. They need autonomous systems that can reason over private data and execute complex workflows.
          </p>
        </Stack>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* The Problem */}
          <div className={cn(cardVariants({ size: "lg" }), "md:p-10 relative overflow-hidden")}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB300]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#FFB300]/10 flex items-center justify-center text-warning">
                <XCircle size={20} />
              </div>
              <h3 className="text-2xl font-space font-bold text-text-primary">Legacy Operations</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Knowledge is trapped in disconnected silos (SharePoint, Jira, ERPs).</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Process execution relies entirely on human routing and manual approvals.</p>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">AI initiatives are limited to standalone &quot;copilots&quot; that still require human operation.</p>
              </li>
            </ul>
          </div>

          {/* The Opportunity */}
          <div className={cn(cardVariants({ size: "lg" }), "md:p-10 relative overflow-hidden")}>
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00E5FF]" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-accent-secondary">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-2xl font-space font-bold text-text-primary">AI-Native Enterprise</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ArrowRight size={16} className="text-accent-secondary mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Data is continuously vectorized into a central Enterprise Knowledge Graph.</p>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={16} className="text-accent-secondary mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Intelligent agents autonomously plan and execute multi-step ERP workflows.</p>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight size={16} className="text-accent-secondary mt-0.5 shrink-0" />
                <p className="text-sm text-text-secondary">Employees transition from operators to overseers of autonomous systems.</p>
              </li>
            </ul>
          </div>

        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "BusinessChallenges"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/BusinessChallenges.tsx`
Expected: no output (the 3 pre-existing errors from the Global Constraints survey are now fixed).

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/BusinessChallenges.tsx
git commit -m "refactor: migrate BusinessChallenges to Section/PageContainer/Stack/Card primitives"
```

---

### Task 4: `EnterpriseSimulator.tsx`

**Files:**
- Modify: `components/home/v3/EnterpriseSimulator.tsx` (full file, 204 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack` (Phase 0)

Only the outer wrapper and intro block migrate. The interactive panels (`bg-surface/80 backdrop-blur-xl ... p-8 md:p-12`, the `generating` spinner box `p-16`, the `generated` results panel) all use bespoke backgrounds (opacity/blur), radii, or padding scales that don't match `Card`'s de-facto shape — forcing them into `Card` would go beyond spacing consistency into redesigning a working interactive UI, which is explicitly out of scope. They are left untouched.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { Settings, FileDown, Target, Building2, Server, CheckCircle2, Bot, Network, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

export default function EnterpriseSimulator() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selections, setSelections] = useState({ industry: "", erp: "", maturity: "" });

  const handleSelect = (key: string, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2500);
  };

  return (
    <Section size="default" className="border-b border-border bg-background relative overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px] pointer-events-none" />

      <PageContainer>
        
        <Stack gap="md" className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-accent-secondary font-bold w-fit mx-auto">
            <Settings size={12} /> Interactive Blueprint
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">Enterprise Transformation Simulator</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Configure your organizational parameters to instantly generate a personalized AI blueprint, architecture, and estimated ROI model.
          </p>
        </Stack>

        <div className="max-w-5xl mx-auto relative z-10">
          
          {!generated && !generating && (
            <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 md:p-12 shadow-2xl">
              
              {/* Progress */}
              <div className="flex items-center justify-between mb-12 relative max-w-lg mx-auto">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-surface-elevated z-0" />
                {[1, 2, 3].map(num => (
                  <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-colors ${
                    step === num ? "bg-[#00E5FF] text-text-primary border-4 border-[#0A0D14]" :
                    step > num ? "bg-accent-primary text-text-primary border-4 border-[#0A0D14]" :
                    "bg-surface text-text-muted border border-border"
                  }`}>
                    {step > num ? <CheckCircle2 size={16} /> : num}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="1" initial={{ opacity: 0.4, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-8">
                      <Building2 size={32} className="text-accent-secondary mx-auto mb-4" />
                      <h3 className="text-2xl font-space font-bold text-text-primary">Select Industry</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {["Finance", "Healthcare", "Manufacturing", "Retail"].map(ind => (
                        <button key={ind} onClick={() => handleSelect('industry', ind)} className="p-4 rounded-xl border border-border bg-surface font-bold text-text-primary hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                          {ind}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="2" initial={{ opacity: 0.4, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-8">
                      <Server size={32} className="text-accent-secondary mx-auto mb-4" />
                      <h3 className="text-2xl font-space font-bold text-text-primary">Primary ERP / System</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {["SAP", "Oracle", "Workday", "Custom/Legacy"].map(erp => (
                        <button key={erp} onClick={() => handleSelect('erp', erp)} className="p-4 rounded-xl border border-border bg-surface font-bold text-text-primary hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                          {erp}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="3" initial={{ opacity: 0.4, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="text-center mb-8">
                      <Target size={32} className="text-accent-secondary mx-auto mb-4" />
                      <h3 className="text-2xl font-space font-bold text-text-primary">Current AI Maturity</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                      {["Exploration (Pilots)", "Isolated (Copilots)", "Integrated (APIs)"].map(mat => (
                        <button key={mat} onClick={() => handleSelect('maturity', mat)} className="p-4 rounded-xl border border-border bg-surface font-bold text-text-primary hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors">
                          {mat}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {generating && (
            <div className="bg-surface border border-border rounded-2xl p-16 text-center flex flex-col items-center shadow-2xl">
              <div className="w-16 h-16 rounded-full border-4 border-border border-t-[#00E5FF] animate-spin mb-8" />
              <h3 className="text-2xl font-space font-bold text-text-primary mb-2">Architecting Blueprint...</h3>
              <p className="text-text-secondary">Synthesizing platform recommendations for {selections.industry} running {selections.erp}.</p>
            </div>
          )}

          <AnimatePresence>
            {generated && (
              <motion.div initial={{ opacity: 0.4, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
                
                <div className="h-2 w-full bg-gradient-to-r from-[#00E5FF] via-[#00F57A] to-[#7B61FF]" />
                
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                      <h3 className="text-3xl font-space font-bold text-text-primary mb-2">Executive AI Blueprint</h3>
                      <p className="text-text-muted text-sm font-bold uppercase tracking-widest">
                        {selections.industry} • {selections.erp} Environment
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-[#00E5FF] text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                      <FileDown size={16} /> Download PDF
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-surface-secondary border border-border rounded-xl p-6">
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Maturity Score</div>
                      <div className="text-4xl font-space font-bold text-text-primary mb-2">42<span className="text-lg text-text-muted">/100</span></div>
                      <p className="text-xs text-text-secondary">Your current setup is highly dependent on manual prompt engineering.</p>
                    </div>
                    <div className="bg-surface-secondary border border-border rounded-xl p-6">
                      <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-2">Top Opportunity</div>
                      <div className="text-xl font-space font-bold text-text-primary mb-2">Workflow Automation</div>
                      <p className="text-xs text-text-secondary">Deploying AgentOS alongside {selections.erp} can automate 60% of L1 tasks.</p>
                    </div>
                    <div className="bg-surface-secondary border border-border rounded-xl p-6">
                      <div className="text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-2">Estimated ROI</div>
                      <div className="text-4xl font-space font-bold text-text-primary mb-2">2.8x</div>
                      <p className="text-xs text-text-secondary">Expected return within 12 months based on headcount reallocation.</p>
                    </div>
                  </div>

                  <h4 className="font-space font-bold text-text-primary text-xl mb-6">Recommended Architecture Path</h4>
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 bg-surface border border-border rounded-xl relative">
                      <Layers size={20} className="text-text-muted mb-4" />
                      <h5 className="font-bold text-text-primary mb-2">1. Knowledge Layer</h5>
                      <p className="text-xs text-text-secondary">Vectorize {selections.erp} data using Cerebro Knowledge Hub.</p>
                    </div>
                    <div className="p-5 bg-surface border border-border rounded-xl relative border-[#00E5FF]/30">
                      <Bot size={20} className="text-accent-secondary mb-4" />
                      <h5 className="font-bold text-text-primary mb-2">2. Agent Network</h5>
                      <p className="text-xs text-text-secondary">Deploy specific AgentOS skills mapped to departmental bottlenecks.</p>
                    </div>
                    <div className="p-5 bg-surface border border-border rounded-xl relative">
                      <Network size={20} className="text-text-muted mb-4" />
                      <h5 className="font-bold text-text-primary mb-2">3. Decision Engine</h5>
                      <p className="text-xs text-text-secondary">Integrate Quantiva ERP for full multi-agent orchestration.</p>
                    </div>
                  </div>

                  <div className="text-center pt-8 border-t border-border">
                    <button className="px-8 py-4 bg-surface text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2">
                      Book Strategy Session <ArrowRight size={16} />
                    </button>
                    <button 
                      onClick={() => { setGenerated(false); setStep(1); setSelections({ industry: "", erp: "", maturity: "" }); }}
                      className="block mx-auto mt-4 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary"
                    >
                      Reset Simulator
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "EnterpriseSimulator"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/EnterpriseSimulator.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/EnterpriseSimulator.tsx
git commit -m "refactor: migrate EnterpriseSimulator wrapper/intro to Section/PageContainer/Stack primitives"
```

---

### Task 5: `LivingDigitalTwin.tsx`

**Files:**
- Modify: `components/home/v3/LivingDigitalTwin.tsx` (full file, 152 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack` (Phase 0)

Only the outer wrapper and intro block migrate. The `theme-panel`/`theme-card` classes used throughout the rest of the file are an existing shared CSS mechanism, distinct from the hand-rolled `bg-surface border rounded-2xl` pattern this migration targets — left untouched.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { UserX, Bot, ArrowRight, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

const workflows = [
  {
    id: "finance",
    label: "Finance: Invoice Processing",
    before: { role: "Human Analyst", task: "Manual data entry & routing", time: "8 hours" },
    after: { role: "Invoice Agent", task: "Autonomous parsing & ERP validation", time: "15 minutes" },
    impact: "87% faster processing, zero human error.",
    color: "bg-[#00E5FF]"
  },
  {
    id: "hr",
    label: "HR: Employee Onboarding",
    before: { role: "HR Coordinator", task: "Chasing IT tickets & compliance docs", time: "3 days" },
    after: { role: "Onboarding Swarm", task: "Parallel account provisioning & training plan generation", time: "2 hours" },
    impact: "Saves 12 coordinator hours per hire.",
    color: "bg-[#7B61FF]"
  },
  {
    id: "ops",
    label: "Ops: Supply Chain Routing",
    before: { role: "Logistics Manager", task: "Reactive exception handling", time: "24 hours" },
    after: { role: "Routing Agent", task: "Predictive rerouting based on live weather APIs", time: "Instant" },
    impact: "Prevents cascading delays proactively.",
    color: "bg-accent-primary"
  }
];

export default function LivingDigitalTwin() {
  const [activeId, setActiveId] = useState(workflows[0].id);
  const activeFlow = workflows.find(w => w.id === activeId)!;

  return (
    <Section size="default" className="border-b border-border bg-background">
      <PageContainer>
        
        <Stack gap="md" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-[#7B61FF] font-bold w-fit mx-auto">
            <Zap size={12} /> Living Digital Twin
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">The Automation Impact</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Watch how agentic workflows fundamentally rewire departmental efficiency, shifting humans from operators to overseers.
          </p>
        </Stack>

        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Selector */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {workflows.map(wf => (
              <button 
                key={wf.id}
                onClick={() => setActiveId(wf.id)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  activeId === wf.id 
                    ? "bg-surface border-border shadow-lg scale-105" 
                    : "bg-surface/50 border-border hover:border-border-default"
                }`}
              >
                <div className="font-space font-bold text-text-primary mb-2">{wf.label}</div>
                <div className="text-xs text-text-secondary">View transformation →</div>
              </button>
            ))}
          </div>

          {/* Visualization */}
          <div className="lg:col-span-8 theme-panel p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            
            {/* Blueprint Grid for Light Mode */}
            <div className="block dark:hidden absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'linear-gradient(to right, #2563EB 1px, transparent 1px), linear-gradient(to bottom, #2563EB 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0.4, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  
                  {/* Before */}
                  <div className="flex-1 w-full theme-card bg-surface-secondary opacity-70 p-6 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-surface border border-border rounded-full text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      Before
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-text-muted">
                        <UserX size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">{activeFlow.before.role}</div>
                        <div className="text-xs text-text-secondary">{activeFlow.before.task}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-space font-bold text-text-primary mb-1">{activeFlow.before.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Processing Time</div>
                  </div>

                  {/* Transition */}
                  <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                    <div className="h-10 w-px bg-surface-elevated md:hidden" />
                    <ArrowRight size={24} className="text-accent-secondary hidden md:block" />
                    <div className="h-10 w-px bg-surface-elevated md:hidden" />
                  </div>

                  {/* After */}
                  <div className="flex-1 w-full theme-card border-accent-secondary/50 p-6 relative shadow-lg dark:shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-accent-secondary rounded-full text-[10px] font-bold uppercase tracking-widest text-text-primary shadow-lg">
                      After
                    </div>
                    <div className="flex items-center gap-3 mb-4 mt-2">
                      <div className="w-10 h-10 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
                        <Bot size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">{activeFlow.after.role}</div>
                        <div className="text-xs text-text-secondary">{activeFlow.after.task}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-space font-bold text-accent-secondary mb-1">{activeFlow.after.time}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Processing Time</div>
                  </div>

                </div>

                <div className="mt-10 p-5 rounded-xl theme-card text-center flex items-center justify-center gap-3 relative z-10">
                  <Target size={16} className="text-accent-primary" />
                  <span className="text-sm font-bold text-text-primary uppercase tracking-widest">Business Impact:</span>
                  <span className="text-sm text-accent-primary">{activeFlow.impact}</span>
                </div>

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

Run: `npx tsc --noEmit 2>&1 | grep -i "LivingDigitalTwin"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/LivingDigitalTwin.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/LivingDigitalTwin.tsx
git commit -m "refactor: migrate LivingDigitalTwin wrapper/intro to Section/PageContainer/Stack primitives"
```

---

### Task 6: `LivingArchitecture.tsx`

**Files:**
- Modify: `components/home/v3/LivingArchitecture.tsx` (full file, 165 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack` (Phase 0)

Same reasoning as Task 5 — `theme-panel`/`theme-card` internals are left untouched.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { Database, BrainCircuit, Bot, Building2, Server, ArrowDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";

const layers = [
  {
    id: "data",
    label: "1. Enterprise Data",
    icon: Database,
    desc: "Ingests raw, unstructured, and structured data from legacy systems in real-time.",
    why: "LLMs are useless without context. This layer grounds the AI in your specific reality.",
    problem: "Siloed data prevents cross-departmental automation.",
    products: "Cerebro Knowledge Hub",
    color: "bg-[#FFB300]"
  },
  {
    id: "reasoning",
    label: "2. The Reasoning Layer",
    icon: BrainCircuit,
    desc: "Transforms raw data into semantic vectors and knowledge graphs.",
    why: "Allows the system to understand the relationships between an invoice, a vendor, and a contract.",
    problem: "Keyword search fails when complex reasoning is required.",
    products: "Enterprise Vector Engine",
    color: "bg-[#00E5FF]"
  },
  {
    id: "agents",
    label: "3. Agent Network",
    icon: Bot,
    desc: "Specialized, autonomous agents that pull from the reasoning layer to execute specific tasks.",
    why: "Replaces monolithic software with modular, easily updatable skill nodes.",
    problem: "Manual workflows scale linearly. Agent networks scale exponentially.",
    products: "Cerebro AgentOS",
    color: "bg-[#7B61FF]"
  },
  {
    id: "decision",
    label: "4. Business Applications",
    icon: Building2,
    desc: "The UI where humans oversee the automated execution and handle extreme edge cases.",
    why: "Maintains human-in-the-loop governance for high-risk decisions.",
    problem: "Total black-box automation fails regulatory compliance.",
    products: "Quantiva AI ERP",
    color: "bg-accent-primary"
  }
];

export default function LivingArchitecture() {
  const [activeLayer, setActiveLayer] = useState(layers[2].id);

  return (
    <Section size="default" className="border-b border-border bg-background relative overflow-hidden">
      <PageContainer>
        
        <Stack gap="md" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-text-muted font-bold w-fit mx-auto">
            <Server size={12} /> Living Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">How AI-Native Systems Work</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            Explore the architecture required to transition from legacy silos to autonomous agent swarms.
          </p>
        </Stack>

        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          
          {/* Architecture Diagram */}
          <div className="lg:col-span-5 flex flex-col gap-2 relative">
            
            {/* Animated Data Flow line */}
            <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-surface-elevated z-0">
              <motion.div 
                className="w-full h-1/4 bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent"
                animate={{ top: ["-20%", "120%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute" }}
              />
            </div>

            {layers.map((layer) => (
              <button 
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-6 p-4 rounded-xl transition-all relative z-10 ${
                  activeLayer === layer.id ? "bg-surface-elevated border border-border" : "hover:bg-surface border border-transparent"
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                  activeLayer === layer.id ? `${layer.color} border-border text-text-primary shadow-[0_0_15px_currentColor]` : 'bg-surface border-border text-text-primary'
                }`}>
                  <layer.icon size={20} />
                </div>
                <div className="text-left">
                  <div className={`font-space font-bold text-lg transition-colors ${activeLayer === layer.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {layer.label}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-7 theme-panel p-8 relative min-h-[400px]">
            {/* Blueprint Grid for Light Mode */}
            <div className="block dark:hidden absolute inset-0 pointer-events-none opacity-5 rounded-2xl overflow-hidden" 
                 style={{ backgroundImage: 'linear-gradient(to right, #64748B 1px, transparent 1px), linear-gradient(to bottom, #64748B 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />

            <AnimatePresence mode="wait">
              {layers.map(layer => layer.id === activeLayer && (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0.4, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-text-primary ${layer.color}`}>
                      <layer.icon size={20} />
                    </div>
                    <h3 className="text-2xl font-space font-bold text-text-primary">{layer.label}</h3>
                  </div>

                  <p className="text-lg text-text-primary mb-8 leading-relaxed">
                    {layer.desc}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    <div className="theme-card p-5 relative">
                      <div className="absolute top-4 right-4 text-text-muted"><Info size={14} /></div>
                      <div className="text-[10px] uppercase tracking-widest text-warning font-bold mb-2">Why does this exist?</div>
                      <p className="text-sm text-text-secondary leading-relaxed">{layer.why}</p>
                    </div>
                    <div className="theme-card p-5 relative">
                      <div className="absolute top-4 right-4 text-text-muted"><Info size={14} /></div>
                      <div className="text-[10px] uppercase tracking-widest text-accent-primary font-bold mb-2">Problem Solved</div>
                      <p className="text-sm text-text-secondary leading-relaxed">{layer.problem}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">CerebroHive Implementation</div>
                      <div className="font-bold text-accent-secondary">{layer.products}</div>
                    </div>
                    <button className="px-4 py-2 border border-border rounded text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-surface-elevated dark:hover:bg-surface-elevated transition-colors">
                      View Documentation
                    </button>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "LivingArchitecture"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/LivingArchitecture.tsx`
Expected: only the pre-existing `ArrowDown` unused-import warning.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/LivingArchitecture.tsx
git commit -m "refactor: migrate LivingArchitecture wrapper/intro to Section/PageContainer/Stack primitives"
```

---

### Task 7: `ResearchHighlights.tsx`

**Files:**
- Modify: `components/home/v3/ResearchHighlights.tsx` (full file, 87 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

The intro is a `flex flex-col md:flex-row justify-between items-end` row (title block + a button) — that outer row stays plain Tailwind (not `Stack`'s scoped use case). Only the inner title text block (badge/`h2`/`p`) becomes `Stack`, which also normalizes its `mb-4` `h2`→`p` gap to the site's dominant 24px rhythm (see Global Constraints). The two cards (`bg-surface ... rounded-2xl p-8` and `bg-surface-elevated ... rounded-2xl p-8`) are both exact `Card` `lg` matches except for background — the second gets a `bg-surface-elevated` override.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { BookOpen, ArrowDown, Bot, Database, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const research = [
  {
    title: "Enterprise Agent Memory",
    paper: "Scaling Long-Term Context in Multi-Agent Swarms",
    desc: "Our breakthrough in persistent agent memory allows systems to remember conversational context, corporate policies, and past decisions across sessions.",
    product: "AgentOS",
    productIcon: Bot,
    color: "text-[#7B61FF]"
  },
  {
    title: "Reasoning Systems",
    paper: "Deterministic Routing in Non-Deterministic LLMs",
    desc: "A novel architecture that forces probabilistic language models to generate deterministic JSON outputs, guaranteeing compliance for ERP integration.",
    product: "Quantiva ERP",
    productIcon: Target,
    color: "text-accent-primary"
  }
];

export default function ResearchHighlights() {
  return (
    <Section size="default" className="border-b border-border bg-background">
      <PageContainer>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <Stack gap="md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-warning font-bold w-fit">
              <BookOpen size={12} /> CerebroHive Research
            </div>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">From Lab to Production.</h2>
            <p className="text-lg text-text-secondary max-w-2xl font-inter">
              We don&apos;t just publish papers. Every breakthrough generated by our research institute is immediately integrated into our platform.
            </p>
          </Stack>
          <button className="px-6 py-3 border border-border rounded-lg text-sm font-bold uppercase tracking-widest text-text-primary hover:bg-surface transition-colors whitespace-nowrap">
            Visit Research Institute
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {research.map((item, i) => (
            <div key={i} className="flex flex-col relative group">
              
              {/* The Research */}
              <div className={cn(cardVariants({ size: "lg" }), "relative z-10 hover:border-border-strong transition-colors")}>
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-3 flex items-center gap-2">
                  <BookOpen size={12} /> Research Area
                </div>
                <h3 className="text-2xl font-space font-bold text-text-primary mb-2">{item.title}</h3>
                <div className="text-xs font-bold text-warning mb-4">Paper: {item.paper}</div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-primary group-hover:text-[#FFB300] transition-colors cursor-pointer">
                  Read Abstract <ArrowRight size={14} />
                </div>
              </div>

              {/* The Connection */}
              <div className="flex justify-center -my-3 relative z-20">
                <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
                  <ArrowDown size={14} className="text-text-muted group-hover:text-text-primary transition-colors" />
                </div>
              </div>

              {/* The Product */}
              <div className={cn(cardVariants({ size: "lg" }), "bg-surface-elevated relative z-10")}>
                <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">Integrated Into Platform</div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center ${item.color}`}>
                    <item.productIcon size={24} />
                  </div>
                  <h4 className="text-xl font-space font-bold text-text-primary">{item.product}</h4>
                </div>
              </div>

            </div>
          ))}
        </div>

      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "ResearchHighlights"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/ResearchHighlights.tsx`
Expected: only the pre-existing `Database` unused-import warning — the `react/no-unescaped-entities` error is now fixed.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/ResearchHighlights.tsx
git commit -m "refactor: migrate ResearchHighlights to Section/PageContainer/Stack/Card primitives"
```

---

### Task 8: `HumanProof.tsx`

**Files:**
- Modify: `components/home/v3/HumanProof.tsx` (full file, 140 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

Intro becomes `Stack`. The "Case Study Details" panel (`bg-surface border border-border rounded-2xl p-8 md:p-12`) is a `Card` `lg` match with a `md:p-12` override, same pattern as Task 3/4. The customer-selector buttons (conditional `bg-surface`/`bg-surface/50` based on active state) and the small `p-4 rounded-xl` stat chips inside the details panel are left untouched — the selector's background is state-dependent, which `Card`'s variant system doesn't model, and the chips use `rounded-xl`, not the `Card` shape.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { Users, Building, Target, Zap, CheckCircle2, Bot, Layers, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const cases = [
  {
    id: "healthcare",
    industry: "Healthcare Provider Network",
    logo: "GlobalHealth",
    challenge: "Processing 50,000+ unstructured clinical notes daily required 400+ hours of manual nurse review for compliance.",
    solution: "Deployed a HIPAA-compliant agent swarm to parse notes, extract billing codes, and flag anomalies prior to human review.",
    products: ["Cerebro Knowledge Hub", "AgentOS"],
    timeline: "3 Months (Pilot to Production)",
    outcome: "92% reduction in manual review time.",
    metric: "92%",
    color: "bg-[#00E5FF]"
  },
  {
    id: "logistics",
    industry: "Global Logistics Firm",
    logo: "TransGlobal Freight",
    challenge: "Supply chain managers were reacting to weather delays 12 hours too late, causing cascading inventory shortages.",
    solution: "Integrated Quantiva ERP with live weather APIs and reasoning models to proactively suggest route alternatives.",
    products: ["Quantiva AI ERP"],
    timeline: "6 Months",
    outcome: "Prevented $12M in delay penalties.",
    metric: "$12M",
    color: "bg-accent-primary"
  }
];

export default function HumanProof() {
  const [activeCase, setActiveCase] = useState(cases[0]);

  return (
    <Section size="default" className="border-b border-border bg-background">
      <PageContainer>
        
        <Stack gap="md" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[10px] uppercase tracking-widest text-accent-primary font-bold w-fit mx-auto">
            <Users size={12} /> Enterprise Evidence
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">Proven in production.</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            See how Fortune 500 companies use CerebroHive to transition from legacy operations to autonomous execution.
          </p>
        </Stack>

        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Customer Selector */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {cases.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCase(c)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  activeCase.id === c.id 
                    ? "bg-surface border-border shadow-lg" 
                    : "bg-surface/50 border-border hover:border-border-default"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building size={16} className="text-text-muted" />
                  <div className="text-xs font-bold uppercase tracking-widest text-text-muted">{c.industry}</div>
                </div>
                <div className={`font-space font-bold text-xl ${activeCase.id === c.id ? "text-text-primary" : "text-text-secondary"}`}>
                  {c.logo}
                </div>
              </button>
            ))}
          </div>

          {/* Case Study Details */}
          <div className={cn("lg:col-span-8", cardVariants({ size: "lg" }), "md:p-12 relative overflow-hidden")}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCase.id}
                initial={{ opacity: 0.4, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                
                <div className="flex flex-col md:flex-row gap-8 mb-10">
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-warning font-bold mb-3 flex items-center gap-2">
                      <Target size={12} /> The Challenge
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">{activeCase.challenge}</p>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-accent-secondary font-bold mb-3 flex items-center gap-2">
                      <CheckCircle2 size={12} /> The Solution
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{activeCase.solution}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Products Used</div>
                    <div className="flex flex-col gap-2">
                      {activeCase.products.map(p => (
                        <div key={p} className="text-xs font-bold text-text-primary flex items-center gap-2">
                          {p.includes("Quantiva") ? <Layers size={12} className="text-accent-primary" /> : <Bot size={12} className="text-accent-secondary" />} {p}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">Timeline</div>
                    <div className="text-sm font-bold text-text-primary">{activeCase.timeline}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${activeCase.color}`} />
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2 ml-2">Business Outcome</div>
                    <div className="text-3xl font-space font-bold text-text-primary ml-2">{activeCase.metric}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <p className="text-sm font-bold text-accent-primary">{activeCase.outcome}</p>
                  <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-primary hover:text-[#00F57A] transition-colors">
                    Read Full Study <ArrowRight size={14} />
                  </button>
                </div>

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

Run: `npx tsc --noEmit 2>&1 | grep -i "HumanProof"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/HumanProof.tsx`
Expected: only the pre-existing `Zap` unused-import warning.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/HumanProof.tsx
git commit -m "refactor: migrate HumanProof to Section/PageContainer/Stack/Card primitives"
```

---

### Task 9: `EnterpriseReadiness.tsx`

**Files:**
- Modify: `components/home/v3/EnterpriseReadiness.tsx` (full file, 48 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer` (Phase 0)

Only the outer wrapper migrates. The inner panel (`bg-background border border-border rounded-3xl p-12 md:p-16 ... shadow-2xl`) uses `rounded-3xl` and `bg-background`, not the `Card` shape (`rounded-2xl`/`bg-surface`) — a deliberately distinct, more prominent panel treatment, left untouched. The small feature chips (`p-4 rounded-xl`) are likewise not `Card` instances.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";

const features = [
  "Multi-Region Deployment",
  "Private Cloud & On-Premises",
  "SSO & Directory Sync",
  "Role-Based Access Control (RBAC)",
  "Full Audit Logging",
  "EU AI Act Governance",
  "SOC2 Type II & HIPAA",
  "Deterministic Guardrails"
];

export default function EnterpriseReadiness() {
  return (
    <Section size="default" className="border-b border-border bg-background">
      <PageContainer>
        <div className="bg-background border border-border rounded-3xl p-12 md:p-16 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center justify-between shadow-2xl">
          
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00F57A]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-xl relative z-10 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-6 mx-auto md:mx-0 border border-border">
              <ShieldCheck size={32} className="text-accent-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">Enterprise Grade by Default.</h2>
            <p className="text-text-secondary font-inter">
              Consumer AI tools operate in a black box. CerebroHive is built for the Fortune 500, with compliance, security, and governance baked into every layer of the architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full max-w-2xl">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
                <CheckCircle2 size={16} className="text-accent-primary shrink-0" />
                <span className="text-sm font-bold text-text-primary">{feature}</span>
              </div>
            ))}
          </div>

        </div>
      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "EnterpriseReadiness"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/EnterpriseReadiness.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/EnterpriseReadiness.tsx
git commit -m "refactor: migrate EnterpriseReadiness wrapper to Section/PageContainer primitives"
```

---

### Task 10: `TransformationRoadmap.tsx`

**Files:**
- Modify: `components/home/v3/TransformationRoadmap.tsx` (full file, 150 lines)

**Interfaces:**
- Consumes: `Section`, `PageContainer`, `Stack`, `cardVariants` (Phase 0)

Intro has only `h2` + `p` (no badge), so `Stack` here needs neither `w-fit` nor `mx-auto`. The "Active Phase Details" panel (`bg-surface border border-border rounded-2xl p-8 md:p-12 ... text-center`) is a `Card` `lg` match with a `md:p-12` override. The timeline tracker and the final CTA block (single `h3` + button row, no multi-line rhythm worth wrapping) are left untouched.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import React, { useState } from "react";
import { ArrowRight, FileSearch, PenTool, FlaskConical, Rocket, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/primitives/Section";
import { PageContainer } from "@/components/ui/primitives/PageContainer";
import { Stack } from "@/components/ui/primitives/Stack";
import { cardVariants } from "@/components/ui/primitives/Card";

const roadmap = [
  {
    id: "assess",
    icon: FileSearch,
    title: "1. Assess",
    duration: "Weeks 1-2",
    desc: "Evaluate current ERP limitations and map high-value manual workflows.",
    deliverable: "AI Maturity Matrix",
    color: "text-accent-secondary",
    bgColor: "bg-[#00E5FF]"
  },
  {
    id: "design",
    icon: PenTool,
    title: "2. Design",
    duration: "Weeks 3-4",
    desc: "Architect the Knowledge Hub and design deterministic guardrails.",
    deliverable: "Platform Architecture Blueprint",
    color: "text-warning",
    bgColor: "bg-[#FFB300]"
  },
  {
    id: "pilot",
    icon: FlaskConical,
    title: "3. Pilot",
    duration: "Months 2-3",
    desc: "Deploy AgentOS against a single, high-volume operational bottleneck.",
    deliverable: "Production Agent Swarm",
    color: "text-[#7B61FF]",
    bgColor: "bg-[#7B61FF]"
  },
  {
    id: "deploy",
    icon: Rocket,
    title: "4. Deploy",
    duration: "Months 4-6",
    desc: "Integrate Quantiva ERP and shift employees to overseer roles.",
    deliverable: "Enterprise Go-Live",
    color: "text-accent-primary",
    bgColor: "bg-accent-primary"
  },
  {
    id: "scale",
    icon: Network,
    title: "5. Scale",
    duration: "Month 6+",
    desc: "Expand agent swarms across adjacent business units automatically.",
    deliverable: "Autonomous Enterprise",
    color: "text-text-primary",
    bgColor: "bg-surface"
  }
];

export default function TransformationRoadmap() {
  const [activePhase, setActivePhase] = useState(roadmap[0]);

  return (
    <Section size="default" className="border-b border-border bg-background relative">
      <PageContainer>
        
        <Stack gap="md" className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary">The Transformation Roadmap</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-inter">
            How we guide organizations from manual operations to an AI-native architecture in six months.
          </p>
        </Stack>

        <div className="max-w-5xl mx-auto">
          
          {/* Timeline Tracker */}
          <div className="flex flex-col md:flex-row justify-between mb-12 relative">
            <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-surface-elevated z-0" />
            {roadmap.map((phase, i) => {
              const isActive = activePhase.id === phase.id;
              const isPast = roadmap.findIndex(r => r.id === activePhase.id) > i;
              
              return (
                <div key={phase.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-4 mb-6 md:mb-0 cursor-pointer group" onClick={() => setActivePhase(phase)}>
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-colors ${
                    isActive ? `border-[#0A0D14] ${phase.bgColor} text-text-primary` :
                    isPast ? `border-[#0A0D14] bg-surface-elevated text-text-primary` :
                    "border-border bg-background text-text-muted group-hover:text-text-primary group-hover:border-border-strong"
                  }`}>
                    <phase.icon size={20} />
                  </div>
                  <div className="text-left md:text-center">
                    <div className={`font-space font-bold text-sm transition-colors ${isActive ? "text-text-primary" : "text-text-secondary"}`}>{phase.title}</div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{phase.duration}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Phase Details */}
          <div className={cn(cardVariants({ size: "lg" }), "md:p-12 relative overflow-hidden text-center")}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase.id}
                initial={{ opacity: 0.4, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-6">
                  <activePhase.icon size={32} className={activePhase.color} />
                </div>
                <h3 className="text-3xl font-space font-bold text-text-primary mb-4">{activePhase.title}</h3>
                <p className="text-lg text-text-secondary leading-relaxed mb-8">
                  {activePhase.desc}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
                  <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Key Deliverable:</span>
                  <span className="text-sm font-bold text-text-primary">{activePhase.deliverable}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-space font-bold text-text-primary mb-6">Ready to build the AI-Native Enterprise?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Book Strategy Session — Roadmap CTA">
                <button className="px-8 py-4 bg-surface text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  Book Strategy Session <ArrowRight size={16} />
                </button>
              </TrackedLink>
              <TrackedLink href="/services" analyticsEvent="cta_click" analyticsCategory="engagement" analyticsLabel="Explore Services — Roadmap CTA">
                <button className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-surface transition-colors">
                  Explore Services
                </button>
              </TrackedLink>
            </div>
          </div>

        </div>

      </PageContainer>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -i "TransformationRoadmap"`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npx eslint components/home/v3/TransformationRoadmap.tsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/home/v3/TransformationRoadmap.tsx
git commit -m "refactor: migrate TransformationRoadmap to Section/PageContainer/Stack/Card primitives"
```

---

### Task 11: Full-page visual verification

**Files:**
- None (verification only)

**Interfaces:**
- None

- [ ] **Step 1: Full-project typecheck**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 2: Full-project lint on touched files**

Run: `npx eslint components/home/v3/*.tsx`
Expected: only the pre-existing unused-import warnings noted in the Global Constraints (no errors).

- [ ] **Step 3: Visual verification of the whole Landing page**

Run: `npm run dev` (or use the already-running dev server if one is live — check `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` first), then load `http://localhost:3000/` in a browser.

At each of these breakpoints — Desktop: 1440px, 1280px; Tablet: 1024px, 768px; Mobile: 430px, 390px, 360px — scroll through the entire page top to bottom and confirm:
- No horizontal overflow anywhere
- Every section's vertical rhythm looks intentional (the `py-24`-origin sections are now visibly taller on desktop / tighter on mobile than before — this is the expected, documented Phase 0 change, not a bug)
- All badge pills stay their natural width and are correctly centered or left-aligned as per the original design
- Card padding/shape is visually unchanged from before this phase (32px `lg` cards, 24px `md` stat tiles)
- `EnterpriseDashboard`'s `-mt-8` overlap with the hero still looks correct
- `theme-panel`/`theme-card` sections (`LivingArchitecture`, `LivingDigitalTwin`) are visually unchanged (untouched by this plan)

- [ ] **Step 4: Confirm all 10 commits are present**

Run: `git log --oneline -10`
Expected: one commit per Task 1-10 (HomeHero through TransformationRoadmap), each with a `refactor:` message.

## Self-Review Notes

- **Spec coverage:** All 11 Landing components are accounted for — 10 migrated in this plan, 1 (`IntegratedPlatform.tsx`) already done in Phase 0. `app/page.tsx` itself needs no changes (pure composition, no markup of its own). Every task states explicitly what is migrated and what is deliberately left untouched (and why), per the Global Constraints' scope discipline.
- **Placeholder scan:** No TBD/TODO/"rest unchanged" markers — every task ships the complete file content, including the untouched portions, so no step depends on the reader inferring omitted code.
- **Type consistency:** `cardVariants({ size: "lg" | "md" })` calls match the exact size keys defined in Phase 0's `Card.tsx` (`sm`/`md`/`lg`/`xl`); `Section size="tight" | "default"` and `Stack gap="md"` match the exact union values from Phase 0's `Section.tsx`/`Stack.tsx`. No new primitive variants are introduced.
- **Lint ground truth:** All `react/no-unescaped-entities` fixes and pre-existing-warning callouts in this plan were verified against a real `npx eslint` run over all 10 target files before writing the tasks, not assumed.
