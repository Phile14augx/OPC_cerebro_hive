# Phase 1 Plan 01 — Navigation Registry Status Audit

**Generated:** 2026-08-10
**Source:** `apps/studio/app/(platform)/app/navigation/index.ts` (99 items / 14 groups)
**Purpose:** Make every `active`/`planned` classification auditable rather than silent (D-06/D-15). Per-item rule applied, in order:

1. `active` — the href has a literal `page.tsx` in the App Router tree **and** that page renders data obtained from a real backend call (`fetch`, a `useForge*` hook, `forgeApi`, or an `/api/` route).
2. `planned` — everything else, including pages whose `page.tsx` exists but renders hardcoded/fabricated content (D-15).

Total: **9 active / 90 planned**.

## Judgment calls (flagged explicitly)

- **AI / AI Agents** (`/app/agents`) and **AI / AI Workflows** (`/app/workflows`) both have a literal `page.tsx` and call `fetch` indirectly via `useAgents`/`useWorkflows` → `@cerebro/sdk`'s `AgentClient`/`WorkflowClient`. However, both SDK clients are instantiated against a hardcoded `http://localhost:3000` with the source comment `// Mocked URL for now` (`apps/studio/src/hooks/useAgent.ts:4`, `apps/studio/src/hooks/useWorkflow.ts:4`) — there is no verified running backend at that URL (Studio itself runs on port 3401; no service in this repo listens on 3000). This differs from CerebroForge's 9 `active` items, which call `services/forge-api` on port 4005 — verified operational this session (D-02/D-03). Classified **planned**, consistent with the phase-wide finding that only `forge-api` is a confirmed-live backend this phase.
- **Data / Analytics** (`/app/analytics`) has a literal `page.tsx` but its only content is `redirect('/app/analytics/overview')` — a client-side redirect into a dashboard store (`useAnalyticsStore`), not a backend call. Classified **planned**.
- All other non-CerebroForge groups (Workspace, Solutions, Infrastructure, Security, Automation, Research, Academy, Business, Support, Talent OS, HiveOps) were checked for `fetch`/`useForge*`/`forgeApi`/`/api/` usage; none found. Classified **planned**.

## Registry Table

