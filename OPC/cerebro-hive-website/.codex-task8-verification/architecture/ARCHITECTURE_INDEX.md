# Architecture Taxonomy Index

This directory establishes the architectural governance and strategic direction for the **CerebroHive Enterprise Intelligence Operating System (EIOS)**.

## Governance Philosophy

CerebroHive is not a disjointed collection of AI applications. It is a 10-layer Enterprise Intelligence OS. All products, technical decisions, and operational runbooks must map back to this architectural taxonomy.

> **The vision drives the architecture. The architecture drives the implementation. The implementation drives the products.**

---

## Directory Structure

### `/architecture/manifesto`
The foundational North Star documents defining the EIOS philosophy, platform layers, and the 10-year roadmap.
- *Upcoming: `CEREBROHIVE_EIOS_MANIFESTO.md`*

### `/architecture/capabilities`
The capability model and product registries mapping individual products (like CerebroFlow, HiveOps) to their respective EIOS layers.
- *Migration target for `PRODUCT_REGISTRY.md` and `SERVICES_PORTFOLIO.md`*

### `/architecture/reference`
Technical Reference Architectures for specific layers of the EIOS stack, ensuring engineering teams build against standardized patterns (e.g., Runtime, Security, Data).

### `/architecture/adrs`
Architectural Decision Records (ADRs). Immutable records of significant engineering and architectural choices.
- *Upcoming: `ADR-000-Template.md`*
- *Upcoming: `ADR-001-EIOS-Architecture-Transition.md`*

---

## Legacy Strategy Documents
The following documents currently exist at the repository root and are slated for migration or deprecation as they are folded into the EIOS taxonomy during Phase P2:
- `CEREBROHIVE_CONSTITUTION.md` (Will be updated in P1)
- `COMMERCIAL_STRATEGY.md`
- `CAPABILITY_ARCHITECTURE.md`
- `PRODUCT_REGISTRY.md`
- `SERVICES_PORTFOLIO.md`
- `CEREBROHIVE-6-MONTH-MASTER-PLAN.md`
