# Master Implementation Ledger

**Canonical.** One row per portfolio item. `Evidence` is the only completion field. Changing a row to a higher level requires an evidence pointer (PR, test command + result, route, migration, runbook, deploy URL). No evidence = not completed.

**Portfolio Baseline:** v1.0 — frozen 2026-08-15. Do not restage these levels without new merge evidence.  
**Scale:** L0 Concept · L1 Specified · L2 Scaffolded · L3 Functional · L4 Integrated · L5 Verified · L6 Operable · L7 Production  
**Cells:** Y = present and real · P = partial / in-memory / marketing / untested · N = missing · — = not applicable

Completion % is implemented acceptance dimensions / 11, not files written.

Wave 0 engineering IDs (not products): `KRN-SCOPE-001` W0.1 · `KRN-CI-001` W0.2 · `KRN-PERSIST-001` W0.3 · `KRN-AGENT-001` W0.4 · `KRN-VERIFY-001` W0.5. See [WAVE-0.md](./WAVE-0.md).

---

## A. Products (50)

### A1. AI Productivity Suite

| ID | Capability | Declared | Evidence | FE | API | DB | Agent | Auth | Tests | Deploy | Map | Blocker |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| PROD-001 | CerebroStudio | GA | L4 | Y | P | P | P | P | P | P | `apps/studio`, `apps/platform`, in-memory `CerebroStudioService` | persistence + honesty recovery |
| PROD-002 | CerebroAgent | Beta | L3 | P | P | P | Y | P | P | N | `packages/agent-sdk`, `services/swarm-runtime`, nexarch agents | tests + durable runtime |
| PROD-003 | CerebroFlow | GA | L3 | P | P | P | P | P | P | N | `apps/studio/app/platform/flow`, `services/workflow-api`, `packages/workflow` | persistence |
| PROD-004 | CerebroSearch | Beta | L2 | P | P | N | P | P | N | N | specs + knowledge/search packages; no dedicated search product app | retrieval stack |
| PROD-005 | CerebroArchive | Beta | L4 | Y | Y | P | P | P | P | P | `apps/archive-portal`, `services/archive-api`, `services/archive-worker` | tenancy + tests |
| PROD-006 | CerebroInsight | Beta | L2 | P | P | N | P | P | P | N | `platform/insight`; in-memory metrics / governed simulation | real analytics store |
| PROD-007 | CerebroLearn | Beta | L2 | P | N | N | N | P | N | N | marketing `cerebro-learn` + `/learn`; talent OS adjacent | product vs LMS split |
| PROD-008 | CerebroAssist | MVP | L2 | P | P | N | P | P | N | N | copilot/assist routes; not a standalone copilot product | shared assist runtime |

### A2. Enterprise Business Applications

All ten have `docs/specifications/products/*_spec.md`. Studio Company OS added org-scoped screens; that is **not** ten ERP/CRM/HR products.

| ID | Capability | Declared | Evidence | FE | API | DB | Agent | Auth | Tests | Deploy | Map | Blocker |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| PROD-009 | CerebroERP | MVP | L1 | N | N | N | N | N | N | N | spec only; Company OS is not ERP | kernel + data model |
| PROD-010 | CerebroCRM | MVP | L1 | N | N | N | N | N | N | N | spec only | kernel |
| PROD-011 | CerebroHR | MVP | L1 | N | N | N | N | N | N | N | spec only; Talent OS ≠ HR product | kernel |
| PROD-012 | CerebroFinance | MVP | L1 | N | N | N | N | N | N | N | spec only; FinOps page ≠ Finance | kernel |
| PROD-013 | CerebroProcurement | MVP | L1 | N | N | N | N | N | N | N | spec only | kernel |
| PROD-014 | CerebroProjects | MVP | L2 | P | P | P | N | P | N | N | Company OS projects screens only | not a Projects product |
| PROD-015 | CerebroAssets | MVP | L1 | N | N | N | N | N | N | N | `packages/asset-core` CMDB-shaped, unintegrated | kernel |
| PROD-016 | CerebroQuality | MVP | L1 | N | N | N | N | N | N | N | spec only | kernel |
| PROD-017 | CerebroCompliance | MVP | L1 | N | P | N | N | P | N | N | `packages/compliance-core`; no product UI | kernel + HiveGovern |
| PROD-018 | CerebroCustomer360 | MVP | L1 | N | N | N | N | N | N | N | spec only | HiveData/Lake |

