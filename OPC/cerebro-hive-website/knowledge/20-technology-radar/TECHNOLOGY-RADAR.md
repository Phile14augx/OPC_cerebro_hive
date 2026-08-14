# Cerebro Nexarch Technology Radar v1.0

**Date:** 2026-08-14  
**Status:** ACTIVE — 4 knowledge objects extracted, radar updated post-Phase-3-batch-1  
**Owner:** Chief AI Research Architect

---

## Radar Rings

| Ring | Definition |
|------|-----------|
| **ADOPT** | Production-ready and strategically useful. Use in new Cerebro projects. |
| **TRIAL** | Ready for controlled deployment. Run time-boxed pilots. |
| **ASSESS** | Requires technical evaluation before decision. |
| **HOLD** | Do not currently introduce new usage. Existing usage may continue. |

---

## Current Radar (Bootstrapped from Repository Forensics)

### ADOPT — Technologies already present in the Cerebro Nexarch codebase

| Technology | Category | Reason | Evidence |
|------------|----------|--------|----------|
| TypeScript | Engineering | Platform standard; all packages | Direct observation |
| React 19 + Next.js 16 | Engineering | Studio/frontend apps | Direct observation |
| Prisma + PostgreSQL 16 / pgvector | Data | ORM + vector storage | Direct observation |
| Temporal.io | Agent Runtime | Durable workflow execution | Direct observation |
| NATS JetStream | Infrastructure | Event bus | Direct observation |
| Fastify + NestJS | Backend | API services | Direct observation |
| Vitest / Playwright | Engineering | Test frameworks | Direct observation |
| Turbo (Turborepo) | Engineering | Monorepo build orchestration | Direct observation |
| Docker / docker-compose | Infrastructure | Container runtime | Direct observation |
| Kubernetes (k8s) + Helm | Infrastructure | Orchestration (infra/k8s) | Direct observation |
| ArgoCD | Infrastructure | GitOps delivery | Direct observation |
| Grafana + Prometheus | Observability | Metrics and dashboards | Direct observation |
| Redis | Infrastructure | Cache and pub/sub | Direct observation |

### TRIAL — Actively being developed, not yet production-stable

| Technology | Category | Reason | Evidence |
|------------|----------|--------|----------|
| LLM Gateway (services/llm-gateway) | AI Infrastructure | Model routing in development | Direct observation |
| Agent Runtime (packages/agent-sdk) | Agentic AI | CerebroAgent SDK in development | Direct observation |
| Knowledge Graph (packages/knowledge-graph-core) | Knowledge | Core package exists, not production | Direct observation |
| Swarm Runtime (services/swarm-runtime) | Agentic AI | Multi-agent swarm in development | Direct observation |
| EDA Platform (apps/eda-*) | AI Native Engineering | Engineering design automation | Direct observation |
| Model Router (services/router-service) | AI Infrastructure | Routing service in development | Direct observation |
| Reasoning Service | Agentic AI | packages/reasoning-sdk present | Direct observation |
| Memory Service | Agentic AI | services/memory-service present | Direct observation |
| Evaluation Service | AI Native Engineering | services/evaluation-service present | Direct observation |
| Governance API | Governance | services/governance-api present | Direct observation |
| **MCP (Model Context Protocol)** | AI Infrastructure | ↑ Promoted from ASSESS. Official Anthropic spec (2025-11-25), Apache 2.0, production-deployed in Claude Desktop. Eliminates N×M tool-adapter problem. Implement in tool-gateway (IMP-0002). See KN-INFRA-000001. | **A** — Official Anthropic open spec + production deployment |
| **Event-Driven Agent Architecture** | Agentic AI | ↑ Promoted from (new). Proven EDA pattern applied to LLM agents. Primitives (NATS JetStream, Temporal.io) already in Cerebro stack. Agent subscription registry is the missing wiring (IMP-0001). See KN-AGENT-000002. | **B** — Well-established EDA pattern; Anthropic Conway confirms LLM-agent application |
| **DeepSeek-R1** | Foundation Models | ↑ Promoted from (new). Open-source reasoning model (MIT); peer-reviewed Nature Vol 645 (2025); matches o1 on AIME/MATH-500/Codeforces; distilled variants 1.5B–70B. Integrate via API (api.deepseek.com/v1) + routing rule in router-service. Data sovereignty gate for enterprise tenants. See KN-FOUNDM-000001. | **A** — Peer-reviewed Nature paper; arXiv 2501.12948; open weights on GitHub |
| **Agent Memory Architecture (Tiered)** | Agentic AI | ↑ NEW → TRIAL. MemGPT (arXiv 2310.08560) + CoALA taxonomy (TMLR). services/memory-service in-memory only is P0 tech debt. Implement episodic + semantic tiers using pgvector (already in stack). See KN-AGENT-000004. | **A** — MemGPT peer-reviewed + commercially deployed (Letta) |
| **GraphRAG** | Knowledge Graphs | ↑ ASSESS → TRIAL. arXiv 2404.16130; MIT; 35K+ stars; substantial improvement over naive RAG on global sensemaking. packages/knowledge-graph-core is the integration target. Validate indexing cost via EXP-0003. See KN-KG-000001. | **B** — Strong primary sources; empirical vs naive RAG baseline |
| **Task-Type Model Routing** | AI Infrastructure | ↑ NEW → TRIAL (PROVISIONAL — validate via EXP-0002). Route PLANNING tasks → reasoning models (DeepSeek-R1 / o3-mini); GENERATION/CONVERSATION → standard LLMs. Est. 20–30% cost reduction. Data sovereignty gate required. See KN-INFRA-000002. | **B** — Component evidence A; routing policy estimate unvalidated |

