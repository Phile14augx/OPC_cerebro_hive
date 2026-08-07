# Capability Workspace Routes

## Goal

Every item visible in the Studio application sidebar must resolve to a dedicated, useful, bookmarkable page instead of a 404 response.

## Scope

The affected sidebar groups are Workspace, AI Platform, Infrastructure, Data & Security, Talent OS, and Explore. Existing routes remain authoritative. Any sidebar URL without an existing dedicated page is served by the capability-workspace route.

## Architecture

Create a typed capability registry as the single source of truth for missing sidebar destinations. Each entry contains its canonical path, title, section, description, icon, operational metrics, primary action, and contextual quick links.

Add a constrained catch-all route beneath `/app` that resolves only registry entries. It renders a shared `CapabilityWorkspace` component; unknown paths call `notFound()`. Next.js static routes continue to win for already implemented pages, so there is no redirect or replacement of working functionality.

The shared workspace presents a page-specific header, status/metric cards, a primary action, and linked related capabilities. The page metadata derives from the same registry entry.

## Route Coverage

The registry covers every sidebar item shown in the supplied screenshots:

- Workspace: Organizations, Projects, Teams.
- AI: Studio, Agents, Workflows, Playground, Models, Prompt Library, Knowledge Hub, Vector Store.
- Infrastructure: Overview, Cloud, Deployments, Kubernetes, Databases, Storage, Networking, Edge, API Gateway.
- Data: Overview, Pipelines, ETL, Warehouse, Lakehouse, Analytics, BI.
- Security: Overview, IAM, Roles, Secrets, Audit Logs, Compliance, Policies.
- Talent: Hiring Pipeline, Candidates, Assessments, Assessment Builder, Question Bank.
- Explore: Marketplace, Templates, Industry Packs, Quantiva ERP, Custom Solutions.

When a listed URL already has a concrete route, the registry is not used for it.

## Error Handling and Safety

Registry lookups reject paths not explicitly listed, preserving real 404 behavior for typos and unauthorised destinations. The Secrets workspace displays only aggregated posture information and links; it never reads, renders, or exposes credential values.

## Verification

Add a route-coverage test that flattens visible sidebar navigation and asserts every href resolves either to an existing static page or a capability-registry entry. Add focused component tests for registry lookup, unknown-path rejection, and workspace rendering. Run Studio typecheck, targeted tests, lint, build, and `git diff --check`.

## Non-goals

This change does not invent backend resources, alter existing working pages, migrate navigation URLs, or deploy production changes.