| Group | Item | Href | Status | Reason |
|---|---|---|---|---|
| Workspace | Dashboard | /app | planned | Static page, no backend call |
| Workspace | Organizations | /app/organizations | planned | No page.tsx |
| Workspace | Projects | /app/projects | planned | No page.tsx |
| Workspace | Teams | /app/teams | planned | No page.tsx |
| AI | AI Overview | /app/ai | planned | Static page, no backend call |
| AI | AI Studio | /app/ai/studio | planned | No page.tsx |
| AI | AI Agents | /app/agents | planned | Judgment call — fetch() targets an unconfigured "Mocked URL for now" (see above) |
| AI | AI Workflows | /app/workflows | planned | Judgment call — fetch() targets an unconfigured "Mocked URL for now" (see above) |
| AI | AI Playground | /app/playground | planned | Store-driven UI, no backend call found |
| AI | AI Models | /app/ai/models | planned | No page.tsx |
| AI | Prompt Library | /app/ai/prompts | planned | No page.tsx |
| AI | Knowledge Hub | /app/ai/knowledge | planned | No page.tsx |
| AI | Vector Store | /app/ai/vectors | planned | No page.tsx |
| Solutions | Marketplace | /app/marketplace | planned | No page.tsx |
| Solutions | Templates | /app/templates | planned | No page.tsx |
| Solutions | Industry Packs | /app/industry | planned | No page.tsx |
| Solutions | Quantiva ERP | /app/quantiva | planned | No page.tsx |
| Solutions | Custom Solutions | /app/custom | planned | No page.tsx |
| Infrastructure | Infra Overview | /app/infrastructure | planned | No page.tsx |
| Infrastructure | Cloud | /app/infrastructure/cloud | planned | No page.tsx |
| Infrastructure | Deployments | /app/infrastructure/deployments | planned | No page.tsx |
| Infrastructure | Kubernetes | /app/infrastructure/kubernetes | planned | No page.tsx |
| Infrastructure | Databases | /app/infrastructure/databases | planned | No page.tsx |
| Infrastructure | Storage | /app/infrastructure/storage | planned | No page.tsx |
| Infrastructure | Networking | /app/infrastructure/networking | planned | No page.tsx |
| Infrastructure | Edge | /app/infrastructure/edge | planned | No page.tsx |
| Infrastructure | API Gateway | /app/infrastructure/gateway | planned | No page.tsx |
| Data | Data Overview | /app/data | planned | No page.tsx |
| Data | Data Pipelines | /app/data/pipelines | planned | No page.tsx |
| Data | ETL | /app/data/etl | planned | No page.tsx |
| Data | Data Warehouse | /app/data/warehouse | planned | No page.tsx |
| Data | Lakehouse | /app/data/lakehouse | planned | No page.tsx |
| Data | Analytics | /app/analytics | planned | Judgment call — literal page.tsx only redirects to a store-driven dashboard, no backend call (see above) |
| Data | BI | /app/data/bi | planned | No page.tsx |
| Security | Security Overview | /app/trust/security | planned | Static page, no backend call |
| Security | IAM | /app/security/iam | planned | No page.tsx (no `security/` folder exists) |
| Security | Roles | /app/security/roles | planned | No page.tsx |
| Security | Secrets | /app/security/secrets | planned | No page.tsx |
| Security | Audit Logs | /app/trust/audit | planned | Static page, no backend call |
| Security | Compliance | /app/trust/compliance | planned | Static page, no backend call |
| Security | Policies | /app/trust/policies | planned | Static page, no backend call |
| Automation | Automation Overview | /app/automation | planned | No page.tsx |
| Automation | Workflow Builder | /app/automation/builder | planned | No page.tsx |
| Automation | Event Bus | /app/automation/events | planned | No page.tsx |
| Automation | Schedulers | /app/automation/schedulers | planned | No page.tsx |
| Automation | Integrations | /app/automation/integrations | planned | No page.tsx |
| Automation | Connectors | /app/automation/connectors | planned | No page.tsx |
| Research | Research Overview | /app/research | planned | No page.tsx |
| Research | AI News | /app/research/news | planned | No page.tsx |
| Research | Whitepapers | /app/research/whitepapers | planned | No page.tsx |
| Research | Benchmarks | /app/research/benchmarks | planned | No page.tsx |
| Research | Architecture | /app/research/architecture | planned | No page.tsx |
| Academy | Academy Overview | /app/academy | planned | No page.tsx |
| Academy | Courses | /app/academy/courses | planned | No page.tsx |
| Academy | Certifications | /app/academy/certifications | planned | No page.tsx |
| Academy | Labs | /app/academy/labs | planned | No page.tsx |
| Academy | Learning Paths | /app/academy/paths | planned | No page.tsx |
| Business | Business Overview | /app/business | planned | No page.tsx |
| Business | Billing | /app/business/billing | planned | No page.tsx |
| Business | Subscription | /app/business/subscription | planned | No page.tsx |
| Business | Usage | /app/business/usage | planned | No page.tsx |
| Business | Invoices | /app/business/invoices | planned | No page.tsx |
| Business | Licenses | /app/business/licenses | planned | No page.tsx |
| Support | AI Assistant | /app/support/assistant | planned | No page.tsx |
| Support | Help Center | /app/support/help | planned | No page.tsx |
| Support | Tickets | /app/support/tickets | planned | No page.tsx |
| Support | Community | /app/support/community | planned | No page.tsx |
| Support | Status | /app/support/status | planned | No page.tsx |
| Talent OS | Hiring Pipeline | /app/talent | planned | Static page, no backend call |
| Talent OS | Candidates | /app/talent/candidates | planned | Static page, no backend call |
| Talent OS | Assessments | /app/talent/assessments | planned | Directory exists but no literal page.tsx (only `[id]/page.tsx`) — confirmed 404 today |
| Talent OS | Assessment Builder | /app/talent/builder | planned | Static page, no backend call |
| Talent OS | Question Bank | /app/talent/questions | planned | No page.tsx |
| CerebroForge | Forge Overview | /app/forge | active | `useForgeProjects` + `forgeApi` (verified live, D-02/D-03) |
| CerebroForge | AI Planner | /app/forge/planner | active | `useForgeActions`/`useForgeProject` → `forge-api` `planner.controller.ts` |
| CerebroForge | Requirements Studio | /app/forge/requirements | active | `useForgeActions`/`useForgeProject` → `forge-api` `requirements.controller.ts` |
| CerebroForge | Architecture Studio | /app/forge/architect | active | `useForgeActions`/`useForgeProject` → `forge-api` `architect.controller.ts` |
| CerebroForge | UI/UX Studio | /app/forge/ui-studio | planned | No backend controller (D-03) |
| CerebroForge | Code Generation | /app/forge/codegen | active | `useCodegen`/`useForgeProject` → `forge-api` `codegen.controller.ts` (SSE) |
| CerebroForge | Backend Studio | /app/forge/backend | planned | No backend controller; existing page renders fabricated stats + `setTimeout` action (D-15, fake-data removal owned by 01-05/06) |
| CerebroForge | Database Studio | /app/forge/database | planned | No backend controller (D-03) |
| CerebroForge | API Studio | /app/forge/api | planned | No backend controller (D-03) |
| CerebroForge | Mobile Studio | /app/forge/mobile | planned | No backend controller (D-03) |
| CerebroForge | Web Studio | /app/forge/web | planned | No backend controller (D-03) |
| CerebroForge | Desktop Studio | /app/forge/desktop | planned | No backend controller (D-03) |
| CerebroForge | CerebroBots | /app/forge/bots | planned | No backend controller (D-03) |
| CerebroForge | Testing Intelligence | /app/forge/testing | active | `useForgeActions`/`useForgeProject` → `forge-api` `testing.controller.ts` |
| CerebroForge | AI Code Review | /app/forge/review | active | `useForgeActions`/`useForgeProject` → `forge-api` `review.controller.ts` |
| CerebroForge | Deployment Studio | /app/forge/deploy | active | `useForgeActions`/`useForgeProject` → `forge-api` `deploy.controller.ts` |
| CerebroForge | Repository Manager | /app/forge/repos | planned | No backend controller (D-03) |
| CerebroForge | AI Documentation | /app/forge/docs | active | `useForgeActions`/`useForgeProject` → `forge-api` `docs.controller.ts` |
| CerebroForge | Monitoring & Ops | /app/forge/monitoring | planned | No backend controller; existing page renders fabricated `StatCard`/alert data (D-15, fake-data removal owned by 01-05/06) |
| HiveOps | Overview | /app/hiveops | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |
| HiveOps | Pipelines | /app/hiveops/pipelines | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |
| HiveOps | Deployments | /app/hiveops/deployments | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |
| HiveOps | Security | /app/hiveops/security | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |
| HiveOps | AI Costs | /app/hiveops/costs | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |
| HiveOps | Clusters | /app/hiveops/clusters | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |
| HiveOps | GitOps | /app/hiveops/gitops | planned | Page exists but renders hardcoded arrays, zero backend calls (D-05) |

