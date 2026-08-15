# Twin Industry Framework Implementation Plan

> **STATUS: SUPERSEDED FOR WORK ASSIGNMENT — retained for historical/commercial context only. Current work must originate in `docs/portfolio/MASTER-IMPLEMENTATION-LEDGER.md`.** Twin Studio is not a Wave 0 product slot. Park on `feat/twin-studio-full-implementation`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Twin Studio from the Smart Factory slice into an industry-neutral platform that can generate validated ontologies for physical, operational, and business domains.

**Architecture:** Add an `IndustryModelProvider` port and deterministic semantic generator that converts a domain brief into validated TDL proposals. Domain packs provide optional examples and vocabulary, never hard-coded runtime logic; generated proposals remain preview-only until explicitly applied as a new `TwinVersion`.

**Tech Stack:** TypeScript, Zod, Next.js, Prisma/PostgreSQL, Node assertion verification.

## Global Constraints

- Every generated model must validate through `TwinDefinitionSchema` before preview.
- Industry packs are hints and examples, not exclusive templates.
- Support physical and business twins with the same core contracts.
- AI output follows proposal -> validation -> policy -> preview -> explicit apply.
- Preserve tenant/workspace/version scope and provenance.

---

### Task 1: Universal ontology contracts

**Files:**
- Modify: `packages/twin-contracts/src/twin-definition.ts`
- Create: `packages/twin-contracts/src/industry-model.ts`
- Modify: `packages/twin-contracts/src/index.ts`
- Test: `packages/twin-contracts/src/industry-model.test.ts`

**Interfaces:** Produces `IndustryBriefSchema`, `IndustryModelProposalSchema`, entity attributes, relationship cardinality, metrics, alerts, and proposal provenance.

- [ ] Write a failing test proving airport and commercial-bank briefs produce structurally distinct valid proposals.
- [ ] Run the test and confirm the generator contract is absent.
- [ ] Implement the Zod contracts and exported TypeScript types.
- [ ] Run contract typecheck and behavioral verification.
- [ ] Commit `feat: add universal industry model contracts`.

### Task 2: Semantic industry generator

**Files:**
- Create: `apps/twin-studio/modules/industry/industry-model-provider.ts`
- Create: `apps/twin-studio/modules/industry/deterministic-industry-provider.ts`
- Create: `apps/twin-studio/modules/industry/domain-vocabulary.ts`
- Modify: `apps/twin-studio/scripts/verify.ts`

**Interfaces:** Produces `generateIndustryModel(brief): IndustryModelProposal`; supports airport, bank, hospital, supply chain, building, energy grid, data center, factory, and open-ended briefs through composable semantic categories.

- [ ] Add failing verification assertions for domain distinction, relationship validity, and business/physical parity.
- [ ] Run verification and confirm the generator is missing.
- [ ] Implement vocabulary composition and deterministic provider behind `IndustryModelProvider`.
- [ ] Run verification and TypeScript checks.
- [ ] Commit `feat: add semantic industry model generator`.

### Task 3: Proposal and apply APIs

**Files:**
- Create: `apps/twin-studio/app/api/industry-models/generate/route.ts`
- Create: `apps/twin-studio/app/api/twins/[twinId]/versions/route.ts`
- Create: `apps/twin-studio/modules/twin-definition/version-proposal-service.ts`
- Modify: `apps/twin-studio/scripts/verify.ts`

**Interfaces:** `POST /api/industry-models/generate` returns preview-only validated TDL; `POST /api/twins/:id/versions` applies an approved proposal as a new version.

- [ ] Add failing assertions that generation cannot mutate a twin and apply requires explicit approval.
- [ ] Run verification and observe failure.
- [ ] Implement scoped proposal and approval services with structured errors.
- [ ] Run verification, typecheck, and build.
- [ ] Commit `feat: add industry proposal and version APIs`.

### Task 4: Industry Generator experience

**Files:**
- Create: `apps/twin-studio/features/industry-generator.tsx`
- Modify: `apps/twin-studio/features/command-center.tsx`
- Modify: `apps/twin-studio/app/globals.css`
- Modify: `apps/twin-studio/scripts/verify.ts`

**Interfaces:** Provides domain brief input, generation progress, ontology preview, entity/relationship review, and explicit apply action.

- [ ] Add verification for preview labeling and approval requirement.
- [ ] Run verification and observe failure.
- [ ] Implement the generator panel with working API actions, loading/error states, and no fabricated analytics.
- [ ] Run behavioral verification, Prisma validation, all TypeScript checks, and production build.
- [ ] Commit `feat: add industry model generation experience`.

## Self-review

- Coverage includes contracts, semantic generation, validation, proposal safety, version application, APIs, and UI.
- New industries extend vocabulary/configuration rather than runtime business logic.
- The scope intentionally excludes connectors, distributed services, 3D, and autonomous control; those remain separate independently testable phases.
