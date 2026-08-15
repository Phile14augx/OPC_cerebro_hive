# TH-AI-0011 — Multi-Agent Topologies

**Knowledge Object ID:** TH-AI-0011  
**Classification:** E (AI Agents)  
**Priority:** P0  
**Status:** VERIFIED  
**Evidence Grade:** B (DeepLearning.AI agent patterns + Anthropic documentation)  
**Source Videos:** VID-009, VID-011  
**First Extracted:** 2026-08-14  
**Last Verified:** 2026-08-14

---

## Core Concept

Multi-agent systems can be organized in multiple topologies. Selecting the wrong topology wastes cost (unnecessary coordination overhead) or produces inferior quality (insufficient specialization). The topology must be chosen deliberately based on task characteristics.

---

## The Six Topologies

### 1. Sequential Pipeline
**Pattern:** Agent A → Agent B → Agent C → Output  
**Use when:** Each step strictly depends on the previous step's complete output.  
**Example:** Research → Draft → Edit → Format  
**Risks:** No parallelism; one slow agent blocks all downstream agents.  
**CerebroHive:** HiveAgents sequential chain configuration

### 2. Hierarchical (Manager-Specialist)
**Pattern:** Manager Agent → dispatches to → [Specialist A, Specialist B, Specialist C]  
**Use when:** Complex tasks with multiple independent sub-tasks that can be delegated.  
**Example:** Report generation: manager delegates to research agent, data analyst agent, writing agent.  
**Key design:** Manager must be capable of evaluating specialist outputs and handling failures.  
**CerebroHive:** CerebroAgent as manager + HiveAgents as specialists

### 3. Parallel (Fan-Out / Fan-In)
**Pattern:** Orchestrator → [Agent A, Agent B, Agent C simultaneously] → Aggregator  
**Use when:** Multiple independent research tasks or analyses that don't depend on each other.  
**Example:** Competitive intelligence gathering from multiple simultaneous sources.  
**Key design:** Aggregator must handle partial failures (some agents may fail or time out).  
**CerebroHive:** HiveAgents parallel execution + HiveOps aggregation

### 4. Routing (Triage-and-Dispatch)
**Pattern:** Triage Agent → classifies request → dispatches to → Correct Specialist  
**Use when:** Diverse request types require different specialist agents.  
**Example:** Customer support: billing queries → billing agent; technical issues → tech agent.  
**Key design:** Triage agent must handle ambiguous requests and unknown categories gracefully.  
**CerebroHive:** CerebroAgent routing layer + specialist HiveAgents

### 5. Asynchronous (Event-Driven)
**Pattern:** Producer Agent emits event → Queue → Consumer Agent subscribes  
**Use when:** Agents should not block waiting for responses; workflows span hours or days.  
**Example:** Document processing pipeline: ingestion agent → embedding agent → indexing agent.  
**CerebroHive:** HiveAutomation event queue + CerebroFlow workflow orchestration

### 6. Hybrid (Combination)
**Pattern:** Mix of the above topologies as task complexity demands.  
**Use when:** Real production systems almost always need a combination.  
**Example:** Routing → Parallel research → Sequential processing → Hierarchical synthesis.

---

## Topology Selection Guide

```
Single domain task?
  Yes → Single specialist agent (no multi-agent overhead)
  
Multiple independent sub-tasks?
  Yes → Parallel topology
  
Tasks strictly sequential?
  Yes → Sequential pipeline
  
Mixed request types coming in?
  Yes → Routing topology first
  
Complex hierarchical task decomposition needed?
  Yes → Hierarchical (Manager-Specialist)
  
Long-running, hours/days workflows?
  Yes → Asynchronous event-driven
  
Combination of the above?
  Yes → Hybrid
```

---

## Communication Protocols

**Synchronous:** Agent waits for response before proceeding. Use for short, time-sensitive operations.

**Asynchronous:** Agent publishes result to queue; downstream agent picks up when ready. Use for long operations, batch processing.

**Context Passing:** How information moves between agents:
- Full context handoff (expensive but complete)
- Summary handoff (cheaper, information loss risk)
- Structured schema handoff (recommended — defined data contracts between agents)

**CerebroHive standard:** Use structured schema handoff with Pydantic models for inter-agent data contracts.

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|---|---|---|
| Everything in one agent | Mediocre quality across all domains | Specialize (BP-AI-0002) |
| Unnecessary hierarchical overhead for simple tasks | Cost without benefit | Single agent for simple tasks |
| Synchronous communication for long tasks | Blocking and timeout failures | Async event-driven |
| Full context handoff every step | Exponential token cost growth | Structured schema handoff |
| No failure handling between agents | One failure kills entire pipeline | Define failure modes per agent boundary |

---

## Cerebro Nexarch Product Mapping

| Topology | Primary CerebroHive Component | Secondary |
|---|---|---|
| Sequential | HiveAgents pipeline | HiveAutomation |
| Hierarchical | CerebroAgent (manager) + HiveAgents | HiveOps (monitoring) |
| Parallel | HiveAgents parallel runtime | HiveOps (aggregation) |
| Routing | CerebroAgent (triage) | HiveAgents (specialists) |
| Asynchronous | HiveAutomation + CerebroFlow | HiveObservatory |
| Hybrid | All of the above | HiveGovern (coordination policies) |

---

## Related Knowledge Objects

- TH-AI-0003 (Six-Component Agent Architecture)
- TH-AI-0015 (Context Engineering — context passing between agents)

## Related Patterns

- AGENT-PATTERN-0001 (Hierarchical Multi-Agent — full spec)
- AGENT-PATTERN-0002 (Routing Specialist — full spec)
- AGENT-PATTERN-0004 (Sequential Agent Pipeline)
- AGENT-PATTERN-0005 (Parallel Research Agent Swarm)

## Related Best Practices

- BP-AI-0002 (Specialized Agents over Monolithic — P0)
- BP-AI-0003 (HITL for High-Impact Actions)
