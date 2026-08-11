# Product Specification: HiveAgents™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 3 — AI Runtime  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveAgents™** is the production-grade autonomous agent runtime for the CerebroHive Intelligence Mesh. It provides the execution environment, orchestration framework, tool management, and safety infrastructure that every AI agent in the platform runs on — from the CerebroSearch answer synthesis agent to enterprise-specific custom agents built on the platform.

The distinction: HiveAgents is where agents *run*. HiveMemory is where they *remember*. HiveModels is where they *think*. HiveShield is what keeps them *safe*.

---

## 2. Agent Architecture

### Agent Anatomy
Every agent running on HiveAgents is defined by:

```yaml
agent:
  id: invoice-processor-v2
  name: "Invoice Processing Agent"
  version: "2.1.0"
  
  # Cognitive configuration
  model: "hive:reasoning:default"        # via HiveModels
  system_prompt: |
    You are an invoice processing agent...
  temperature: 0.05
  max_steps: 25
  
  # Tool manifest (what the agent is allowed to do)
  tools:
    - hive:storage:read                  # read files
    - hive:erp:ap:submit_invoice         # submit to AP
    - hive:erp:po:lookup                 # look up POs
    - hive:notify:email                  # send notifications
  
  # Memory configuration
  memory:
    episodic: true
    semantic: true
    namespace: "finance/invoice-processing"
  
  # Safety configuration
  scope:
    max_spend_per_task: 100              # token budget
    allowed_data_domains: ["finance"]
    human_approval_required_for:
      - "hive:erp:ap:submit_invoice"     # always confirm before posting
  
  # Resource constraints
  max_runtime_seconds: 300
  max_tool_calls: 50
```

### Agent Token
When an agent task starts, HiveIdentity issues a scoped ephemeral JWT (Agent Token) with:
- Exactly the tool scopes declared in the agent manifest — nothing more.
- The delegating human user's identity (who authorized this task).
- Task-specific expiry (max 1 hour by default, configurable).

The Agent Token is the agent's identity for all calls it makes during task execution. HiveGateway enforces the scopes on every tool call.

---

## 3. Core Capabilities

### 3.1 LangGraph State Engine
HiveAgents uses LangGraph as the agent orchestration framework:

- **Graph-based execution**: Agent task is a directed graph of states. Each state is a reasoning step or tool call.
- **Conditional edges**: Agent's output at each step determines the next state — true autonomous decision-making.
- **State persistence**: Full graph state (reasoning history, tool call results, intermediate outputs) persisted in PostgreSQL at each step. Agents are resumable after interruptions.
- **Human-in-the-loop nodes**: Designated graph nodes pause execution and present a decision to a human approver. Execution resumes only after approval.
- **Parallel execution**: Subgraph nodes run in parallel where dependencies allow (e.g., lookup multiple data sources simultaneously).

### 3.2 Tool Execution Framework
Every tool an agent can call is registered in the Tool Registry:

**Tool Registry**
- Each tool has: name, description, input schema (JSON Schema), output schema, required scope.
- LLM sees tool descriptions and schemas to understand how to call each tool.
- Tool calls are validated against schema before execution — malformed calls are rejected.

**Tool Categories**

| Category | Examples |
|---|---|
| Storage | Read/write files in HiveStorage |
| Data | Query HiveAnalytics, read HiveLake datasets |
| Search | Query CerebroSearch, HiveVector |
| Memory | Read/write HiveMemory |
| Communication | Send email, post to Slack, create calendar event |
| ERP | Read/write CerebroERP (AP, GL, inventory) |
| CRM | Read/write CerebroCRM (accounts, opportunities) |
| Code | Execute code in sandbox (Python, JS) |
| Web | Fetch web pages, call external APIs |
| Human | Request human input, create approval tasks |

**Tool Execution**
- Every tool call logged with: agent_id, task_id, tool_name, input, output, latency.
- Failed tool calls: agent receives error description and can retry or escalate.
- Tool call budget: enforced maximum number of tool calls per task to prevent runaway agents.

### 3.3 Multi-Agent Orchestration
HiveAgents supports hierarchical multi-agent patterns:

**Orchestrator-Worker Pattern**
```
Orchestrator Agent
  ├── "Research the vendor" → Research Agent (subtask)
  ├── "Analyze the contract" → Legal Analysis Agent (subtask)
  └── "Synthesize recommendation" → Orchestrator (uses subtask outputs)
```