### ASSESS — Identified from external intelligence, evaluation pending

| Technology | Category | Reason | Evidence |
|------------|----------|--------|----------|
| **Claude Conway (Always-On Agents)** | Agentic AI | Anthropic daemon-mode persistent agent platform. Event-driven triggers: GitHub webhooks, push notifications, cron timers, public URL wakeup. Internal codename "Lobster". No official Anthropic docs yet — code leak + testing reports only. Evaluate for CerebroAgent ambient intelligence pattern. See KN-AGENT-000001. | **C** — Code leak + independent testing reports (no official docs) |
| **A2A (Agent-to-Agent Protocol)** | Agentic AI | ↑ E → ASSESS. Google open protocol (2025-04-09). HTTP + SSE + JSON-RPC. 50+ enterprise partners at launch (Salesforce, SAP, ServiceNow). Complements MCP (MCP = tools; A2A = agent-to-agent). Evaluate after IMP-0002 (MCP) is live. See KN-AGENT-000003. | **A** — Official Google open-source release + enterprise adoption |
| **Prompt Injection Defense** | Security | ↑ NEW → ASSESS (P0 security — should be ADOPT immediately). OWASP LLM01:2025 + ICON paper (arXiv 2602.20708). Indirect injection is the primary agent security threat. Content trust marking + privilege minimization required before IMP-0001/IMP-0002 ship. See KN-SEC-000001. | **A** — OWASP LLM01:2025; ICON paper 0.4% ASR |
| Test-time Compute Scaling | Foundation Models | Inference-time reasoning improvement | E — requires primary-source verification |
| Vision-Language-Action Models | Robotics | VLA for embodied agents | E — requires primary-source verification |

### HOLD — Known risks or premature

| Technology | Category | Reason | Evidence |
|------------|----------|--------|----------|
| In-memory execution repository only | Agent Runtime | Known technical debt; no persistence across restarts | Direct observation (PROGRESS.md §3) |
| pnpm lockfile (stale importers) | Engineering | 10 stale importers blocking CI | Direct observation (PROGRESS.md) |

---

## Pending Radar Updates

Remaining ASSESS entries (A2A, GraphRAG, Test-time Compute, VLA) are pending Phase 3 primary-source verification. Videos covering these topics not yet located in channel inventory.

---

## Radar Update Log

| Date | Technology | Change | Reason |
|------|-----------|--------|--------|
| 2026-08-14 | All above | INITIALIZED | Repository forensics baseline |
| 2026-08-14 | MCP (Model Context Protocol) | ASSESS → TRIAL | KN-INFRA-000001: Evidence upgraded to A (official Anthropic open spec 2025-11-25 + production deployment in Claude Desktop). IMP-0002 created. |
| 2026-08-14 | DeepSeek-R1 | NEW → TRIAL | KN-FOUNDM-000001: Evidence A (peer-reviewed Nature Vol 645 2025; arXiv 2501.12948). MIT open weights. Priority integration via API + router-service routing rule. |
| 2026-08-14 | Event-Driven Agent Architecture | NEW → TRIAL | KN-AGENT-000002: Evidence B (proven EDA pattern; confirmed by Conway). NATS + Temporal.io primitives already in stack. IMP-0001 created. |
| 2026-08-14 | Claude Conway (Always-On Agents) | NEW → ASSESS | KN-AGENT-000001: Evidence C (code leak + testing reports only). Await official Anthropic documentation before promoting to TRIAL. |
| 2026-08-14 | Agent Memory Architecture (Tiered) | NEW → TRIAL | KN-AGENT-000004: Evidence A (MemGPT arXiv 2310.08560, TMLR CoALA). services/memory-service in-memory-only is P0 tech debt. pgvector already in stack. |
| 2026-08-14 | GraphRAG | ASSESS(E) → TRIAL | KN-KG-000001: Evidence B (arXiv 2404.16130, MIT, 35K+ stars). Promoted from E to B after primary source verification. Validate indexing cost before scaling. |
| 2026-08-14 | Task-Type Model Routing | NEW → TRIAL (PROVISIONAL) | KN-INFRA-000002: Evidence B (CEREBRO_RECOMMENDATION from KN-FOUNDM-000001). Run EXP-0002 to validate 20–30% cost reduction estimate. |
| 2026-08-14 | A2A (Agent-to-Agent Protocol) | E → ASSESS | KN-AGENT-000003: Evidence A (official Google open-source, 50+ enterprise partners). Promoted from E after primary source verification. Evaluate after MCP (IMP-0002) is live. |
| 2026-08-14 | Prompt Injection Defense | NEW → ASSESS | KN-SEC-000001: Evidence A (OWASP LLM01:2025 + ICON arXiv 2602.20708). P0 security requirement — implement content trust marking before IMP-0001/IMP-0002 ship. |
