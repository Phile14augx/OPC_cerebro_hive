# Phase 1: Schema & Navigation Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-10
**Phase:** 01-schema-navigation-foundation
**Areas discussed:** Navigation scope reconciliation (99 vs originally-scoped items) and CerebroForge treatment

---

## Navigation scope for the 9 previously-unscoped nav groups

Discovered during codebase scouting (not something the user raised — surfaced by reading `apps/studio/app/(platform)/app/navigation/index.ts` directly): the navigation registry has 99 items across 14 groups, but REQUIREMENTS.md only ever scoped 5 of them. 9 groups (69 items) — CerebroForge, HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support — were never captured in the original requirements-gathering pass.

| Option | Description | Selected |
|--------|-------------|----------|
| Honest placeholder for all 9 groups | Every item in the 9 unscoped groups gets a "not yet available" page this phase; no functionality build | |
| CerebroForge gets real treatment | CerebroForge (19 items, working backend) gets functional implementation; other 8 groups get placeholders | ✓ |
| Let me specify per-group | User walks through all 9 groups individually | |

**User's choice:** CerebroForge gets real treatment — the other 8 groups (HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support = 50 items) get standardized placeholders.

**Notes:** User gave a detailed, complete answer covering: (1) all 99 items must resolve, (2) CerebroForge's 19 items get real functional implementation since `forge-api` already works end-to-end, explicitly qualified as "wherever the endpoint already exists" — verified this means 9 of 19 have real controllers today, the other 10 don't and get placeholders same as the other groups, (3) explicit non-goal: don't over-polish CerebroForge to final-product quality in this phase — functional integration only, deep polish is a future CerebroForge-specific phase, (4) placeholders must be registry-driven via an `implementationStatus` field, not hardcoded one-offs, with a standard "not yet available" page rendering module/feature/status, (5) breadcrumbs and page titles should derive from the same registry entry.

---

## Claude's Discretion

- SCHM-01 (schema gap confirmation for Governance/Talent OS/Explore) — already verified directly against the live DB and schema.prisma this session; not re-discussed as a gray area since the facts were already established, not a preference.
- SCHM-02 (BullMQ version reconciliation) — mechanical dependency alignment (pick v6, the more current/already-used-by-archive-api version); no user preference needed.
- Exact wording/styling of the standardized placeholder page beyond the content pattern the user specified — left to the planner/executor within the existing (locked) visual system.

## Deferred Ideas

- CerebroForge's remaining 10 unbacked nav items (UI/UX Studio, Backend Studio, Database Studio, API Studio, Mobile Studio, Web Studio, Desktop Studio, CerebroBots, Repository Manager, Monitoring & Ops) — future CerebroForge-dedicated phase, once forge-api grows backend surface for them.
- Full functionality for the 8 newly-discovered placeholder groups (HiveOps, Infrastructure, Data, Automation, Research, Academy, Business, Support) — no phase exists for these yet in the current milestone; would need a future milestone/phase if ever prioritized.
- Registry-driven search/command-palette/telemetry integration — named by the user as a future payoff of the canonical navigation schema, explicitly out of this phase's scope.
