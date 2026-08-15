# KN-AGENT-000004: Agent Memory Architectures — Tiered Memory for Persistent LLM Agents

```yaml
knowledge_id: "KN-AGENT-000004"
title: "Agent Memory Architectures — Tiered Memory Management for Persistent LLM Agents"
version: "1.0"

category: "agentic-ai"
subcategory: "agent-memory"

source_video:
  video_id: "NONE"
  title: "No @airevolutionx video located for this topic"
  url: ""
  publication_date: ""
  # NOTE: No specific @airevolutionx video was found covering agent memory architectures.
  # Knowledge object derived entirely from primary sources.

primary_sources:
  - type: arxiv
    url: "https://arxiv.org/abs/2310.08560"
    title: "MemGPT: Towards LLMs as Operating Systems"
    authors: ["Charles Packer", "Sarah Wooders", "Kevin Lin", "Vivian Fang",
              "Shishir G. Patil", "Ion Stoica", "Joseph E. Gonzalez"]
    date: "2023-10-12"
    accessed: "2026-08-14"
  - type: arxiv
    url: "https://arxiv.org/abs/2309.02427"
    title: "Cognitive Architectures for Language Agents (CoALA)"
    authors: ["Theodore R. Sumers", "Shunyu Yao", "Karthik Narasimhan", "Thomas L. Griffiths"]
    date: "2023-09-05"
    accessed: "2026-08-14"
  - type: paper
    url: "https://arxiv.org/abs/2502.12110"
    title: "A-MEM: Agentic Memory for LLM Agents"
    authors: ["A-MEM Research Team"]
    date: "2025-02"
    accessed: "2026-08-14"

claim: >
  LLM agents require explicit memory architectures because the context window is a
  fundamentally inadequate and ephemeral storage medium for long-running agent operation.
  The field has converged on a four-tier memory taxonomy (from CoALA, 2023):
  (1) In-context memory — working memory within the current context window (volatile);
  (2) External episodic memory — conversation history, past experiences, event logs
      (persistent, retrieved by semantic search);
  (3) External semantic memory — world knowledge, domain facts, document summaries
      (persistent, retrieved by similarity/graph search);
  (4) Procedural memory — skills and workflows the agent knows how to execute
      (encoded in system prompts or tool definitions).
  MemGPT (arXiv 2310.08560, 2023) demonstrated that OS-style tiered memory management
  (context window as RAM, external storage as disk, with explicit page-in/page-out
  functions) enables agents to handle tasks far exceeding context window limits and
  maintain persistent state across multi-session interactions.

claim_type: MEASURED
# MemGPT paper demonstrates measurable capability (extended context, multi-session continuity).
# CoALA taxonomy peer-reviewed at TMLR. Both are foundational references in the field.

# ── PROVENANCE ──────────────────────────────────────────────────────────────────
claim_provenance: INDEPENDENTLY_VERIFIED
# Primary sources: MemGPT paper (arXiv 2310.08560) + CoALA paper (arXiv 2309.02427).
# Both peer-reviewed; MemGPT commercially deployed as Letta (letta.ai).
# Evidence grade A.

repo_gap_tag: PARTIAL
# services/memory-service exists in the Cerebro Nexarch repository.
# This service is the right target for agent memory architecture implementation.
# Current status: memory-service is present but not production-ready
# (in TRIAL ring per PROGRESS.md repository forensics).
# 
# Known gaps in memory-service:
# - In-memory execution only: "No persistence across restarts" (HOLD ring PROGRESS.md entry).
#   This means memory-service currently provides only in-context (volatile) memory,
#   not any of the external persistent memory tiers.
# - No episodic memory store: no conversation history retrieval implemented.
# - No semantic memory store with TTL: IMP-PROPOSED-005 in previous weekly report noted
#   "Agent episodic memory with TTL in memory-service" as pending.
# - pgvector (already in stack) is the correct storage backend for memory embeddings.

repo_mapping:
  packages:
    - "packages/agent-sdk"
  services:
    - "services/memory-service"
    - "services/llm-gateway"
  apps: []
  gap_detail: >
    Implementation target: services/memory-service + packages/agent-sdk memory API.
    
    Tier 1 (in-context): already provided by agent-sdk context builder; no change needed.
    
    Tier 2 (episodic memory): implement conversation event log in PostgreSQL.
      Schema: (memory_id, agent_id, tenant_id, session_id, role, content, embedding, created_at, ttl)
      API: agent.memory.store(event) / agent.memory.search(query, k=5)
      Storage: pgvector for similarity search; PostgreSQL for structured queries.
    
    Tier 3 (semantic memory): implement document/fact store with embedding search.
      Schema: (memory_id, agent_id, tenant_id, content, source_ref, embedding, importance_score, ttl)
      API: agent.knowledge.store(fact) / agent.knowledge.search(query, k=10)
      Importance scoring: higher-importance memories replace lower-importance on eviction.
    
    Tier 4 (procedural): system prompt templates and tool definitions; managed by
      agent registry in swarm-runtime. No new infrastructure required.
    
    MemGPT-style memory management: add page-in/page-out functions to agent-sdk:
      agent.context.load(memory_ids) — bring memories into context window
      agent.context.evict(memory_ids) — push context segments to external memory
    
    TTL policy: configurable per-tenant memory retention (regulatory compliance).

technical_mechanism: >
  FOUR-TIER MEMORY MODEL (CoALA taxonomy applied to Cerebro):
  
  Tier 1 — In-Context Memory (Working Memory):
  The agent's current context window. Volatile: lost when the context ends.
  Capacity: model-dependent (GPT-4o: 128K tokens; DeepSeek-R1: 128K tokens).
  Use case: active task reasoning, current conversation turn.
  
  Tier 2 — Episodic Memory (Autobiographical):
  What happened in past sessions. Stored as timestamped event sequences.
  Retrieval: semantic similarity search over event embeddings.
  Example: "In session 3, the user mentioned their database uses PostgreSQL 16."
  Implementation: pgvector similarity search; recency weighting in ranking.
  TTL: configurable (30–365 days); enterprise compliance requirements dictate.
  
  Tier 3 — Semantic Memory (Factual Knowledge):
  World knowledge and domain facts the agent has learned or been told.
  Retrieval: similarity search; entity-based lookup; GraphRAG for complex queries.
  Example: "The Cerebro Nexarch codebase uses Temporal.io for durable workflows."
  Implementation: pgvector; optional integration with knowledge-graph-core (KN-KG-000001).
  Importance scoring: determines eviction priority when memory is pruned.
  
  Tier 4 — Procedural Memory (Skills):
  How to do things. Encoded as system prompt sections or tool definitions.
  Not retrieved at runtime — baked into agent configuration.
  Example: "When the user asks about billing, always use the invoice lookup tool."
  Implementation: agent registry in swarm-runtime; system prompt template management.
  
  MEMGPT MEMORY MANAGEMENT PATTERN:
  Context window = RAM; external storage = disk.
  Agent can invoke memory functions as tool calls:
    recall_memory(query) → retrieves relevant past events into context
    archive_memory(content) → pushes context segments to external storage
    core_memory_append(field, value) → updates always-present working memory slots
  This enables agents to handle tasks requiring more information than fits in context.

problem_solved: >
  Without persistent memory, every agent interaction starts from zero. The agent cannot:
  - Remember preferences from previous sessions
  - Accumulate knowledge over time
  - Maintain task state across multi-day or multi-session workflows
  - Learn from past mistakes or successes
  This severely limits agents to single-session tasks and makes Conway-style always-on
  agents (KN-AGENT-000001) impossible without memory architecture.

architecture_pattern: "Tiered Memory Architecture (OS-Inspired Virtual Context Management)"

implementation_requirements:
  - requirement: "Episodic memory store in services/memory-service: PostgreSQL + pgvector; schema with TTL"
  - requirement: "Semantic memory store: entity-aware knowledge base with importance scoring and eviction"
  - requirement: "agent-sdk memory API: agent.memory.store / agent.memory.search / agent.memory.evict"
  - requirement: "MemGPT-style page-in/page-out tool functions for memory-to-context transfer"
  - requirement: "Per-tenant TTL configuration for memory retention (compliance requirement)"
  - requirement: "Memory access authorization: agent can only read memories it wrote or was granted access to"
  - requirement: "Memory encryption at rest: sensitive episodic memories must be encrypted (HiveShield)"

advantages:
  - "pgvector already in stack: zero new storage infrastructure for memory embeddings"
  - "PostgreSQL already in stack (Prisma): memory schema adds to existing database"
  - "MemGPT commercially deployed as Letta — production-validated architecture"
  - "Enables always-on agents (KN-AGENT-000001) to remember context across event firings"
  - "CoALA taxonomy is peer-reviewed TMLR paper — solid academic foundation"
  - "Four-tier model maps cleanly to existing Cerebro services (memory-service, knowledge-graph-core)"

limitations:
  - "Memory retrieval latency adds to agent response time (semantic search per turn)"
  - "Memory privacy: episodic memories may contain PII — requires encryption + access controls"
  - "Importance scoring is heuristic — important memories may be incorrectly evicted"
  - "Memory poisoning: agent stores false information (via injection) that pollutes future sessions"
  - "Cross-tenant memory isolation: must be enforced at storage layer, not just application layer"

risks:
  - "Memory exfiltration: injection attack causes agent to retrieve and leak other users' memories"
  - "Memory poisoning: external content contains false facts that are stored as semantic memories"
  - "Runaway memory growth: agent in event-driven mode stores every event without TTL"
  - "Context overflow: too many memories paged in simultaneously; agent loses focus on task"

maturity: PRODUCTION
# MemGPT commercially deployed as Letta (letta.ai); widely used in production agent frameworks
# (LangGraph memory, AutoGen memory). The four-tier taxonomy is standard in the field.

evidence_level: A
# MemGPT: peer-reviewed + commercially deployed. CoALA: peer-reviewed TMLR.
# Both are primary sources with strong evidence. Evidence grade A.

cerebro_relevance:
  products:
    - "CerebroAgent"
    - "HiveForge"
    - "HiveOps"
  eios_layers: [3, 4]
  score: 9.0
  rationale: >
    Layer 3 (Agent Runtime): memory architecture is a foundational requirement for
    production-grade agents. The current Cerebro memory-service is in-memory only —
    this is P0 technical debt for any agent product. Layer 4 (Knowledge and Context):
    semantic memory connects agent-sdk to knowledge-graph-core and CerebroSearch.
    Without memory, CerebroAgent cannot deliver on ambient intelligence use cases
    (KN-AGENT-000001 Conway pattern). The infrastructure (pgvector, PostgreSQL) is
    already in the stack — this is a design and implementation task, not an
    infrastructure task.

scoring:
  technical_value: 9.5
  strategic_value: 9.0
  customer_value: 9.5    # persistent memory is a fundamental user expectation for AI assistants
  revenue_potential: 8.5
  engineering_leverage: 9.0   # pgvector + PostgreSQL already present; well-understood pattern
  differentiation: 7.5        # table stakes for serious agent products
  evidence_strength: 9.5      # A-grade: peer-reviewed + commercial deployment (Letta)
  technical_maturity: 9.0     # proven pattern; Letta/LangGraph in production
  implementation_ease: 6.5    # memory schema + agent-sdk API + TTL + authorization layer
  security_confidence: 7.0    # memory privacy and isolation require careful implementation
  cerebro_priority_score: 85.0

priority: P0
horizon: NOW
# P0: memory-service being in-memory only is identified in PROGRESS.md as a HOLD-ring
# technical debt item. No production agent can be delivered without persistent memory.
# pgvector is already deployed — this is a schema + API implementation task.
# Begin with episodic memory (Tier 2) as the highest-value tier for agent continuity.

recommended_action: >
  1. IMMEDIATE: Design Prisma schema for episodic memory in services/memory-service.
     Schema: AgentMemory table (id, agent_id, tenant_id, session_id, role, content,
     embedding Vector(1536), importance FLOAT, created_at, expires_at, memory_type ENUM)
  
  2. Add memory tool functions to packages/agent-sdk:
     recall_memory(query: string, k: number) → AgentMemory[]
     store_memory(content: string, type: 'episodic'|'semantic', importance: float)
     evict_memory(memory_ids: string[])
  
  3. Add to base agent system prompt: instructions on when to store and recall memories.
     "At the end of each session, store important facts and decisions to memory.
     At the start of each session, recall relevant past context before proceeding."
  
  4. TTL policy: default 90-day retention; configurable per tenant in governance-api.
     Compliance mode: 30-day max (GDPR-sensitive tenants).
  
  5. Security: memory access must be tenant-isolated at the database row level (Prisma
     middleware tenant filter). Encrypt episodic memories at rest (AES-256 via pgcrypto).
  
  6. Create IMP-MEMORY-001: Agent Persistent Memory Implementation.

related_components:
  - "services/memory-service"
  - "packages/agent-sdk"
  - "packages/knowledge-graph-core"

related_knowledge:
  - "KN-AGENT-000001"   # Conway always-on agents require persistent memory between event firings
  - "KN-KG-000001"      # GraphRAG enhances semantic memory retrieval for complex knowledge queries
  - "KN-SEC-000001"     # Memory poisoning is an indirect injection attack vector

discovered_at: "2026-08-14"
verified_at: "2026-08-14"
last_reviewed_at: "2026-08-14"
technology_version: "MemGPT (arXiv 2310.08560, 2023) / Letta; CoALA (arXiv 2309.02427, 2023)"
supersedes: ""
superseded_by: ""

validity_status: CURRENT
status: UNDERSTOOD
```
