# Documentation Map

The resulting documentation hierarchy for `OPC/cerebro-hive-website/docs/`, and the primary source of truth for each area. Start at [`README.md`](./README.md) for the narrative version of this page.

```text
docs/
├── README.md                    Documentation homepage
├── DOCUMENTATION-MAP.md         This file
├── documentation-guidelines.md  Rules for keeping this structure coherent
│
├── architecture/                PERMANENT — how the platform is built, today
│   ├── README.md
│   ├── taxonomy-index.md        Canonical entry point: 10-layer EIOS taxonomy
│   ├── PLATFORM-ARCHITECTURE.md Control-plane vs generation/execution plane (Day 1)
│   ├── EXECUTION-PLANE.md       Job states and worker honesty
│   ├── PLUGIN-ARCHITECTURE.md   Capability plugin / adapter contracts
│   ├── capability-model.md, product-registry.md, services-portfolio.md, commercial-strategy.md
│   ├── decisions/                All ADR series (see decisions/README.md for the 6 sub-series)
│   ├── assessments/              Point-in-time architecture assessments (not current-state docs)
│   ├── services/                 Per-service architecture notes
│   └── measurements/             Empirical data backing architecture claims
│
├── domains/                     PERMANENT — subsystem-specific documentation
│   └── hiveforge/                The HiveForge control-plane platform
│
├── specifications/              PERMANENT — what a product/feature does
│   ├── products/                 50 product specs (source of truth: architecture/product-registry.md indexes them)
│   └── features/                 Dated feature design specs
│
├── engineering/                 PERMANENT — day-to-day engineering conventions
│   ├── coding-standards.md
│   └── database.md
│
├── development/                 Local bootstrap for Studio, platform-api, forge-api
│   └── LOCAL-DEVELOPMENT.md
│
├── technology/                  What the registry claims vs what actually runs
│   └── TECHNOLOGY-MATRIX.md
│
├── studios/                     Per-studio honesty index
│   └── README.md
│
├── audits/                      7-day production-sprint forensic audits (Day 1)
│   ├── ROUTE-AUDIT.md
│   ├── API-AUDIT.md
│   ├── PERSISTENCE-AUDIT.md
│   ├── FEATURE-MATRIX.md
│   ├── FAKE-UI-AUDIT.md
│   ├── SECURITY-NOTES.md
│   └── IMPLEMENTATION-GAPS.md
│
├── operations/                  PERMANENT — running the platform in production
│   ├── disaster-recovery/
│   └── runbooks/                includes day1-local-bootstrap.md
│
├── company-handbook/            PERMANENT — how CerebroHive the company operates
│
├── 01-company-foundation/ … 12-thought-leadership/,
│ academy/, blog/, whitepapers/, products/, consulting-services/,
│ automation-services/, solutions/, industries/, engagement-models/,
│ tech-stack/, labs/                CONTENT CATALOG — the consulting/services offering
│                                   catalog (marketing + service-line content). Left
│                                   untouched by this reorganization: already internally
│                                   coherent and heavily cross-linked. Indexed from
│                                   README.md's "Full Offering Index" section, not from
│                                   this map.
│
├── plans/                       PLANS — work being executed, not permanent fact
│   ├── active/                   Not yet complete
│   └── completed/                Shipped; kept as historical record
│
├── reviews/                     Point-in-time audits, gap assessments, handoffs
│   └── audit/                    The M26.x audit batch + SEO/accessibility/analytics data
│
└── archive/                     Superseded and historical documentation
    ├── superseded/                Explicitly replaced by a newer version (see header)
    └── historical/                No longer current; not formally "superseded"
```

## Areas intentionally left outside `docs/`

| Location | Why it's not under `docs/` |
|---|---|
| Repository root: `README.md`, `AGENTS.md`, `SECURITY.md`, `CODEBASE.md`, `CEREBROHIVE_CONSTITUTION.md`, `PROGRESS.md`, `CURRENT-SPRINT.md` | Ecosystem convention (README/AGENTS/SECURITY) or actively read/written by tooling and multiple AI agents at that exact path (CODEBASE.md, PROGRESS.md, CURRENT-SPRINT.md, the constitution — referenced by plain-text mention from dozens of documents) |
| `agents/CLAUDE-TASKS.md`, `agents/CODEX-TASKS.md`, `agents/GEMINI-TASKS.md`, `agents/CURRENT-SPRINT.md` | Live multi-agent coordination state, updated multiple times a day — moving these would break in-flight coordination between the AI agents building this repository |
| `.planning/` | GSD workflow tool state — moving it breaks the `gsd-*` skills |
| `.claude/`, `.agents/`, `.worktrees/`, `.codex-task8-verification/`, `.codex-task8-fix-verification/`, `.superpowers/`, `.audit-quarantine/`, `.hermes/`, `.verify/`, `scratch/` | Tool-managed state, git worktree checkouts, or full-repo verification snapshots — not authored documentation, and moving them would corrupt live tooling. **Repo-hygiene note:** `.codex-task8-verification/` (~5,893 files) and `.codex-task8-fix-verification/` (~5,894 files) are both *tracked by git* (not gitignored) and appear to be unreferenced full-repository snapshots — worth a dedicated cleanup commit, separate from documentation, after confirming with whoever created them that they're no longer needed. |
| Root `docs/`, `architecture/`, `agents/`, `PRODUCT_SPECIFICATIONS/` in the **outer** repository (one level above `OPC/`) | An auto-synced mirror of this website's own copies. See the warning below — do not treat the outer mirror as a second source of truth. |

> ⚠️ **Repository maintenance warning — read before touching the outer repository root.**
>
> `OPC/cerebro-hive-website/` (this directory) is the **sole authoritative source** for CerebroHive documentation. The outer repository root's `docs/`, `architecture/`, `agents/`, and `PRODUCT_SPECIFICATIONS/` are a **generated mirror**, historically kept in sync by a scheduled automation (`chore(sync): auto-sync ... [scheduled]` commits, authored `Phil (Claude)`, most recently 2026-08-10 17:49 IST). As of this reorganization (2026-08-11/12) that automation could not be found active under any of the three mechanisms checked — Claude Code cloud routines (`RemoteTrigger` list: empty), Windows Scheduled Tasks (no matching task), and GitHub Actions (no matching scheduled workflow) — so its dormancy is *observed*, not *guaranteed permanent*.
>
> **Do not "fix" the divergence between the outer mirror and this website tree by copying the outer (now-stale) structure back over this one.** This website tree was reorganized on 2026-08-11/12 into the taxonomy documented on this page; the outer mirror was deliberately left in its old, pre-reorganization layout and was not part of that reorganization. If the sync automation resumes and starts overwriting the outer mirror with content copied *from* this tree, that is expected and harmless. If anything ever starts copying the outer mirror's structure *into* this tree, treat it as a bug and stop it — this tree is upstream, the outer mirror is downstream, never the reverse.

## ADR series quick reference

See [`architecture/decisions/README.md`](./architecture/decisions/README.md) for the full table. Six series, none renumbered: `platform-core` (0001–0006), `event-sourcing` (ADR-001–008), `eios-eda` (0001–0017), `eios-transition` (ADR-000–001), `engineering-review` (ADR-001–007), `hiveforge` (ADR-020–052).
