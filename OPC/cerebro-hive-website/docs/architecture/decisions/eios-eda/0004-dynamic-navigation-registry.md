# 0004: Dynamic Navigation Registry

## Status
Accepted

## Context
The Studio UI shell previously relied on hardcoded path-matching (e.g., `if (pathname.startsWith('/trust'))`) to render sidebars and sub-navigation. This approach scales poorly as we add dozen of platform services.

## Decision
We implemented a `NavigationRegistry` where modules (like Trust, Analytics, Evaluation) dynamically register their route configurations, sidebars, and activity bar icons.

## Alternatives Considered
- **Hardcoded Switch Statements**: Rejected as it causes the Shell component to become a massive dependency bottleneck.
- **File-system based navigation (Next.js layout.tsx only)**: Rejected because we need cross-cutting state (like the Activity Bar) that spans multiple route segments.

## Consequences
- **Positive**: The `StudioShell` is completely decoupled from individual application features.
- **Negative**: Requires a standard registration protocol that all frontend apps must conform to.

## Implementation Notes
- Implemented in `apps/studio/lib/navigation/registry.ts`.

## Related ADRs
- 0006: Capability Discovery
