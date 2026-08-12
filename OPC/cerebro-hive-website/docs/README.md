# CerebroHive Documentation

CerebroHive is an AI-native enterprise engineering and transformation partner: an advisory + engineering practice, a portfolio of 50 SaaS products (the Cerebro/Hive families), and the EIOS (Enterprise Intelligence Operating System) platform those products run on. This page is the documentation homepage — it indexes permanent documentation (how the system works today), active implementation plans, and historical/archived material. See [`DOCUMENTATION-MAP.md`](./DOCUMENTATION-MAP.md) for the full tree with a one-line source-of-truth note per area, and [`documentation-guidelines.md`](./documentation-guidelines.md) for the rules this structure follows.

## Start here

- [Architecture taxonomy index](./architecture/taxonomy-index.md) — the 10-layer EIOS architecture, the canonical "start here" for how the platform is built
- [Company handbook](./company-handbook/README.md) — how CerebroHive operates, builds, and serves clients
- Repository root `README.md`, `CODEBASE.md`, `PROGRESS.md`, `CURRENT-SPRINT.md` — environment setup, codebase map, and live project/sprint state (kept at the repository root, not under `docs/`, since tooling and multiple AI agents read them there)

## Architecture — [`architecture/`](./architecture/README.md)

Permanent documentation of how the platform is built: system architecture, capability model, product/services registries, design system, and all [Architecture Decision Records](./architecture/decisions/README.md).

## Domains — [`domains/`](./domains/README.md)

Documentation for individual subsystems, e.g. [HiveForge](./domains/hiveforge/README.md).

## Specifications — [`specifications/`](./specifications/README.md)

Per-product specs ([`specifications/products/`](./specifications/products/)) and per-feature design specs ([`specifications/features/`](./specifications/features/)).

## Engineering — [`engineering/`](./engineering/README.md)

Coding standards and the database/Prisma setup guide.

## Operations — [`operations/`](./operations/README.md)

Infrastructure setup, disaster recovery, and runbooks.

## Project execution

- [Active plans](./plans/README.md#currently-active) — work being executed now
- Completed plans — `plans/completed/`
- [Reviews](./reviews/README.md) — audits, gap assessments, handoff notes

## Archive — [`archive/`](./archive/README.md)

Superseded and historical documentation, kept for reference.

## For contributors and AI agents

- Persistent agent instructions live at the repository root (`AGENTS.md`) and stay there so tooling can discover them.
- Live multi-agent coordination state (`agents/CLAUDE-TASKS.md`, `agents/CODEX-TASKS.md`, `agents/GEMINI-TASKS.md`, `agents/CURRENT-SPRINT.md`, root `PROGRESS.md`) is actively read/written by multiple AI agents and intentionally was **not** moved during the documentation reorganization — check there for current task assignments before starting work.
- When you finish a plan, move it from `plans/active/` to `plans/completed/` in the same change.
- When a document is superseded, don't delete it — move it to `archive/superseded/` with an `> Status: Archived` header pointing to its replacement (see [documentation-guidelines.md](./documentation-guidelines.md)).

---

## CerebroHive — Full Offering Index

> Living documentation for all services, products, and solutions offered by CerebroHive.
> Last updated: June 2026

The section below is the pre-existing offering index for the marketing/services content catalog (`01-company-foundation/` through `12-thought-leadership/`, plus `academy/`, `blog/`, `whitepapers/`, etc.) — kept as-is; it is heavily cross-referenced from within that catalog.

---

## Quick Reference

### Services (5)
Consulting and delivery engagements — human expertise + AI tooling delivered as a project or retainer.

| # | Service | Starting From | Route |
|---|---|---|---|
| 1 | AI Consulting & Strategy | $8,000/engagement | `/services/ai-consulting` |
| 2 | AI Automation & Agents | $12,000/project | `/services/ai-automation` |
| 3 | Data & ETL Engineering | $15,000/project | `/services/data-engineering` |
| 4 | Corporate AI Education | $5,000/workshop | `/services/corporate-training` |
| 5 | Custom AI Development | $30,000/project | `/services/ai-development` |

---

### Products (5)
Proprietary SaaS software built and operated by CerebroHive.

| # | Product | Status | Route |
|---|---|---|---|
| 1 | CerebroFlow — AI Automation Suite | **GA Live** | `/products/cerebroflow` |
| 2 | CerebroAgent — Autonomous Agent Network | **Beta** | `/products/cerebroagent` |
| 3 | CerebroLearn — AI Learning Management | **Early Access** | `/products/cerebrolearn` |
| 4 | CerebroERP — AI-Enhanced ERP | **Coming Soon** | `/products/cerebroerp` |
| 5 | CerebroOS — Enterprise AI OS | **Labs** | `/products/cerebroos` |

---

### Solutions (7)
Pre-built agent blueprints for specific business functions, deployable in 6-10 weeks.

| # | Solution | Business Function | Route |
|---|---|---|---|
| 1 | Customer Support AI | Operations | `/solutions/customer-support-ai` |
| 2 | Sales Automation | Revenue | `/solutions/sales-automation` |
| 3 | Marketing Automation | Growth | `/solutions/marketing-automation` |
| 4 | Knowledge Management | Strategy | `/solutions/knowledge-management` |
| 5 | HR & Recruitment Automation | HR Ops | `/solutions/hr-automation` |
| 6 | Finance Automation | Finance | `/solutions/finance-automation` |
| 7 | ERP AI Integration | Enterprise IT | `/solutions/erp-automation` |

---

## Documentation Files

| File | Contents |
|---|---|
| [services.md](./services.md) | All 5 services — deliverables, process, stack, pricing |
| [products.md](./products.md) | All 5 products — features, architecture, use cases, pricing |
| [solutions.md](./solutions.md) | All 7 solutions — metrics, agent flows, integrations, ICP |
| [CerebHive_Products_services_Solutions.md](./CerebHive_Products_services_Solutions.md) | Master combined document — 10 services, 5 products, 7 solutions, engagement models, and tech stack |
| [ENTERPRISE-VISION.md](./ENTERPRISE-VISION.md) | Long-term "Enterprise AI OS" positioning (50 products / 50 services) — **vision only, not current offering** |

---

## Cross-Reference: Services vs Products vs Solutions

| Buying Motion | Description | Timeline | Who Buys |
|---|---|---|---|
| **Service** | We do it for you, customised to your context | 4–24 weeks | CTO, VP Engineering, Head of Ops |
| **Product** | You use our software, we provide the platform | Immediate to 3 months | IT, RevOps, L&D Managers |
| **Solution** | Pre-built agent blueprint, we deploy + hand over | 6–10 weeks | COO, CMO, CFO, CHRO |

---

## Frequently Combined Packages

### "AI Launchpad" (Most Popular)
- AI Consulting & Strategy (scoping)
- 1–2 Solutions deployed (e.g. Support AI + Sales Automation)
- Corporate AI Education (team enablement)
- CerebroLearn (ongoing L&D platform)

### "Data-First AI"
- Data & ETL Engineering (foundation)
- Knowledge Management Solution
- CerebroFlow (automation pipelines on top of the data)

### "Enterprise Transformation"
- AI Consulting & Strategy
- Custom AI Development (proprietary model)
- ERP AI Integration
- CerebroAgent (persistent monitoring)
- CerebroOS waitlist

---

## Contact & Enquiries

- **General:** hello@cerebro-hive.com
- **Enterprise Sales:** enterprise@cerebro-hive.com
- **Partnerships:** partners@cerebro-hive.com
- **Book a consultation:** [/contact](/contact)
