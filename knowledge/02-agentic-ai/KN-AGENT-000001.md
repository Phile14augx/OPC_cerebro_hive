# KN-AGENT-000001: Claude Conway — Always-On Persistent Background Agent Platform

```yaml
knowledge_id: "KN-AGENT-000001"
title: "Claude Conway — Always-On Persistent Background Agent Platform"
version: "1.0"

category: "agentic-ai"
subcategory: "agent-lifecycle"

source_video:
  video_id: "x2l7W9aTc5k"
  title: "Anthropic's New Claude CONWAY Is Unlike Any AI Before"
  url: "https://www.youtube.com/watch?v=x2l7W9aTc5k"
  publication_date: "2026-04-07"      # estimated

primary_sources:
  - type: blog
    url: "https://www.mindstudio.ai/blog/what-is-conway-agent-anthropic-always-on-background-ai"
    title: "What Is the Conway Agent? Anthropic's Unreleased Always-On Background AI Revealed in the Code Leak"
    authors: ["MindStudio"]
    date: "2026-04-09"
    accessed: "2026-08-14"
  - type: blog
    url: "https://dataconomy.com/2026/04/03/anthropic-tests-conway-platform-for-continuous-claude/"
    title: "Anthropic Tests Conway as a Persistent Agent Platform for Claude"
    authors: ["Dataconomy"]
    date: "2026-04-03"
    accessed: "2026-08-14"
  - type: blog
    url: "https://www.progressiverobot.com/2026/07/08/conway-ai-agent-final-v8/"
    title: "Conway AI agent: Anthropic's Always-On AI for Claude on iOS"
    authors: ["Progressive Robot"]
    date: "2026-07-08"
    accessed: "2026-08-14"
  - type: blog
    url: "https://www.ayautomate.com/blog/anthropic-conway-claude-always-on-agent-2026"
    title: "Anthropic Conway: Claude's Always-On Agent"
    authors: []
    date: "2026-UNKNOWN"
    accessed: "2026-08-14"

claim: >
  Conway is Anthropic's persistent, always-on background agent platform for Claude.
  Unlike standard Claude implementations that use a request-response pattern, Conway
  operates as a daemon process — a background service that runs continuously, responds
  to external event triggers (GitHub webhooks, push notifications, scheduled timers,
  public URL wakeup), and maintains stateful dedicated instances with their own settings,
  connectors, and extension ecosystem (.cnw.zip format). Conway integrates Claude Code
  execution, browser (Chrome) access, and a connectors panel exposing tools to external
  clients. An extension marketplace ecosystem is implied by the .cnw.zip format.

claim_type: REPORTED

# ── PROVENANCE ──────────────────────────────────────────────────────────────────
claim_provenance: INDEPENDENTLY_VERIFIED
# Confirmed across multiple independent sources (April 3 – July 8 2026) that all
# independently describe the same architecture from different vantage points
# (code leak analysis, Anthropic internal testing, iOS rollout). No single source
# has the complete picture; taken together they form a consistent architectural story.
# NOTE: No official Anthropic documentation exists as of 2026-08-14. Evidence grade C.

repo_gap_tag: MISSING
# Cerebro Nexarch has no equivalent always-on background agent platform.
# packages/agent-sdk provides agent primitives but no daemon execution model.
# services/swarm-runtime orchestrates agents but requires explicit dispatch.
# Neither supports event-subscription-based wake-up or stateful instance persistence
# across sessions in the manner Conway describes.

repo_mapping:
  packages:
    - "packages/agent-sdk"
  services:
    - "services/swarm-runtime"
    - "services/llm-gateway"
  apps:
    - "apps/twin-studio"
  gap_detail: >
    Conway architecture requires: (1) daemon execution model in swarm-runtime with
    persistent process state across sessions; (2) event subscription registry
    (webhooks, push, scheduled timers) that can wake a specific agent instance;
    (3) stateful instance store per-agent with dedicated settings; (4) extension
    packaging and installation system (.cnw.zip analogue); (5) public URL routing
    for external webhook delivery. None of these exist in current repo.

technical_mechanism: >
  Conway inverts the traditional prompt-response AI interaction model. Instead of
  requiring a user to initiate each interaction, Conway registers subscriptions to
  external event streams (GitHub PR/issue events, push notification services,
  scheduled cron-style triggers, or external webhook calls via public URL).
  When a subscribed event fires, the Conway instance wakes, receives the event
  payload as context, executes Claude with that context (potentially invoking
  Claude Code, browser tools, or connected external tools), and may deliver
  push notifications or webhook responses as output. The instance maintains
  persistent state across firings so accumulated context (prior events, decisions,
  work state) is available at each wake-up. Extensions packaged in .cnw.zip format
  add tool capabilities, UI tabs, and context handlers to a specific Conway instance.

problem_solved: >
  Eliminates the "user must always be present to prompt the agent" constraint.
  Enables agents that monitor, react, and act autonomously on behalf of users
  without continuous user engagement — the key enabler for enterprise workflow
  automation, continuous monitoring agents, and ambient intelligence scenarios.

architecture_pattern: "Event-Driven Persistent Agent"

implementation_requirements:
  - requirement: "Daemon process model for agent execution (not serverless / ephemeral)"
  - requirement: "Event subscription registry: webhook endpoints, GitHub event hooks, push channels, cron scheduler"
  - requirement: "Per-agent stateful instance store (durable across restarts; isolated per tenant)"
  - requirement: "Public URL routing layer for external webhook delivery to specific instances"
  - requirement: "Extension packaging system with install/uninstall lifecycle"
  - requirement: "Integrated tool access: code execution, browser, connected client tools"
  - requirement: "Push notification delivery from agent to user devices"
  - requirement: "Security model: each instance has scoped credentials; cross-instance isolation"

advantages:
  - "Enables autonomous monitoring without constant user prompting"
  - "Reduces latency on repetitive tasks — agent pre-processes events as they arrive"
  - "Creates foundation for ambient enterprise intelligence (always watching, always ready)"
  - "Extension ecosystem enables third-party tool distribution (platform business model)"
  - "Persistent state allows accumulation of context over time (episodic agent memory)"

limitations:
  - "Resource cost: persistent agents consume compute even when idle unless properly hibernated"
  - "Complex security posture: always-on access to systems requires stricter authorization"
  - "Multi-tenancy isolation is harder with stateful persistent processes"
  - "Extension ecosystem requires governance and vetting (supply chain risk)"
  - "Event storm risk: high-frequency webhooks could overload agents without throttling"
  - "No official Anthropic documentation as of 2026-08-14 — implementation details from code leak only"

risks:
  - "Unauthorized agent actions: persistent access without per-action user confirmation is a privilege escalation risk"
  - "Credential leakage: agent instances with stored credentials are high-value attack targets"
  - "Extension supply-chain attack: malicious .cnw.zip package installs unauthorized tools"
  - "Ghost agent: misconfigured always-on agent continues billing / acting after user intent changes"

maturity: EXPERIMENTAL
evidence_level: C
# Multiple independent confirmations of Anthropic testing, but no official docs.
# iOS deployment reported (July 2026) suggests moving toward GA. Grade C.

cerebro_relevance:
  products:
    - "CerebroAgent"
    - "HiveForge"
    - "HiveShield"
    - "HiveOps"
  eios_layers: [3, 6, 8]
  score: 9.2
  rationale: >
    Conway defines the emerging industry standard for persistent enterprise agent
    architecture. Cerebro Nexarch's CerebroAgent must evolve from dispatch-on-demand
    to always-on daemon execution to compete. The event subscription model (Layer 3),
    security implications of persistent access (Layer 6), and extension ecosystem
    (Layer 8/HiveForge) are all immediate architecture concerns. EIOS Layer 3 is the
    primary target; Layers 6 and 8 are secondary. This is a competitive signal:
    Anthropic is productizing exactly what Cerebro Nexarch plans to build.

scoring:
  technical_value: 9.0
  strategic_value: 9.5
  customer_value: 9.0
  revenue_potential: 8.5
  engineering_leverage: 8.0
  differentiation: 7.0       # Anthropic is building this too — differentiation is narrow
  evidence_strength: 6.5     # Grade C sources; no official docs
  technical_maturity: 6.0    # EXPERIMENTAL; iOS rollout but no GA docs
  implementation_ease: 4.0   # Significant engineering required (daemon model, event bus, stateful store)
  security_confidence: 5.0   # Persistent agent access introduces material security risk
  cerebro_priority_score: 74.5

priority: P1
horizon: EXPERIMENT
# High strategic importance but Anthropic hasn't shipped GA — experiment with core
# daemon-mode agent execution pattern in swarm-runtime before committing to full Conway parity.

recommended_action: >
  1. Architect daemon execution mode for services/swarm-runtime: agent instances that
     persist across sessions with serialized state (Temporal.io workflow-as-daemon pattern).
  2. Design event subscription registry: expose webhook endpoint per agent instance;
     integrate with NATS JetStream for internal event routing.
  3. Evaluate Temporal.io's "continue-as-new" workflow pattern as the persistence primitive —
     this is already in the Cerebro stack and may cover 80% of Conway's persistence model.
  4. Document security requirements for persistent agent access in HiveShield policy before
     any production deployment.
  5. Create EXP card for "Always-On Agent Prototype" targeting a single use case
     (e.g., GitHub PR monitor that auto-summarizes and notifies on new PRs).

related_components:
  - "services/swarm-runtime"
  - "packages/agent-sdk"
  - "services/llm-gateway"
  - "packages/hiveshield-policy"
  - "services/tool-gateway"

related_knowledge:
  - "KN-AGENT-000002"   # Event-driven trigger architecture (derived from Conway analysis)

discovered_at: "2026-08-14"
verified_at: "2026-08-14"
last_reviewed_at: "2026-08-14"
technology_version: "Conway (Anthropic, 2026 — EXPERIMENTAL)"
supersedes: ""
superseded_by: ""

validity_status: CURRENT
status: UNDERSTOOD
```