### A3. Data & Intelligence

| ID | Capability | Declared | Evidence | FE | API | DB | Agent | Auth | Tests | Deploy | Map | Blocker |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| PROD-019 | HiveData | Beta | L2 | N | P | P | N | P | N | N | `packages/data-core` | platform data plane |
| PROD-020 | HiveLake | Beta | L1 | N | N | N | N | N | N | N | spec | lakehouse |
| PROD-021 | HiveAnalytics | MVP | L2 | P | P | N | N | P | N | N | platform analytics slices; M27 on disk | evidence store |
| PROD-022 | HiveKnowledge | MVP | L3 | P | Y | P | P | P | N | N | `services/knowledge-api`, `packages/knowledge-graph-core` | tests + persistence |
| PROD-023 | HiveSemantic | MVP | L2 | N | P | N | N | N | N | N | `packages/ontology-sdk` | graph integration |
| PROD-024 | HiveVector | GA | L2 | N | P | P | N | P | N | N | pgvector in stack; no product verification | retrieval E2E |
| PROD-025 | HiveObservatory | Beta | L2 | P | P | N | N | P | N | N | telemetry/observability packages; nexarch UI on JSON | real telemetry backend |

### A4. Infrastructure Platform

| ID | Capability | Declared | Evidence | FE | API | DB | Agent | Auth | Tests | Deploy | Map | Blocker |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| PROD-026 | HiveForge | Beta | L4 | Y | Y | P | P | P | P | P | `apps/forge`, `services/forge-api`, hiveforge pages | typecheck no-op; tests |
| PROD-027 | HiveOps | Beta | L3 | Y | P | P | N | P | N | N | `apps/studio/app/platform/hiveops` | live ops data |
| PROD-028 | HiveAPI | GA | L3 | P | Y | P | N | P | P | P | many Fastify/Nest services; not one API product | unified gateway |
| PROD-029 | HiveIdentity | GA | L2 | N | P | P | N | P | N | N | `packages/identity-core` (no scripts), `packages/auth` (no tests) | tests + tenancy E2E |
| PROD-030 | HiveShield | Beta | L2 | P | P | N | N | P | N | N | `packages/hiveshield-policy`, `/platform/shield` | policy runtime |
| PROD-031 | HiveStorage | GA | L2 | N | P | P | N | P | N | N | archive/eda storage packages | product boundary |
| PROD-032 | HiveCompute | GA | L2 | P | P | N | N | P | N | N | hiveforge/compute UI | scheduler |
| PROD-033 | HiveNetwork | GA | L1 | N | N | N | N | N | N | N | spec | not implemented as product |
| PROD-034 | HiveConsole | Beta | L2 | P | P | N | N | P | N | N | platform shell / nexarch | control-plane unity |
| PROD-035 | HiveGateway | GA | L3 | N | Y | P | Y | P | N | N | `packages/ai-gateway`, `services/llm-gateway` | tests |

### A5. AI Runtime & Platform

| ID | Capability | Declared | Evidence | FE | API | DB | Agent | Auth | Tests | Deploy | Map | Blocker |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| PROD-036 | HiveModels | Beta | L3 | N | Y | P | Y | P | N | N | llm-gateway ModelRegistry | eval + routing proof |
| PROD-037 | HiveAgents | Beta | L3 | P | P | P | Y | P | P | N | kernel-core, swarm-runtime, agent-os.json | overlapping runtimes |
| PROD-038 | HiveAutomation | MVP | L2 | P | P | N | P | P | N | N | overlaps Flow/workflow | consolidation |
| PROD-039 | HivePlanner | MVP | L2 | N | P | N | P | N | N | N | forge-api planner | runtime integration |
| PROD-040 | HiveReasoner | MVP | L3 | N | Y | N | Y | P | N | N | `services/reasoning-service` | tests + persistence |
| PROD-041 | HiveMemory | Beta | L3 | N | Y | P | Y | P | N | N | `services/memory-service`, `packages/memory-sdk`; InMemory repo | Postgres+pgvector |
| PROD-042 | HiveEvaluation | Beta | L3 | N | Y | P | P | P | N | N | `services/evaluation-api`, evaluation capability pkg | tests |

