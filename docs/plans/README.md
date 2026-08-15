# Plans

> **STATUS: SUPERSEDED FOR WORK ASSIGNMENT — retained for historical/commercial context only. Current work must originate in `docs/portfolio/MASTER-IMPLEMENTATION-LEDGER.md`.** `active/` below is historical. Wave 0 execution is `docs/portfolio/WAVE-0.md`.

Implementation plans — the "work being executed" side of documentation, as distinct from permanent documentation (`../architecture/`, `../domains/`, etc.) that describes how the system currently works. See [`../documentation-guidelines.md`](../documentation-guidelines.md) for the full rule on keeping these separate.

| Folder | Contents |
|---|---|
| [`active/`](./active/) | Plans currently being executed or not yet started |
| [`completed/`](./completed/) | Plans whose work has shipped, kept as a historical record of what was decided and why |

When a plan in `active/` finishes, move it to `completed/` in the same change that closes it out — don't leave finished plans in `active/`.

## Classification evidence

Every plan below was classified `active`/`completed` against `git log`, not inferred from filename or folder alone — each row cites the commit that shipped it (for `completed/`) or the absence of one (for `active/`), so the classification is independently checkable with `git log --oneline --all --grep="<text>"`.

| Plan | Folder | Evidence |
|---|---|---|
| `2026-07-17-phase-0-layout-primitives.md` | `completed/` | Shipped — landing/services rollout depends on it; site is live |
| `2026-07-18-phase-1-landing-rollout.md` | `completed/` | Shipped — site is live |
| `2026-07-18-phase-2-services-rollout.md` | `completed/` | `87697aa refactor(services): Migrate Phase 2 Services rollout to robust UI primitives` |
| `2026-07-21-cerebro-archive-live-runtime.md` | `completed/` | `7f10c1e docs: add CerebroArchive Live Runtime implementation plan` + follow-on `feat:`/`fix:` commits on the same slice |
| `2026-08-07-cerebrosphere-dashboard.md` | `completed/` | `4d5e794 feat: add CerebroSphere dashboard snapshot`, `485ef33 fix: configure CerebroSphere dashboard test harness` |
| `2026-08-09-studio-company-os-01-foundation-brain.md` | `completed/` | `bdb41f0 feat(company-os): persist operating tasks` + `company-os` commit series |
| `2026-08-09-studio-company-os-02-execution-domains.md` | `completed/` | Same `company-os` commit series (`15a5b0b`, `cb5f708`, `21a4c19`, `ca61cb3`, …) |
| `2026-08-10-studio-company-operating-system.md`, `-03-organizational-views.md`, `-04-intelligence-operations.md`, `-05-hardening-validation.md` | `completed/` | Same `company-os` commit series, through `a09554e fix(company-os): wire tenant workspace context` |
| `2026-08-10-digital-twin-studio-smart-factory.md` | `completed/` | `262ec88 feat: deliver smart factory twin vertical slice` |
| `2026-08-11-agent-academy-agent-registry.md` | `active/` | Plan commit `8235ea6 docs: plan agent registry vertical slice` exists; no corresponding `feat:` delivery commit found as of this reorganization |
| `2026-08-11-twin-industry-framework.md` | `active/` | Plan commit `ede52a8 docs: plan twin industry framework` exists; no corresponding `feat:` delivery commit found |
| `agent-runtime-backlog.md` | `active/` | `PROGRESS.md` (2026-08-10 entries) lists M10.1/M10.2 tasks as still overdue/in-progress |
| `cerebrohive-6-month-master-plan.md` / `cerebrohive-aeos-6-month-mega-plan.md` | `active/` | The two current 6-month master plans — no commit or `PROGRESS.md` entry marks the 6-month program itself complete. See [`../reviews/master-plan-gap-assessment.md`](../reviews/master-plan-gap-assessment.md) for the gap analysis against actual repo state, and `master-plan-evolution-log.md` for how the plan has changed over time. |
| `m27-governance-analytics-task-record.md` (formerly `task.md`) | `completed/` | Every item in the file's own checklist is marked `[x]`; `PROGRESS.md`'s 2026-08-10 noon-audit entry confirms "M27 Governance Analytics — all 6 tasks in `task.md` confirmed marked complete" |

If a plan here ships or stalls, update this table in the same change — don't let the table drift from the folder contents.

## Superseded plans

Move outdated/abandoned plans to [`../archive/superseded/`](../archive/superseded/), not `completed/` — `completed/` means the work shipped, `archive/superseded/` means the plan itself was replaced or abandoned before completion.