- Orchestrator creates subtasks via the `hive:agents:spawn` tool.
- Each subtask runs as an independent agent with its own Agent Token and tool scope.
- Subtask outputs returned to orchestrator as structured objects.
- Subtask failures surfaced to orchestrator for handling (retry, fallback, escalate).

**Agent Communication**
- Agents communicate via structured task objects (not free-form messages).
- Shared context passed via HiveMemory shared namespaces (where authorized).

### 3.4 Human-in-the-Loop
Every agent can be configured with human approval gates:

**Approval Request**
```json
{
  "task_id": "task_abc123",
  "agent": "invoice-processor-v2",
  "action_requested": "Submit invoice INV-2026-0724 ($84,200) to AP",
  "context": {
    "invoice_number": "INV-2026-0724",
    "vendor": "AWS Inc.",
    "amount": 84200,
    "po_match": "PO-2026-0312 (matched, within 3% variance)",
    "recommendation": "Approve — validated match, within policy"
  },
  "expires_at": "2026-07-25T12:00:00Z"
}
```

- Approval requests routed to the appropriate human approver (configured per action type).
- Delivered via: HiveConsole queue, Slack notification, email.
- Timeout behavior: if not approved within configured window, action is auto-rejected and agent is notified.
- Full audit trail: who approved what, when, for which agent task.

### 3.5 Task Management
- Task creation: submit an agent task via API with input payload and optional callback URL.
- Task status: `pending → running → awaiting_approval → running → completed/failed`.
- Task streaming: subscribe to task progress events via WebSocket or SSE.
- Task cancellation: cancel a running task — agent performs cleanup before stopping.
- Task replay: re-run a completed task from beginning or from a specific step (for debugging).

### 3.6 Agent Evaluation & Improvement
- Task outcome logging: success/failure, human ratings on output quality.
- Agent performance metrics: success rate, average duration, tool call efficiency, human approval rate.
- Failure analysis: failed tasks analyzed for root cause (tool error, model confusion, scope violation, timeout).
- Regression testing: test suite of representative tasks run on every agent version change.

---

## 4. Built-in Platform Agents
HiveAgents ships with pre-built agents for common platform operations:

| Agent | Function |
|---|---|
| CerebroSearch Synthesis Agent | Synthesizes answers from retrieved documents for CerebroSearch |
| Data Quality Monitor Agent | Monitors HiveData pipelines, investigates quality drops |
| Compliance Evidence Agent | Collects and validates compliance evidence for CerebroCompliance |
| Incident Response Agent | First responder for HiveObservatory alerts — gathers context, drafts incident summary |
| Knowledge Extraction Agent | Extracts entities and relationships from documents for HiveKnowledge |
| Model Evaluation Agent | Orchestrates HiveEvaluation runs for newly deployed models |

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Orchestration Framework | LangGraph (state machine + graph execution) |
| State Persistence | PostgreSQL (task state, step history) |
| Tool Registry | Python (JSON Schema validation + tool dispatch) |
| Agent Token Issuance | HiveIdentity (ephemeral JWT generation) |
| Task Queue | Redis (pending task queue) |
| Streaming | WebSocket + SSE (task progress streaming) |
| Sandbox (code execution) | Firecracker microVMs (isolated code execution) |
| API | FastAPI (Python) |

---

## 6. SLAs

| Metric | Target |
|---|---|
| Task start latency (from submission to first step) | <5 seconds |
| Agent Token issuance latency | <100ms |
| Tool call dispatch latency | <50ms overhead |
| Human approval notification delivery | <30 seconds |
| Task state persistence (durability) | 99.9999% |
| Out-of-scope tool call block rate | 100% |

---

## 7. Roadmap

| Milestone | Timeline |
|---|---|
| Long-horizon planning (agents that execute plans spanning days with scheduled resumption) | Q4 2026 |
| Agent marketplace (pre-built agents installable by tenants from HiveMarketplace) | Q1 2027 |
| Agent simulation environment (test agent behavior against synthetic scenarios before production) | Q1 2027 |
| Collaborative multi-agent workspace (multiple agents sharing working memory on a joint task) | Q2 2027 |
