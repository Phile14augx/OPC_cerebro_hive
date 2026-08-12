# CerebroSphere dashboard — first delivery slice

## Goal

Transform the existing authenticated `/dashboard` route into the first
CerebroSphere command-and-control experience: a focused executive view of
business KPIs, product health, agent activity, and system alerts.

## Scope

- Preserve the route's existing authentication redirect and account context.
- Replace the course-centric dashboard content with a responsive executive
  dashboard for a default CEO role.
- Model dashboard information with local, typed data and a small data-provider
  boundary so REST, GraphQL, and WebSocket sources can replace it later.
- Display four areas: headline KPIs, product health, recent agent activity, and
  prioritised alerts.
- Provide visible status and severity semantics that remain understandable
  without colour alone.

## Explicitly out of scope

- Multi-tenant persistence, RBAC enforcement, API endpoints, GraphQL,
  WebSocket streaming, semantic search, anomaly detection, and deployment
  infrastructure. These are separate roadmap increments and must not be
  simulated as production-ready capabilities.

## Architecture

`app/dashboard/page.tsx` remains the authenticated route shell. A dashboard
feature module owns typed view models, deterministic fixture data, a provider
function, and presentational sections. The route asks the provider for a
snapshot and passes it to sections; later transport implementations change the
provider only, not the UI contracts.

The initial role is CEO and is displayed as an intentional default. Role
selection is not included, preventing an unimplemented RBAC experience from
being implied.

## Data contracts

The snapshot contains:

- `kpis`: label, formatted value, trend direction, and comparison text.
- `products`: name, health state, availability percentage, and brief note.
- `activities`: agent name, action summary, timestamp, and state.
- `alerts`: title, explanatory text, severity, and whether it needs attention.

All fixture timestamps and values are deterministic so tests and visual
reviews do not depend on current time or random data.

## UI behaviour

While the existing authentication state is loading, retain its loading state.
Unauthenticated users are redirected as today. Authenticated users receive the
CerebroSphere snapshot. The design prioritises the actionable alert list and
current system state at narrow widths, while using a multi-column layout at
desktop sizes.

## Error handling

The initial local provider is synchronous and cannot fail. Its interface will
allow a future asynchronous implementation to surface a route-level fallback;
this slice introduces no pretend live-data error state.

## Testing

- Unit-test the snapshot provider's stable shape and its required data groups.
- Component-test that the dashboard renders the four command-center areas and
  semantic health and alert labels from a supplied snapshot.
- Run the targeted test suite, type check, and relevant lint checks after the
  implementation.

## Acceptance criteria

1. An authenticated visit to `/dashboard` presents CerebroSphere branding and
   all four information areas.
2. Dashboard content comes through typed contracts rather than being embedded
   throughout the route component.
3. Health and alert states are explicit text, not colour-only indicators.
4. Existing unauthenticated redirect behaviour remains intact.
5. Targeted tests and static checks pass.
