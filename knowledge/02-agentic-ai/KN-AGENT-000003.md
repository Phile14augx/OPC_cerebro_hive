# KN-AGENT-000003: Agent2Agent (A2A) Protocol — Google's Multi-Agent Interoperability Standard

```yaml
knowledge_id: "KN-AGENT-000003"
title: "Agent2Agent (A2A) Protocol — Open Standard for Multi-Agent Communication"
version: "1.0"

category: "agentic-ai"
subcategory: "agent-communication"

source_video:
  video_id: "NONE"
  title: "No @airevolutionx video located for this topic"
  url: ""
  publication_date: ""
  # NOTE: No specific @airevolutionx video was found covering A2A protocol.
  # Knowledge object derived entirely from primary sources.

primary_sources:
  - type: blog
    url: "https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/"
    title: "A2A: A New Era of Agent Interoperability"
    authors: ["Google Developers"]
    date: "2025-04-09"
    accessed: "2026-08-14"
  - type: github
    url: "https://github.com/google/A2A"
    title: "A2A Protocol Official Repository (Google)"
    authors: ["Google", "Community"]
    date: "2025-04-09"
    accessed: "2026-08-14"
  - type: github
    url: "https://github.com/a2aproject/A2A"
    title: "A2A Protocol Community Specification Repository"
    authors: ["A2A Community"]
    date: "2025-04-09"
    accessed: "2026-08-14"
  - type: docs
    url: "https://a2a-protocol.org/latest/specification/"
    title: "A2A Protocol Specification (Latest)"
    authors: ["A2A Community"]
    date: "2025-ONGOING"
    accessed: "2026-08-14"

claim: >
  Agent2Agent (A2A) is an open protocol announced by Google on April 9, 2025, enabling
  AI agents built on different frameworks and by different vendors to communicate,
  delegate tasks, and coordinate actions securely. A2A uses HTTP, SSE, and JSON-RPC 2.0
  as transports. Agents advertise capabilities via structured "Agent Cards." Tasks have
  defined lifecycles (submitted → working → completed/failed/cancelled) and produce
  typed "artifacts" as outputs. A2A explicitly complements rather than replaces MCP:
  MCP connects agents to tools and data; A2A connects agents to other agents.
  Over 50 enterprise technology partners adopted A2A at launch, including Salesforce,
  ServiceNow, SAP, MongoDB, Cohere, LangChain, and major consulting firms.

claim_type: DEMONSTRATED
# Official Google announcement + live open-source specification + production partner adoption

# ── PROVENANCE ──────────────────────────────────────────────────────────────────
claim_provenance: INDEPENDENTLY_VERIFIED
# Primary source: Official Google Developers Blog (2025-04-09) + open-source GitHub
# repository + community specification at a2a-protocol.org. 50+ enterprise partner
# adoption confirmed in official announcement. Evidence grade A.

repo_gap_tag: MISSING
# No A2A protocol implementation found in services/swarm-runtime or packages/agent-sdk.
# Cerebro agents communicate via internal dispatch (NATS + Temporal.io) only.
# No external agent federation capability exists.
# Adding A2A server/client to swarm-runtime and agent-sdk would enable Cerebro agents
# to interoperate with external agents (LangChain, Salesforce Agentforce, etc.).

repo_mapping:
  packages:
    - "packages/agent-sdk"
  services:
    - "services/swarm-runtime"
    - "services/tool-gateway"
  apps: []
  gap_detail: >
    Two integration layers needed:
    (1) A2A Server: swarm-runtime exposes CerebroAgent instances as A2A-compatible
        remote agents. Incoming task delegation from external A2A clients received,
        authorized through HiveShield, executed by the agent instance.
    (2) A2A Client: agent-sdk includes A2A client so CerebroAgents can delegate
        subtasks to external A2A-compatible agents (Salesforce, SAP, etc.).
    Agent Card: each CerebroAgent publishes a signed Agent Card listing its
    capabilities, authentication requirements, and supported task types.

technical_mechanism: >
  A2A architecture:
  
  Agent Card: A JSON document advertised by each agent describing its capabilities,
  supported content types, authentication requirements, and connection endpoint.
  Clients discover agents by fetching their Agent Card before initiating communication.
  
  Transport: HTTP with JSON-RPC 2.0 message format. Three interaction modes:
  (1) Synchronous: client sends task, waits for immediate completion response.
  (2) Streaming: client subscribes to task via SSE (Server-Sent Events); agent
      pushes status updates and partial artifacts as they are produced.
  (3) Async push: agent completes task and pushes result to client-provided callback URL.
  
  Task lifecycle states: submitted → working → [input-required] → completed | failed | cancelled
  
  Messages contain typed "Parts": text, file (with MIME type), or structured data.
  Task outputs are "Artifacts" — named, typed payloads the client can consume.
  
  Authentication: OpenAPI-compatible authentication schemes (API keys, OAuth 2.0,
  mutual TLS). "Enterprise-grade authentication and authorization by default."
  
  Relationship to MCP:
  - MCP: agent ↔ tools/data (tool invocation, resource access)
  - A2A: agent ↔ agent (task delegation, collaborative multi-agent workflows)
  Both protocols can be used simultaneously in the same system.

problem_solved: >
  Eliminates the N×M problem for multi-agent systems: every agent framework (N) connecting
  to every other framework (M) required custom adapter code. A2A provides a universal
  agent communication interface analogous to what MCP does for tool connectivity.
  Enables "digital workforce" patterns: orchestrator agents delegating to specialist agents
  built by different teams, vendors, or companies — without point-to-point integrations.

architecture_pattern: "Multi-Agent Federation Protocol"

implementation_requirements:
  - requirement: "Implement A2A server endpoint in swarm-runtime: expose CerebroAgent instances as A2A remote agents"
  - requirement: "Publish Agent Card per registered agent: capabilities, auth scheme, endpoint URL"
  - requirement: "Implement A2A client in agent-sdk: allow CerebroAgents to delegate tasks to external A2A agents"
  - requirement: "Route all inbound A2A task delegations through HiveShield authorization (tenant and tool policy)"
  - requirement: "Log all A2A task delegations in governance-api audit trail"
  - requirement: "Support SSE streaming transport for long-running task delegation patterns"
  - requirement: "Implement Agent Card signing: cryptographically verify that advertised capabilities match agent registry"

advantages:
  - "50+ enterprise partners at launch: instant interoperability with Salesforce, SAP, ServiceNow agents"
  - "Complementary to MCP — both protocols work together, not in competition"
  - "Enables Cerebro multi-agent patterns: orchestrator→specialist delegation across tenants"
  - "Open protocol (Apache 2.0 equivalent): no vendor lock-in"
  - "Task lifecycle with artifacts aligns with Temporal.io workflow model already in stack"
  - "SSE streaming transport compatible with existing tool-gateway SSE implementation"

limitations:
  - "Specification still maturing (community-driven evolution post-initial Google release)"
  - "Agent Card trust: malicious agents can advertise false capabilities"
  - "Long-running task delegation requires durable task state — adds complexity to swarm-runtime"
  - "No native support for confidentiality of task content between federated agents"
  - "Cross-tenant agent delegation creates complex HiveShield policy surface"

risks:
  - "Prompt injection via A2A task payload: external agent sends malicious instructions as task content"
  - "Agent impersonation: unsigned Agent Cards allow capability spoofing"
  - "Cost amplification: orchestrator agent triggers chain of expensive external A2A agent calls"
  - "Data exfiltration: external A2A agent receives sensitive context via task delegation"

maturity: PRODUCTION
# Official Google open-source release + 50+ enterprise partner adoption.
# Community specification actively maintained. Production-ready for basic task delegation.

evidence_level: A
# Official Google Developers Blog announcement + open-source repository + public spec.
# Enterprise partner adoption independently confirmable.

cerebro_relevance:
  products:
    - "CerebroAgent"
    - "HiveForge"
    - "HiveShield"
  eios_layers: [3, 6, 8]
  score: 8.5
  rationale: >
    A2A is the inter-agent protocol that MCP is for tool connectivity: becoming an
    industry standard. Layer 3 (Agent Runtime): CerebroAgent orchestrators can delegate
    to specialist sub-agents built externally or by enterprise customers.
    Layer 6 (AI Safety): HiveShield must authorize inbound and outbound A2A delegations.
    Layer 8 (Enterprise Integration): enterprises with Salesforce/SAP/ServiceNow deployments
    expect A2A-native agent interoperability. Priority is slightly lower than MCP because
    Cerebro's immediate need is tool connectivity (MCP) before agent federation (A2A).

scoring:
  technical_value: 8.5
  strategic_value: 9.0
  customer_value: 8.5
  revenue_potential: 8.0
  engineering_leverage: 8.5   # complements MCP; same transport infrastructure (HTTP/SSE)
  differentiation: 7.5        # open standard = table stakes for enterprise AI platforms
  evidence_strength: 9.0      # A-grade: official Google open-source release + production adoption
  technical_maturity: 8.0     # production-ready; specification still community-evolving
  implementation_ease: 6.5    # requires Agent Card registry, HiveShield integration, task state
  security_confidence: 7.0    # enterprise auth model is good; cross-tenant delegation is complex
  cerebro_priority_score: 80.5

priority: P1
horizon: NEAR
# MCP (IMP-0002) is the immediate P1. A2A follows in the same horizon once MCP is live.
# Both share HTTP/SSE transport infrastructure — implementing MCP first de-risks A2A.

recommended_action: >
  1. After IMP-0002 (MCP) is live: design A2A server extension for swarm-runtime.
     Re-use HTTP/SSE transport infrastructure built for MCP where possible.
  
  2. Agent Card registry: add capability to agent registry (services/swarm-runtime)
     to generate and serve signed Agent Cards per registered CerebroAgent.
  
  3. HiveShield policy extension: add A2A delegation policies:
     - Which external A2A servers are allowlisted per tenant
     - What task content types are permitted to be sent externally
     - Outbound data classification gate (no PII/secrets in task payloads)
  
  4. Create IMP-0004: A2A Protocol Implementation in swarm-runtime.
  
  5. Pilot: integrate with one enterprise partner's A2A server (e.g. LangChain)
     to validate cross-framework task delegation end-to-end.

related_components:
  - "services/swarm-runtime"
  - "packages/agent-sdk"
  - "services/tool-gateway"
  - "packages/hiveshield-policy"

related_knowledge:
  - "KN-INFRA-000001"   # MCP — A2A complements MCP; implement MCP first
  - "KN-AGENT-000001"   # Conway always-on agents can delegate via A2A
  - "KN-AGENT-000002"   # Event-driven agents can be triggered by A2A task delegation
  - "KN-SEC-000001"     # Prompt injection risk in A2A task payloads

discovered_at: "2026-08-14"
verified_at: "2026-08-14"
last_reviewed_at: "2026-08-14"
technology_version: "A2A Protocol (google/A2A, a2a-protocol.org, announced 2025-04-09)"
supersedes: ""
superseded_by: ""

validity_status: CURRENT
status: UNDERSTOOD
```