### A6. Ecosystem & Commerce

| ID | Capability | Declared | Evidence | FE | API | DB | Agent | Auth | Tests | Deploy | Map | Blocker |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|
| PROD-043 | HiveExchange | Research | L1 | N | N | N | N | N | N | N | spec | Wave 6 |
| PROD-044 | HiveMarketplace | Research | L2 | P | P | N | N | N | N | N | hiveforge/marketplace + marketplace-sdk | registry |
| PROD-045 | HiveBilling | Beta | L2 | P | P | N | N | P | N | N | hiveforge/billing | entitlements |
| PROD-046 | HiveLicense | Beta | L1 | N | N | N | N | N | N | N | spec | Wave 6 |
| PROD-047 | HivePartner | MVP | L1 | N | N | N | N | N | N | N | spec | Wave 6 |
| PROD-048 | HiveDeploy | Beta | L2 | P | P | N | N | P | N | N | hiveops deployment services; docker workflows | product vs infra |
| PROD-049 | HiveCloud | GA | L2 | P | P | N | N | P | N | N | `/platform/cloud`; FinOps worktree design-only | not a cloud product |
| PROD-050 | HiveGovern | Beta | L3 | P | Y | P | P | P | P | N | `packages/governance-core`, `services/governance-api`, `enterprise-control-plane` | production persistence |

### Product evidence histogram

| Level | Meaning | Count | IDs |
|---|---|---:|---|
| L7 | Production | 0 | — |
| L6 | Operable | 0 | — |
| L5 | Verified | 0 | — |
| L4 | Integrated | 3 | PROD-001, 005, 026 |
| L3 | Functional | 12 | 002, 003, 022, 027, 028, 035, 036, 037, 040, 041, 042, 050 |
| L2 | Scaffolded | 21 | 004, 006–008, 014, 019, 021, 023–025, 029–032, 034, 038, 039, 044, 045, 048, 049 |
| L1 | Specified | 14 | 009–013, 015–018, 020, 033, 043, 046, 047 |

### Catalogue collisions (not extra products)

These names exist in marketing or specs but are **not** additional ledger rows. Map them onto the 50 or onto OS/kernel:

| Name in repo | Disposition |
|---|---|
| CerebroSphere, HivePulse, CerebroX, CerebroCopilot, CerebroResearch | Marketing catalogue (`apps/studio/lib/data/products`) — 12-item tree, conflicts with 50-product registry |
| CerebroOS | Labs/vision docs; treat as Personal+Enterprise OS, not a 51st product |
| CerebroEDA, CerebroCyber | Specs exist; not in the 50. Do not start as new products. Fold EDA into developer platform; Cyber into HiveShield/Govern |
| TalentOS | Studio talent module, not a portfolio product |
| Twin Studio | `apps/twin-studio` — industry vertical on kernel, not a 51st product |
| Nexarch Command Center | `app/nexarch` — Enterprise OS control plane UI |

---

## B. Services (50)

Services are delivery packs, not codebases. Delivery-ready requires 17 artefacts. The canonical catalog (`docs/architecture/services-portfolio.md`) supplies ~8/17 in markdown (definition, buyer, outcome, deliverables list, methodology, duration, products, price). Studio ships **10** marketing service pages. `docs/03-services/` is a **competing 7-practice taxonomy** (~139 files); its case studies are marked `status: scaffold`.

**Counts:** 0 delivery-ready · 10 partially ready · 40 documentation-only

Partially ready = catalog row + a live marketing page in `apps/studio/lib/data/services/`.