---

## Technical Extraction Notes (Phase 3 Pass B Working Document)

### FACTUAL CLAIMS
- Conway operates as a background daemon process, not a request-response session
- Triggers: GitHub repository subscriptions, push notification channels, scheduled timers, public URL wakeup
- Maintains "dedicated instances" with persistent settings pages
- Extension format: `.cnw.zip` — packages tools, UI tabs, context handlers
- Integrates: Claude Code execution, Chrome browser, Connectors panel exposing external tools
- Internal codename: "Lobster" during Anthropic testing phase
- iOS deployment confirmed as of July 8 2026

### ARCHITECTURES
- **Event-Subscription Agent**: instance registers interest in events → event fires → agent wakes → processes → delivers output → sleeps (low-cost idle state)
- **Extension Ecosystem**: .cnw.zip packages distributed to agent instances; analogous to browser extension model
- **Connector Registry**: tracks connected clients and exposed tools per instance

### CEREBRO NEXARCH RECOMMENDATIONS
- **swarm-runtime**: Add "always-on workflow" execution mode using Temporal.io continue-as-new. Each CerebroAgent gets a long-running workflow that can be woken by external events.
- **tool-gateway**: Add per-agent webhook endpoint generation; route incoming webhooks to the correct agent's event queue.
- **agent-sdk**: Add event subscription API: `agent.subscribe(eventSource, filter, handler)`.
- **hiveshield-policy**: Add "persistent agent" authorization tier — higher scrutiny required; explicit tenant approval.

---

## Cerebro Nexarch EIOS Mapping

| EIOS Layer | Impact | Component |
|-----------|--------|-----------|
| Layer 3 — Agent Runtime | PRIMARY | swarm-runtime, agent-sdk |
| Layer 6 — AI Safety & Security | HIGH | hiveshield-policy, tool-gateway |
| Layer 8 — Developer Platform | MEDIUM | HiveForge extension system |
| Layer 2 — AI Infrastructure | LOW | llm-gateway (always-on model access patterns) |
