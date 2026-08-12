# Product Specification: HiveMemory™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** AI Runtime — Tier 3  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveMemory™** is the persistent, structured memory system for every autonomous agent in the CerebroHive Intelligence Mesh. It solves the fundamental limitation of LLM-based agents: context windows are finite, ephemeral, and expensive. Without persistent memory, every agent conversation starts from zero — no history, no learned preferences, no accumulated knowledge.

HiveMemory provides agents with three distinct memory types that mirror human cognitive architecture, enabling agents that genuinely learn from experience and improve over time.

---

## 2. Memory Architecture

### Three Memory Types

```
┌────────────────────────────────────────────────────────────┐
│                    Agent Working Context                   │
│         (active prompt context — finite, in-memory)        │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Memory Retrieval: relevant memories injected here  │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────┘
                           │ retrieve/store
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
  │  Episodic    │ │  Semantic    │ │  Procedural      │
  │  Memory      │ │  Memory      │ │  Memory          │
  │              │ │              │ │                  │
  │ "What        │ │ "What the    │ │ "How to do       │
  │  happened"   │ │  agent knows"│ │  things"         │
  │              │ │              │ │                  │
  │ Session logs │ │ Vectorized   │ │ Tool-use         │
  │ Action history│ │ facts, docs  │ │ patterns         │
  │ Conversation │ │ Entity data  │ │ Successful       │
  │ transcripts  │ │              │ │ strategy traces  │
  └──────────────┘ └──────────────┘ └──────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    HiveVector (storage)
                    HiveStorage (blobs)
```

### Episodic Memory
Stores the chronological record of what an agent has done:
- Every action taken (tool calls, API calls, decisions made)
- Every conversation turn (user messages, agent responses)
- Every task executed (start time, end time, outcome, artifacts produced)
- Indexed by time, agent ID, task ID, and associated entities

Episodic memory is the raw log from which semantic memory is distilled.

### Semantic Memory
The structured knowledge layer — what the agent has learned and retained as general knowledge:
- Facts extracted from episodic experiences (entity attributes, relationships, preferences)
- Document summaries and extracted entities from the knowledge corpus
- User preferences learned over interactions ("this user prefers bullet points over prose")
- Domain knowledge injected by administrators (product documentation, policy documents)

Semantic memory is stored as dense vectors (via HiveVector) for similarity-based retrieval, plus structured records in PostgreSQL for exact-match lookups.

### Procedural Memory
Stores learned strategies and tool-use patterns:
- Which tool sequence worked best for a given task type
- Which LLM prompting strategy produced highest-quality results for a specific domain
- Failure modes to avoid (recorded when a strategy led to a bad outcome)
- Reusable sub-plans ("to process an invoice: step 1 = extract fields, step 2 = validate against PO, step 3 = post to ERP")

---

## 3. Core Capabilities

### 3.1 Memory Retrieval
When an agent begins a task or conversation turn, HiveMemory retrieves relevant memories to inject into the working context:

**Retrieval Strategy**: Multi-stage pipeline:
1. **Recency Filter**: Most recent N episodic memories for the same task type (fast retrieval from PostgreSQL).
2. **Semantic Similarity**: Vector similarity search (HiveVector) over semantic memory using the current query/context as the query vector.
3. **Importance Scoring**: Each memory candidate is scored for relevance to the current task using a cross-encoder re-ranker.
4. **Context Budget Management**: Selects the highest-scoring memories that fit within the available context window budget (configurable token budget).

**Retrieval API** returns memories as structured objects that the agent runtime formats into the system prompt.

### 3.2 Memory Storage
Agents write to HiveMemory at configurable checkpoints:

- **During Task**: Key decisions, intermediate results, and tool outputs are written to episodic memory in real-time.
- **End of Turn**: Full conversation turn (input + output) written to episodic.
- **End of Task**: Task summary, outcome, and artifacts written to episodic; consolidation pipeline triggered asynchronously.

### 3.3 Memory Consolidation
The consolidation engine runs asynchronously, transforming episodic memories into compressed semantic memories:

**Compression**: Old episodic memories (>30 days by default) are summarized by a background LLM process. A week of daily task logs → a single "agent capability summary" entry in semantic memory. Original episodic memories are archived to HiveStorage Cold tier.

**Fact Extraction**: NLP pipeline extracts structured facts from episodic records:
- Entity mentions → semantic memory entity records
- User preferences → semantic memory preference records
- Learned patterns → procedural memory strategy records

**Deduplication**: New facts are compared against existing semantic memories. Contradicting facts trigger a resolution process (newer information takes precedence for time-sensitive facts; flagged for review otherwise).

### 3.4 Memory Access Control
Memory namespacing is strict:

- **Agent Namespace**: Each agent has a private memory namespace. By default, no agent can read another agent's memory.
- **Shared Memory Spaces**: Administrators can create shared memory namespaces accessible to a defined group of agents (e.g., all agents in the "finance" team share a common knowledge base).
- **User-Scoped Memory**: Memory of agent interactions with a specific user is readable by that user and their authorized agents only.
- **Memory Audit**: All memory read and write operations are logged to HiveGovern.

### 3.5 Memory Administration
Administrators can:
- **View Memory**: Inspect the memory contents of any agent (for debugging, compliance, or governance).
- **Edit Memory**: Correct factual errors or remove stale entries.
- **Wipe Memory**: Full or selective memory wipe (for GDPR right-to-erasure, agent retirement, or security incidents).
- **Export Memory**: Export memory as structured JSON for analysis or migration.
- **Set Decay Policies**: Configure per-namespace retention policies (how long memories persist before archival or deletion).

---

## 4. Memory Decay & Lifecycle

```
Write (episodic/semantic/procedural)
  │
  ▼
Active (hot storage — HiveVector/PostgreSQL)
  │ 30 days with no access
  ▼
Warm (compressed — semantic summaries, archive episodic)
  │ 90 days with no access
  ▼
Cold (HiveStorage Cold — archived, not indexed)
  │ Retention policy expires
  ▼
Deleted (with audit log entry)
```

Decay policies are configurable per agent and per tenant. Legal hold overrides decay policies.

---

## 5. API Surface

### Store Memory
```http
POST /v1/memory/{agent_id}/write
Authorization: Bearer {agent_token}

{
  "memory_type": "episodic",
  "content": "User requested invoice #INV-2026-0724 be processed urgently.",
  "entities": ["invoice:INV-2026-0724", "user:jane.doe@acme.com"],
  "task_id": "task_abc123",
  "importance": 0.85
}

→ 201 Created { "memory_id": "mem_xyz", "indexed_at": "2026-07-24T10:00:00Z" }
```

### Retrieve Memory
```http
POST /v1/memory/{agent_id}/retrieve
Authorization: Bearer {agent_token}

{
  "query": "previous interactions with Jane Doe about invoices",
  "memory_types": ["episodic", "semantic"],
  "top_k": 10,
  "token_budget": 2000
}

→ 200 OK
{
  "memories": [
    {
      "memory_id": "mem_abc",
      "type": "episodic",
      "content": "...",
      "relevance_score": 0.94,
      "created_at": "2026-07-20T09:30:00Z"
    }
    // ...
  ],
  "total_tokens": 1847
}
```

### Trigger Consolidation
```http
POST /v1/memory/{agent_id}/consolidate
Authorization: Bearer {admin_token}

{ "memory_types": ["episodic"], "older_than_days": 7 }

→ 202 Accepted { "job_id": "consol_job_xyz" }
```

---

## 6. Technology Stack

| Component | Technology |
|---|---|
| Vector Storage | pgvector (primary), Qdrant (high-throughput secondary) via HiveVector |
| Structured Storage | PostgreSQL (episodic log, entity records) |
| Working Memory Cache | Redis (TTL-based, context-window-sized cache per active agent session) |
| Consolidation Engine | Python + LangChain summarization chains |
| Fact Extraction | spaCy + custom NER models |
| Retrieval Re-ranker | MiniLM-L12 cross-encoder |
| API | FastAPI (Python) |

---

## 7. SLAs

| Metric | Target |
|---|---|
| Memory write latency P99 | <100ms |
| Memory retrieval latency P99 | <200ms (including re-ranking) |
| Context budget adherence | 100% (never exceeds configured token limit) |
| Memory durability | 99.9999% (six nines) |
| Consolidation job completion time | <30 minutes for 30 days of episodic history |
| Memory wipe propagation (GDPR) | <24 hours |

---

## 8. Roadmap

| Milestone | Timeline | Description |
|---|---|---|
| Cross-Agent Shared Memory | Q4 2026 | Governed shared memory namespaces with fine-grained ACL — agents can share learned knowledge without full memory access |
| Memory Distillation | Q1 2027 | Fine-tune a small model on an agent's accumulated episodic memory, embedding learned patterns directly into a model adapter rather than retrieving at runtime |
| Streaming Memory Updates | Q1 2027 | Real-time memory updates during agent execution (not just at checkpoints) with <10ms write latency |
| Memory Quality Scoring | Q2 2027 | Automated quality scoring of semantic memories (are they accurate? are they stale?) with flagging for human review |

---

## 9. Success KPIs

| KPI | Target | Frequency |
|---|---|---|
| Memory retrieval precision@5 | >85% (relevant memories retrieved) | Weekly (eval benchmark) |
| Context reconstruction accuracy | >90% (agent with memory vs. without on same task) | Monthly |
| Memory storage cost per agent per day | <$0.05 | Monthly |
| Consolidation success rate | >99% | Daily |
| Memory wipe SLA compliance | 100% (<24h) | Per-request |