| ID | Service | Category | Ready | Def | ICP | Method | Price | Marketing | SOW | Runbook | Ref impl | Case study | Gap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SA-01 | Enterprise AI Strategy | Advisory | Partial | Y | Y | Y | Y | Y (`ai-strategy`) | N | N | N | N | questionnaires, SOW, handover |
| SA-02 | AI Readiness Assessment | Advisory | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SA-03 | Departmental Transformation Roadmap | Advisory | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SA-04 | Intelligence Mesh Architecture | Advisory | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SA-05 | Data Strategy & Governance | Advisory | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SA-06 | AI Governance Framework | Advisory | Partial | Y | Y | Y | Y | Y (`ai-governance`) | N | N | N | N | pack |
| SA-07 | Responsible AI Advisory | Advisory | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SA-08 | AI CoE Design | Advisory | Partial | Y | Y | Y | Y | Y (`coe`) | N | N | N | N | pack |
| SA-09 | Executive AI Workshops | Advisory | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SA-10 | Digital Transformation Advisory | Advisory | Partial | Y | Y | Y | Y | Y (`autonomous-transformation`) | N | N | N | N | pack |
| EI-01 | Enterprise RAG Implementation | Engineering | Partial | Y | Y | Y | Y | Y (`knowledge-engineering`) | N | N | N | N | accelerator + ref impl |
| EI-02 | Knowledge Graph Engineering | Engineering | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| EI-03 | Custom AI Agent Development | Engineering | Partial | Y | Y | Y | Y | Y (`ai-factory`) | N | N | N | N | pack |
| EI-04 | Workflow Automation Engineering | Engineering | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| EI-05 | AI Platform Deployment | Engineering | Partial | Y | Y | Y | Y | Y (`ai-platform-engineering`) | N | N | N | N | pack |
| EI-06 | API Integration Services | Engineering | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| EI-07 | Data Engineering & ETL | Engineering | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| EI-08 | Enterprise Search Implementation | Engineering | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| EI-09 | Cloud Migration | Engineering | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| EI-10 | Legacy Modernization | Engineering | Partial | Y | Y | Y | Y | Y (`intelligence-modernization`) | N | N | N | N | pack |
| AO-01 | AgentOps | AI Ops | Partial | Y | Y | Y | Y | Y (`aiops`) | N | N | N | N | pack |
| AO-02 | MLOps | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-03 | LLMOps | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-04 | Prompt Engineering Services | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-05 | Model Fine-Tuning | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-06 | AI Evaluation & Benchmarking | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-07 | SRE for AI | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-08 | Observability Implementation | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-09 | FinOps for AI | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| AO-10 | AI Performance Optimization | AI Ops | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-01 | AI Security Assessment | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-02 | AI Red Teaming | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-03 | Compliance Automation | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-04 | Enterprise Risk Assessment | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-05 | Identity Modernization | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-06 | Zero Trust Implementation | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-07 | AI Governance Program | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-08 | Audit Automation | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-09 | Data Privacy Assessment | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| SG-10 | BCP for AI Systems | Security | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-01 | Healthcare | Industry | Partial | Y | Y | Y | Y | Y (`industry-accelerator`) | N | N | N | N | vertical pack; Twin Studio is code not a sales pack |
| IS-02 | Banking & FS | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-03 | Insurance | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-04 | Manufacturing | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-05 | Retail | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-06 | Supply Chain | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-07 | Government | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-08 | Education | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-09 | Energy | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |
| IS-10 | Telecommunications | Industry | Docs | Y | Y | Y | Y | N | N | N | N | N | pack |

Do **not** generate 50 service codebases. Industrialise packs in parallel with kernel work (WIP 5). Reuse products.

---

## C. Platform kernel (27)

