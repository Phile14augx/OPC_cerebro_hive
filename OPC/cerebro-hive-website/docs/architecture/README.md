# Architecture

How the CerebroHive platform is built, and why. This is permanent documentation — it describes the system as it exists now, not a plan for future work (those live under [`../plans/`](../plans/README.md)).

## Core documents

| Document | Covers |
|---|---|
| [taxonomy-index.md](./taxonomy-index.md) | The 10-layer EIOS architecture taxonomy — start here |
| [manifesto.md](./manifesto.md) | The EIOS architecture manifesto |
| [long-term-roadmap.md](./long-term-roadmap.md) | Long-term architectural direction |
| [00-platform-foundation.md](./00-platform-foundation.md) | Platform foundation |
| [01-platform-vision.md](./01-platform-vision.md) / [01-ai-ecosystem.md](./01-ai-ecosystem.md) | Platform vision and AI ecosystem |
| [02-system-architecture.md](./02-system-architecture.md) | System architecture |
| [03-design-system.md](./03-design-system.md) | Design system (see also `design-tokens.md`, `design-components.md`, `design-motion.md`) |
| [04-engineering-standards.md](./04-engineering-standards.md) | Engineering standards summary — see [`../engineering/coding-standards.md`](../engineering/coding-standards.md) for the detailed conventions |
| [capability-model.md](./capability-model.md) | Enterprise capability architecture — dependency graph across all products |
| [product-registry.md](./product-registry.md) | Enterprise product registry (50 products) |
| [services-portfolio.md](./services-portfolio.md) | Enterprise services portfolio (50 services) |
| [commercial-strategy.md](./commercial-strategy.md) | Commercial editions and pricing philosophy |
| [ai-safety-architecture.md](./ai-safety-architecture.md) | AI safety architecture |
| [runtime-architecture.md](./runtime-architecture.md) | Runtime architecture |
| [PLATFORM-ARCHITECTURE.md](./PLATFORM-ARCHITECTURE.md) | Control plane vs generation/execution plane (Day 1 current state) |
| [EXECUTION-PLANE.md](./EXECUTION-PLANE.md) | Job states; what is wired vs refused |
| [PLUGIN-ARCHITECTURE.md](./PLUGIN-ARCHITECTURE.md) | Capability plugin and adapter contracts |
| [services/](./services/) | Per-service architecture notes (one file per backend service) |
| [measurements/](./measurements/) | Empirical measurements backing architecture claims (gate reports, mutation testing) |

## `assessments/`

Point-in-time architecture assessments, scope reconciliations, and governance findings (e.g. CerebroEDA blueprint/verification docs, HiveForge consolidation notes). These record the reasoning behind a change at the time it was made — read the core documents above for current state, and an assessment when you need the "why."

## `decisions/`

All Architecture Decision Records. See [decisions/README.md](./decisions/README.md).

## What doesn't belong here

- Work-in-progress implementation plans → [`../plans/`](../plans/README.md)
- Product/feature specifications → [`../specifications/`](../specifications/README.md)
- Subsystem-specific documentation (e.g. HiveForge) → [`../domains/`](../domains/README.md)
- Runbooks and operational procedures → [`../operations/`](../operations/README.md)