## Existing-but-fabricated pages demoted to `planned`

Two CerebroForge pages already have a `page.tsx` that renders fabricated content (D-15) rather than being a blank stub — both demoted to `planned` per the classification rule (an existing fake page is not `active`):

1. `forge/backend/page.tsx` — fabricated `generatedModules` array, fake `StatCard` metrics, and a `setTimeout`-backed "Generate Backend" button.
2. `forge/monitoring/page.tsx` — fabricated `StatCard`/alert data (per 01-PATTERNS.md's finding, not re-read line-by-line in this plan).

Actual removal of the fabricated content (replacing page bodies with `PlaceholderModule`) is FORGE-02 scope, owned by a later plan (01-05/01-06 per the phase objective) — this plan only sets the registry status field truthfully.

All 7 HiveOps pages fall into the same category (existing `page.tsx`, hardcoded arrays, zero backend calls) — demoted to `planned` per D-05, which explicitly names HiveOps as a placeholder group this phase.

## Corrections

No correction was required. Plan 01-07 Task 1's `read_first` specifically flagged `hiveops/security/page.tsx` as a candidate reclassification pending 01-06's verdict. Plan 01-06 (see `01-06-SUMMARY.md`, "Decisions Made") investigated the file's single `/api/`-shaped pattern-scan match and confirmed it was a false positive — a hardcoded literal string (`"apps/studio/app/api/auth/route.ts"`) inside a fabricated mock `FINDINGS` array entry, not a real backend call, `fetch(`, `useSWR`, `useQuery`, or other data-hook usage. `hiveops/security/page.tsx` was converted to the shared `PlaceholderModule` identically to its six HiveOps siblings, and its registry-table row above (`HiveOps | Security | /app/hiveops/security | planned | ...`) required no change. No other rows in this document were found to need correction during this plan's Task 1 review.