| ID | Capability | Pri | Evidence | Package / service | Tests | Persist | HTTP | Blocker |
|---|---|---|---:|---|---|---|---|---|
| KRN-001 | Tenant / Org / Workspace | P0 | L3 | `identity-core/tenancy`, Company OS, `eda-tenancy` | N | P | P | unify tenancy model |
| KRN-002 | Identity / Authentication | P0 | L3 | `packages/auth` (JWT), `identity-core` | N | P | P | identity-core has no scripts |
| KRN-003 | RBAC / ABAC | P0 | L2 | `auth/rbac`, workflow `rbac-verification.yml` | N | P | P | enforcement proof |
| KRN-004 | Policy engine | P0 | L3 | `governance-core`, `policy-core`, `hiveshield-policy` | P | P | P | one engine |
| KRN-005 | Agent Registry & Versions | P0 | L3 | swarm-runtime registry, `data/agent-os.json`, capability-registry | P | P | P | JSON ≠ prod |
| KRN-006 | Agent Runtime | P0 | L3 | `kernel-core`, swarm-runtime, agent-runner; overlapping | P | P | P | pick one runtime |
| KRN-007 | Tool Registry | P0 | L2 | agent-builder ToolRegistry, plugins | N | N | P | sandbox binding |
| KRN-008 | Tool Execution Sandbox | P0 | L2 | forge/hiveforge sandbox mentions | N | N | N | real isolation |
| KRN-009 | LLM Gateway | P0 | L4 | `packages/ai-gateway`, `services/llm-gateway` | N | P | Y | tests |
| KRN-010 | Model Router | P0 | L3 | ai-gateway ModelRouter | N | P | P | eval coupling |
| KRN-011 | Workflow Engine | P0 | L3 | workflow-api, Temporal workers, `packages/workflow` | P | P | Y | product wiring |
| KRN-012 | Event Bus | P0 | L3 | `event-bus`, `events`, `core-bus` | N | P | P | one bus |
| KRN-013 | Scheduler | P0 | L2 | `kernel-core` scheduler (in-process) | N | N | N | durable scheduler |
| KRN-014 | Memory | P0 | L3 | memory-sdk, memory-service | N | P | Y | InMemory → Postgres |
| KRN-015 | Knowledge Graph | P0 | L3 | knowledge-api, knowledge-graph-core | N | P | Y | tests |
| KRN-016 | Vector / Retrieval | P0 | L2 | pgvector in Prisma stack | N | P | P | product E2E |
| KRN-017 | Storage | P0 | L2 | archive/eda storage | P | P | P | governed blob API |
| KRN-018 | Audit Log | P0 | L3 | governance-core AuditTrail, ECP AuditService | P | P | P | hash-chain in prod DB |
| KRN-019 | Evaluation framework | P0 | L3 | evaluation-api | N | P | Y | tests |
| KRN-020 | Approval / HITL | P0 | L3 | governance-core ApprovalService, `/nexarch/approvals` | P | P | P | durable store |
| KRN-021 | Observability | P0 | L2 | telemetry-* packages, nexarch observability | N | P | P | traces/metrics backend |
| KRN-022 | Cost / FinOps telemetry | P1 | L2 | hiveforge billing; FinOps worktree design-only | N | N | P | Wave 6 |
| KRN-023 | Notifications | P1 | L1 | notification center mentioned in Studio spec | N | N | N | after kernel P0 |
| KRN-024 | Connector SDK | P1 | L2 | connectors mentioned; no single SDK | N | N | N | after events |
| KRN-025 | Plugin SDK | P1 | L2 | `plugin-sdk`, `packages/plugins` | N | N | N | after runtime |
| KRN-026 | Billing / entitlements | P1 | L2 | hiveforge/billing UI | N | N | P | after identity |
| KRN-027 | Marketplace registry | P2 | L2 | marketplace page + sdk | N | N | P | Wave 6 |

**Kernel complete (L6/L7): 0/27. L4+: 1/27. L3+: 14/27.**

---

## D. Personal OS (12 primitives)

Personal OS is not a separate agent architecture. It is user-scoped profile of the same runtime. CerebroOS docs are Labs/vision. No `PersonalMemory` / `PersonalContext` types found as first-class modules.

