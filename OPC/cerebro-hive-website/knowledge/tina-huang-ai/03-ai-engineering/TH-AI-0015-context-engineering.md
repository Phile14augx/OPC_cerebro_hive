# TH-AI-0015 — Context Engineering for AI Agents

**Knowledge Object ID:** TH-AI-0015  
**Classification:** A (Core AI) / E (AI Agents)  
**Priority:** P0  
**Status:** VERIFIED  
**Evidence Grade:** B (Authoritative primary source — LangChain research + Anthropic documentation)  
**Source Videos:** VID-011, VID-012  
**First Extracted:** 2026-08-14  
**Last Verified:** 2026-08-14

---

## Core Concept

**Context Engineering** is the discipline of constructing the optimal information environment for an LLM to complete a task. It supersedes "prompt engineering" as the primary quality lever for complex agents.

> "Context engineering is the art and science of filling the context window with exactly the right information at exactly the right time." — LangChain research

The shift: prompt engineering changes *what you ask*. Context engineering changes *what the model knows when it answers*.

---

## The Four Strategies

### Strategy 1: Writing Context
Persist information across agent steps and sessions. The agent actively writes state to memory stores.

**What to write:**
- Decisions made and their rationale
- Intermediate results
- Discovered facts and constraints
- User preferences and history

**CerebroHive Implementation:**
- HiveMemory session store (working/episodic)
- HiveKnowledge graph (semantic)
- Prompt & Tool Registry (procedural — updated prompts)

**Python Pattern:**
```python
class AgentState(TypedDict):
    messages: list[AnyMessage]
    scratchpad: str           # Working memory
    task_history: list[dict]  # Episodic memory
    user_profile: dict        # Semantic knowledge
    learned_procedures: list  # Procedural memory
```

### Strategy 2: Selecting Context (RAG)
Retrieve only what is relevant for the current task. Do not inject the entire knowledge base.

**Pipeline:**
```
Query → Embedding → Vector Search → Re-rank → Top-K Chunks → Inject
```

**Selection criteria:**
- Semantic similarity score ≥ threshold
- Recency weight for time-sensitive data
- Authority weight for high-stakes decisions
- Diversity sampling to avoid redundancy

**CerebroHive Implementation:**
- HiveVector for embedding storage
- HiveSemantic for semantic retrieval
- HiveKnowledge for structured knowledge retrieval

### Strategy 3: Compressing Context
Summarize and compress context when the window approaches capacity. Trigger at 60% usage (see BP-CE-0003).

**Three compression techniques:**
1. **Recursive summarization** — Summarize conversation turns into progressively shorter summaries
2. **Structured extraction** — Extract key decisions, open items, facts into structured format
3. **Sliding window** — Keep recent N turns verbatim, summarize older turns

**When NOT to compress:**
- Legal/compliance use cases requiring full audit trail
- Debugging sessions where exact message history matters

### Strategy 4: Isolating Context
Prevent context contamination between agents, users, and tenants.

**Isolation boundaries:**
- **Agent isolation:** Each agent gets only its required context
- **User isolation:** User A's data never appears in User B's context
- **Tenant isolation:** Enterprise Tenant A context never appears in Tenant B's agent
- **Tool isolation:** Tool call results scoped to the requesting agent only

**CerebroHive Implementation:**
- HiveMemory namespace isolation per tenant_id
- HiveGovern context policy enforcement
- HiveShield context injection detection

**CRITICAL SECURITY NOTE:** Cross-tenant context contamination is a catastrophic failure. Implement and test tenant isolation before any enterprise deployment. See BP-CE-0002.

---

## Context Format Standard

All agent context MUST use structured format (see BP-CE-0004):

```xml
<task_context>
  <user_request>{request}</user_request>
  <organizational_context>{org_context}</organizational_context>
  <retrieved_documents>{rag_results}</retrieved_documents>
  <conversation_history>{compressed_history}</conversation_history>
  <agent_state>{scratchpad}</agent_state>
  <constraints>{constraints}</constraints>
  <output_format>{format_spec}</output_format>
</task_context>
```

---

## Why Context > Prompt Engineering for Agents

| Dimension | Prompt Engineering | Context Engineering |
|---|---|---|
| Focus | Instruction quality | Information environment |
| Scope | Single LLM call | Multi-step agent runs |
| Failure mode addressed | Vague instructions | Wrong/missing information |
| Primary lever | Wording of task | What the model knows |
| Applicability | Simple tasks | Complex agents |

---

## Cerebro Nexarch Application Mapping

| Strategy | HiveForge Component | CerebroAgent Use |
|---|---|---|
| Writing Context | HiveMemory (session + long-term) | Persist agent state between steps |
| Selecting Context | HiveVector + HiveSemantic | RAG for enterprise knowledge |
| Compressing Context | HiveMemory summarization service | Manage long-running agent sessions |
| Isolating Context | HiveGovern + HiveShield | Multi-tenant enterprise deployment |

---

## Implementation Priority

- **IMP-001:** Context Engineering Framework for CerebroAgent (P0)
- **IMP-002:** Multi-Tenant Context Isolation for HiveMemory (P0)

---

## Related Knowledge Objects

- TH-AI-0003 (Six-Component Agent Architecture — Memory component)
- TH-AI-0011 (Multi-Agent Topologies — context passing between agents)
- TH-AI-0016 (LangChain research methodology)

## Related Patterns

- CONTEXT-PATTERN-0001 (Writing Context)
- CONTEXT-PATTERN-0002 (Selecting Context / RAG)
- CONTEXT-PATTERN-0003 (Compressing Context)
- CONTEXT-PATTERN-0004 (Isolating Context)

## Related Best Practices

- BP-CE-0001 (Context Engineering over Prompt Engineering)
- BP-CE-0002 (Context Isolation for Multi-Tenant — P0 SECURITY)
- BP-CE-0003 (Compress at 60% Window Usage)
- BP-CE-0004 (Structured Context Formatting)

---

## Hype Filter Assessment

**Claim:** "Context engineering is THE key to agent quality"  
**Assessment:** CREDIBLE — Consistent with Anthropic, LangChain, and OpenAI published guidance. Not marketing. The concept accurately identifies why many agent failures stem from poor information environment, not poor instructions.  
**Evidence Grade:** B
