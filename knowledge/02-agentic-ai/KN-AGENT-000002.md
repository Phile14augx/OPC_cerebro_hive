# KN-AGENT-000002: Event-Driven Agent Trigger Architecture

```yaml
knowledge_id: "KN-AGENT-000002"
title: "Event-Driven Agent Trigger Architecture — Inverting the Prompt-Response Model"
version: "1.0"

category: "agentic-ai"
subcategory: "agent-lifecycle"

source_video:
  video_id: "x2l7W9aTc5k"
  title: "Anthropic's New Claude CONWAY Is Unlike Any AI Before"
  url: "https://www.youtube.com/watch?v=x2l7W9aTc5k"
  publication_date: "2026-04-07"      # estimated

primary_sources:
  - type: docs
    url: "https://www.anthropic.com/engineering/managed-agents"
    title: "Scaling Managed Agents: Decoupling the brain from the hands"
    authors: ["Anthropic Engineering"]
    date: "2025-UNKNOWN"
    accessed: "2026-08-14"
  - type: blog
    url: "https://ai2.work/blog/anthropic-s-conway-agent-signals-the-end-of-prompt-by-prompt-ai"
    title: "Anthropic's Conway Agent Signals the End of Prompt-by-Prompt AI"
    authors: []
    date: "2026-UNKNOWN"
    accessed: "2026-08-14"
  - type: blog
    url: "https://cryptobriefing.com/anthropic-conway-always-on-agent/"
    title: "Anthropic develops scheduled triggers for upcoming Conway agent"
    authors: []
    date: "2026-UNKNOWN"
    accessed: "2026-08-14"

claim: >
  The dominant AI agent interaction model — user types prompt → agent responds — is
  being superseded by event-driven agent architectures where agents register interest
  in external event streams and execute autonomously when events fire. Conway
  demonstrates this with four trigger types: (1) GitHub repository subscriptions,
  (2) push notification channels, (3) scheduled timers (cron-style), and
  (4) public URL webhook wakeup. This pattern enables "ambient agents" that act
  without explicit user initiation, fundamentally changing the security, billing,
  and UX model for AI systems.

claim_type: REPORTED

# ── PROVENANCE ──────────────────────────────────────────────────────────────────
claim_provenance: INDEPENDENTLY_VERIFIED
# Multiple independent sources confirm trigger types; the pattern itself is well-established
# in software engineering (event-driven architecture). The application to LLM agents
# is confirmed by Conway reports and Anthropic's managed agents documentation.

repo_gap_tag: PARTIAL
# NATS JetStream (already in stack) can serve as the event bus substrate.
# Temporal.io (already in stack) can implement scheduled triggers.
# BUT: no per-agent event subscription registry, no external webhook endpoint generation,
# no public URL routing for agent instances. The primitives exist; the agent-specific
# wiring does not.

repo_mapping:
  packages:
    - "packages/agent-sdk"
  services:
    - "services/swarm-runtime"
    - "services/tool-gateway"
  apps: []
  gap_detail: >
    NATS JetStream already handles event routing internally. Temporal.io already
    handles scheduled workflows. What's missing is: (1) a per-agent subscription
    registry that maps event topics to agent instance IDs; (2) external webhook
    ingress → NATS bridge; (3) agent-sdk API to declare event subscriptions.
    Estimated 2-3 weeks engineering to wire existing primitives into the pattern.

technical_mechanism: >
  An event-driven agent registers subscriptions at deploy time: "wake me when
  event type X arrives". A subscription registry maps event topic → agent instance ID.
  When an external event arrives (via webhook, push service, or scheduler), the event
  bus routes it to the correct agent instance's inbox. The agent runtime dequeues the
  event, builds a context window (event payload + agent state + relevant memory), calls
  the LLM, executes any resulting tool calls, and may emit response events or
  notifications. State is checkpointed to durable storage between firings.
  
  Implementation stack options:
  - Event bus: NATS JetStream (already in Cerebro stack) or Kafka
  - Scheduler: Temporal.io (already in stack) cron workflow or external cron → webhook
  - External ingress: API gateway route → NATS publish
  - Agent state: Redis or PostgreSQL (already in stack via Prisma)

problem_solved: >
  Removes the requirement for a human operator to be present and actively prompting
  an agent for useful work to happen. Enables continuous monitoring, reactive workflows,
  and proactive AI assistance — all critical for enterprise automation use cases.

architecture_pattern: "Event-Driven Agent (EDA + Agent Runtime)"

implementation_requirements:
  - requirement: "Event subscription registry: store (agent_id, event_topic, filter) tuples"
  - requirement: "External webhook ingress endpoint that authenticates and publishes to NATS"
  - requirement: "Scheduled trigger: Temporal.io cron workflow or cron→webhook gateway"
  - requirement: "Agent inbox: per-agent NATS subject or queue group for event delivery"
  - requirement: "Agent state persistence: checkpoint agent memory between event firings"
  - requirement: "Backpressure/throttling: rate-limit events per agent to prevent overload"
  - requirement: "Dead-letter queue: route failed event processing to review queue"

advantages:
  - "Enables continuous 24/7 monitoring without human-in-the-loop"
  - "Reduces agent operational cost: compute only when events arrive (not polling)"
  - "Composable: agents can subscribe to each other's output events (agent pipelines)"
  - "Existing Cerebro stack (NATS, Temporal.io) already provides 70% of needed primitives"

limitations:
  - "Event ordering: parallel events may require sequencing logic"
  - "Stateless per-event vs. stateful across-events: tradeoff in complexity"
  - "Debugging harder: no interactive prompt to reproduce failures"
  - "Security: external webhooks are unauthenticated ingress unless carefully controlled"

risks:
  - "Runaway agent: event loop triggers agent that produces events → triggers itself (cycle)"
  - "Privilege escalation: agent acting on unvalidated external webhook payload"
  - "Cost explosion: high-frequency external event source triggers expensive LLM calls"

maturity: PRODUCTION
# Event-driven architecture is production-proven in software engineering.
# Application to LLM agents is EXPERIMENTAL-to-PRODUCTION as of 2026.

evidence_level: B
# Event-driven architecture pattern is well-documented engineering knowledge.
# Application to LLM agents is confirmed by Anthropic (Conway) and general field practice.

cerebro_relevance:
  products:
    - "CerebroAgent"
    - "HiveOps"
    - "HiveForge"
  eios_layers: [3, 5, 6]
  score: 8.8
  rationale: >
    This is the architectural pattern that enables Cerebro Nexarch's CerebroAgent to
    operate as an enterprise ambient agent rather than a chatbot. Layer 3 (Agent Runtime)
    is the primary target. Layer 5 (Data Connectors) provides the event sources.
    Layer 6 (AI Safety) must govern what event sources agents can subscribe to.
    The Cerebro stack already has NATS JetStream and Temporal.io — this is a "wire
    existing primitives" engineering task, not a greenfield implementation.

scoring:
  technical_value: 8.5
  strategic_value: 9.0
  customer_value: 9.0
  revenue_potential: 8.5
  engineering_leverage: 9.0   # leverages existing NATS + Temporal.io investment
  differentiation: 7.5
  evidence_strength: 8.0      # B-grade evidence; well-established pattern
  technical_maturity: 8.0     # proven in software eng; EXPERIMENTAL for LLM agents
  implementation_ease: 6.5    # 2-3 weeks to wire existing primitives
  security_confidence: 6.0    # external webhook ingress requires careful validation
  cerebro_priority_score: 80.0

priority: P1
horizon: NOW
# Cerebro already has all required primitives (NATS, Temporal.io). This is a wiring
# and API design task. High ROI relative to implementation cost.

recommended_action: >
  Design and implement "Agent Subscriptions" feature in services/swarm-runtime:
  
  1. Schema: Add subscription table to PostgreSQL:
     (id, agent_id, tenant_id, event_topic, filter_expr, created_at, enabled)
  
  2. NATS routing: Add swarm-runtime consumer on wildcard topic agent.events.>
     that dispatches to correct agent instance based on subscription registry.
  
  3. Webhook ingress: Add POST /v1/webhooks/{agent_id}/{subscription_id} endpoint
     in tool-gateway; validate signature → publish to NATS topic agent.events.{agent_id}.
  
  4. Temporal.io cron: Add schedule_trigger workflow type that fires a NATS event
     on a cron schedule with agent context.
  
  5. agent-sdk API: agent.subscribe(eventSource: EventSource, filter: FilterExpr)
  
  Write IMP backlog item (IMP-0001) for this implementation.

related_components:
  - "services/swarm-runtime"
  - "packages/agent-sdk"
  - "services/tool-gateway"

related_knowledge:
  - "KN-AGENT-000001"   # Conway as the motivating example

discovered_at: "2026-08-14"
verified_at: "2026-08-14"
last_reviewed_at: "2026-08-14"
technology_version: "Event-Driven Architecture (EDA) pattern applied to LLM agents, 2026"
supersedes: ""
superseded_by: ""

validity_status: CURRENT
status: UNDERSTOOD
```

---

## Implementation Backlog Candidate

See `knowledge/19-implementation-backlog/IMP-0001.md` — Agent Subscription Registry.