| ID | Primitive | Evidence | Evidence note | Blocker |
|---|---|---:|---|---|
| OS-P-001 | Identity | L3 | shared auth | tenancy vs user |
| OS-P-002 | Personal Profile | L1 | not a dedicated model | specify on kernel identity |
| OS-P-003 | Preferences | L2 | `packages/experience` PreferenceService | user-scoped persistence |
| OS-P-004 | Personal Memory | L1 | HiveMemory is agent/org scoped | user partition |
| OS-P-005 | Knowledge | L2 | shared knowledge-api | ACL by user |
| OS-P-006 | Goals | L1 | nexarch missions are OS-level, not personal | profile |
| OS-P-007 | Plans | L1 | planner is product/runtime | profile |
| OS-P-008 | Tasks | L2 | Company OS tasks are organisational | user task graph |
| OS-P-009 | Personal Agent | L3 | shared agent runtime | user-scoped ACB |
| OS-P-010 | Tools | L2 | shared tool registry | personal connectors |
| OS-P-011 | Email / Calendar / Browser / Docs | L0 | not present | Wave 4 after kernel |
| OS-P-012 | Continuous learning | L0 | not present | evaluation loop |

**4/12 ≥ L2. 0 personal workflow E2E. Do not implement Personal OS as a new stack.**

---

## E. Enterprise Agentic OS (24 primitives)

Nexarch (`app/nexarch`, `packages/kernel-core`, `governance-core`, `runtime-core`, `memory-sdk`) plus `services/enterprise-control-plane` and Studio Company OS. Persistence for Nexarch is `data/agent-os.json` (ADR-002). That caps the whole profile at < L4 until Prisma.

| ID | Primitive | Evidence | Map | Blocker |
|---|---|---:|---|---|
| OS-E-001 | Agent as OS primitive | L3 | kernel-core ACB, ADR-001 | production store |
| OS-E-002 | Agent Registry | L3 | agent-os.json + swarm registry | unify |
| OS-E-003 | Scheduler | L2 | kernel-core scheduler | durable |
| OS-E-004 | Policy / Control | L3 | governance-core PolicyEngine | one engine |
| OS-E-005 | Risk | L2 | risk-engine | integrate |
| OS-E-006 | Approval | L3 | ApprovalService + nexarch UI | DB |
| OS-E-007 | AuditEvidence | L3 | AuditTrail | DB + hash chain |
| OS-E-008 | Budget / CostCenter | L2 | BudgetEnforcer | FinOps |
| OS-E-009 | Mission / Task | L3 | runtime-core; JSON store | DB |
| OS-E-010 | Delegation | L2 | kernel-core delegation | tests |
| OS-E-011 | Watchdog | L2 | kernel-core watchdog | tests |
| OS-E-012 | Tenant | L3 | identity + Company OS | unify |
| OS-E-013 | Organization | L2 | Company OS orgs | API honesty |
| OS-E-014 | Workspace | L2 | Company OS workspaces | API honesty |
| OS-E-015 | Department / BU | L1 | named in docs | model |
| OS-E-016 | Role | L2 | auth rbac | ABAC |
| OS-E-017 | AgentFleet | L2 | nexarch agents UI | runtime |
| OS-E-018 | Workflow / BusinessProcess | L3 | workflow-api / Temporal | product wiring |
| OS-E-019 | DigitalTwin | L3 | `apps/twin-studio` vertical slice | not the OS itself |
| OS-E-020 | KnowledgeGraph | L3 | knowledge-api | tests |
| OS-E-021 | Integration | L2 | connectors scattered | SDK |
| OS-E-022 | SLO | L1 | SLO workflows exist as YAML | not product SLOs |
| OS-E-023 | Enterprise control plane | L2 | `services/enterprise-control-plane` no tests | HTTP proof |
| OS-E-024 | Observability plane | L2 | nexarch observability on JSON | backend |

**11/24 ≥ L2. 4/24 ≥ L3 as an integrated OS (agent primitive, registry, mission, approval — all JSON-backed).**

---

## Evidence rule

A developer or agent may not set `status = COMPLETE`. Promote a row only with at least one of:

```text
PR / commit
test command + result
API endpoint
database migration
route
screenshot of real (not fabricated) UI
runbook
deployment URL
observability dashboard
security evidence
```
