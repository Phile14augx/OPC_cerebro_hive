# HiveForge

HiveForge is CerebroHive's control-plane platform for provisioning and operating infrastructure resources on behalf of tenants.

## Reading order

1. [00-foundation.md](./00-foundation.md) — foundational concepts
2. [01-domain-model.md](./01-domain-model.md) — domain model
3. [01-platform-architecture.md](./01-platform-architecture.md) — platform architecture
4. [02-service-catalog.md](./02-service-catalog.md) — service catalog
5. [03-control-plane.md](./03-control-plane.md) — control plane design
6. [04-provider-framework.md](./04-provider-framework.md) — provider abstraction framework
7. [05-business-platform.md](./05-business-platform.md) — business platform layer
8. [06-security.md](./06-security.md) — security model
9. [07-operations.md](./07-operations.md) — operations
10. [08-roadmap.md](./08-roadmap.md) — roadmap
11. [09-execution-lifecycle-runtime.md](./09-execution-lifecycle-runtime.md) — execution lifecycle runtime
12. [09-phase-retrospective.md](./09-phase-retrospective.md) — phase retrospective
13. [09g6-execution-e2e-verification.md](./09g6-execution-e2e-verification.md) — end-to-end verification record
14. [technical-debt.md](./technical-debt.md) — known technical debt

## Decision records

HiveForge's ADRs (ADR-020 through ADR-052) live under [`../../architecture/decisions/hiveforge/`](../../architecture/decisions/hiveforge/) alongside the repository's other ADR series, to avoid numbering collisions.

## Tooling

`hiveforge/tools/hiveforge_conformance_check.py` (in the repository root `hiveforge/` directory, not here) is a conformance-checking script, not documentation — it stays with the code it checks.
