# 0006: Capability Discovery

## Status
Accepted

## Context
Instead of hardcoding every new platform service into the Kernel, we need a dynamic registry where packages can announce their capabilities, dependencies, and health checks.

## Decision
We require all subsystems to define a `CapabilityManifest` (validated via Zod) and register with the `CapabilityRegistry`. The manifest explicitly declares `capabilitiesRequired` and `capabilitiesExposed`.

## Alternatives Considered
- **Static Imports**: Rejected because it prevents the OS from dynamically enabling/disabling features based on licensing or workspace configuration.
- **Microservices Service Mesh**: Rejected because CerebroHive is currently built as a modular monolith (monorepo).

## Consequences
- **Positive**: The Kernel can resolve capability dependency graphs at startup and gracefully degrade if a required capability is missing.
- **Negative**: Developers must maintain accurate manifests for their packages.

## Implementation Notes
- The `CapabilityManifest` schema is enforced in `@cerebro/architecture-core`.

## Related ADRs
- 0004: Dynamic Navigation Registry
