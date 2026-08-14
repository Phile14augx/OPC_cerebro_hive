# CEREBRO-NEXARCH-AI-PATTERN-LIBRARY.md
# Reusable AI Architecture Patterns
# Cerebro Nexarch Pvt Ltd — Knowledge Engineering Division

**Version:** 1.0  
**Source:** Tina Huang AI Knowledge Base (Phase 1 Baseline) + Verified Primary Sources  
**Status:** LIVING DOCUMENT  
**Date:** 2026-08-14

---

## OVERVIEW

This library contains vendor-neutral, reusable patterns for AI agent architecture, automation, prompting, and context engineering. Every pattern is extracted from observed implementations and abstracted to remain valid regardless of which specific tool is in use at any time.

**Pattern Types:**
- `AGENT-PATTERN` — Reusable agent architecture patterns
- `WORKFLOW-PATTERN` — Reusable AI workflow patterns
- `AUTOMATION-PATTERN` — Trigger-action automation patterns
- `PROMPT-PATTERN` — Reusable prompting strategies
- `CONTEXT-PATTERN` — Context engineering patterns
- `ARCH-PATTERN` — System architecture patterns

---

## AGENT PATTERNS

---

### AGENT-PATTERN-0001: Hierarchical Multi-Agent System

**Source:** TH-AI-0001, TH-AI-0011 | **Evidence Grade:** B | **Status:** CURRENT

**Name:** Hierarchical Multi-Agent System (Manager–Specialist)

**Problem:**
Complex enterprise tasks require diverse capabilities that no single agent handles well. A monolithic agent produces lower-quality results and is harder to debug, update, and scale.

**Agent Role:**
A Manager Agent receives the top-level task, decomposes it, delegates to Specialist Agents, aggregates results, and produces the final output.

**Inputs:**
- High-level task description
- Relevant organizational context
- Available specialist agent registry

**Context:**
- Organizational policy (system prompt layer)
- Task specification
- Specialist agent capabilities list

**Memory:**
- Working memory: task decomposition plan
- Episodic memory: completed subtask results
- Persistent: specialist routing rules

**Tools:**
- Agent dispatch (call specialist agents)
- Result aggregation
- State management

**Planning:**
```
Manager receives task
    ↓
Decompose into subtasks
    ↓
Map subtasks to specialists
    ↓
Build execution DAG
    ↓
Execute in dependency order
```

**Reasoning:**
Manager LLM reasons over task requirements, specialist capabilities, and dependency constraints to produce an optimal execution plan.

**Execution Loop:**
```
WHILE tasks remain in DAG:
    SELECT next ready task (all dependencies met)
    DISPATCH to specialist agent
    AWAIT result
    UPDATE task state
    CHECK for new dependency unlocks
END
```

**Validation:**
Manager validates specialist outputs against task requirements before proceeding or aggregating.

**Human Approval:**
Trigger human review when: specialist output confidence is low, task impact exceeds threshold, error rate on subtasks exceeds 20%.

**Error Recovery:**
- Retry failed subtasks up to N times
- Escalate to human if retry limit exceeded
- Log failure patterns for future routing improvement

**Security Boundaries:**
- Each specialist agent has scoped permissions
- Manager cannot exceed its own permission set
- Context isolation: specialists cannot read each other's state by default

**Observability:**
Log: task decomposition, specialist dispatches, subtask results, aggregation steps, total latency, total cost

**Evaluation:**
- End-task completion rate
- Subtask success rate per specialist type
- Human escalation rate
- Cost per completed task

**Suitable Cerebro Applications:**
- CerebroAgent enterprise workflow automation
- CerebroResearch multi-step research tasks
- HiveForge agent-driven software development
- CerebroERP multi-department automation

**Implementation Notes:**
- Use HiveAgents for specialist registry
- Use HivePlanner for DAG construction
- Use HiveMemory for inter-agent state

**Sources:** TH-AI-0001 (Tina Huang, Feb 2025), DeepLearning.AI Agent Design Patterns, Anthropic Multi-Agent Research

---

### AGENT-PATTERN-0002: Routing Specialist Agent

**Source:** TH-AI-0005 | **Evidence Grade:** B | **Status:** CURRENT

**Name:** Routing Specialist Agent (Triage-and-Delegate)

**Problem:**
Enterprise systems receive heterogeneous requests (billing, technical, sales, HR) that require specialized handling. A general-purpose agent produces mediocre results across all domains.

**Agent Role:**
Triage Agent classifies incoming requests and routes them to the appropriate specialist agent. Does not attempt to handle requests itself.

**Inputs:**
- Raw user/customer request
- Available specialist registry
- Routing rules (from HiveGovern policy)

**Context:**
- Customer/user profile (if available)
- Previous interaction history
- Specialist agent capability descriptions

**Routing Decision Logic:**
```python
# Vendor-neutral pseudocode
intent = classify_intent(request)
entities = extract_entities(request)
specialist = route_table.lookup(intent, entities)
dispatch(specialist, request, context)
```

**Execution:**
```
REQUEST
    ↓
[INTENT CLASSIFICATION]
    - What is the user trying to do?
    - What domain does it fall in?
    ↓
[ENTITY EXTRACTION]
    - Account ID, order ID, technical system, etc.
    ↓
[SPECIALIST SELECTION]
    - Lookup routing table
    - Fallback: general agent if no match
    ↓
[DISPATCH + HANDOFF]
    - Pass enriched context to specialist
    ↓
[SPECIALIST RESPONSE]
    ↓
[QUALITY GATE]
    - Does response address the request?
    ↓
[RETURN TO USER]
```

**Human Approval:** Escalate when intent is ambiguous (confidence < 70%) or request is sensitive.

**Security:** Routing agent cannot read specialist agent's internal state or tools beyond what is needed for dispatch.

**Suitable Cerebro Applications:**
- CerebroAgent customer service triage
- CerebroCRM sales/support routing
- HiveAgents enterprise request dispatch
- Internal IT helpdesk automation

**Sources:** TH-AI-0005 (Tina Huang Building AI Agents, Apr 2025)

---

### AGENT-PATTERN-0003: MCP-Connected Agent

**Source:** TH-AI-0010 | **Evidence Grade:** B | **Status:** CURRENT

**Name:** MCP-Connected Enterprise Agent

**Problem:**
Agents need to connect to many enterprise tools (CRM, ERP, calendars, email, databases). Building a custom integration for every tool is expensive and creates vendor lock-in.

**Agent Role:**
Agent uses the Model Context Protocol (MCP) as a universal standard for tool connectivity, enabling plug-and-play integration with any MCP-compatible server.

**MCP Architecture:**
```
AGENT (MCP Client)
    ↓  MCP Protocol
MCP SERVER (Tool adapter)
    ↓  Native API
ENTERPRISE TOOL (CRM, Email, Calendar, DB, etc.)
```

**MCP Primitives:**
- **Tools** — Functions the agent can call (equivalent to function calling)
- **Resources** — Data the agent can read (files, records, documents)
- **Prompts** — Reusable prompt templates the server exposes

**Tool Discovery:**
MCP client dynamically discovers available tools from connected servers — agent does not need to be retrained when new tools are added.

**Security Model:**
- Each MCP server requires explicit authorization
- Agent identity verified via HiveIdentity
- Tool call audit log maintained by HiveShield
- Least-privilege: agent only sees tools it has permission to call

**Enterprise MCP Topology:**
```
CerebroAgent
    ↓
HiveAPI (MCP Gateway)
    ├── CRM MCP Server (Salesforce)
    ├── Email MCP Server (Gmail/Exchange)
    ├── Calendar MCP Server (Google/Outlook)
    ├── Database MCP Server (PostgreSQL)
    ├── Filesystem MCP Server (SharePoint/Drive)
    └── Custom internal MCP Servers
```

**Suitable Cerebro Applications:**
- HiveAPI as MCP gateway for all CerebroAgent tool connections
- HiveExchange as marketplace for MCP server connectors
- Enterprise integration without custom connectors

**Sources:** TH-AI-0010 (Tina Huang MCP In 26 Minutes, Oct 2025), Anthropic MCP specification

---

### AGENT-PATTERN-0004: Sequential Agent Pipeline

**Source:** TH-AI-0011 | **Evidence Grade:** B | **Status:** CURRENT

**Name:** Sequential Agent Pipeline (Assembly Line)

**Problem:**
Multi-step tasks where each step's output is the next step's input. Linear dependency chain where parallelism is not beneficial.

**Pattern:**
```
INPUT
  ↓
[AGENT A — Step 1]
  e.g., Document Parser
  ↓
[AGENT B — Step 2]
  e.g., Entity Extractor
  ↓
[AGENT C — Step 3]
  e.g., Knowledge Enricher
  ↓
[AGENT D — Step 4]
  e.g., Report Generator
  ↓
[VALIDATION GATE]
  ↓
OUTPUT
```

**When to Use:**
- Each step depends on the previous step's complete output
- Clear, predictable flow with no branching
- Document processing pipelines
- ETL-style AI workflows

**When NOT to Use:**
- Steps are independent (use PARALLEL instead)
- Task structure is unknown until runtime (use HIERARCHICAL instead)

**Suitable Cerebro Applications:**
- Intelligent Document Processing (CerebroArchive)
- CerebroFlow pipeline templates
- CerebroERP approval chains

---

### AGENT-PATTERN-0005: Parallel Research Agent Swarm

**Source:** TH-AI-0011, WORKFLOW-PATTERN-0001 | **Evidence Grade:** B | **Status:** CURRENT

**Name:** Parallel Research Agent Swarm

**Problem:**
Research tasks require gathering information from multiple independent sources simultaneously. Sequential fetching is too slow, and a single agent cannot process all sources at once.

**Pattern:**
```
RESEARCH REQUEST
    ↓
[RESEARCH COORDINATOR]
    Decomposes request into N independent sub-queries
    ↓
PARALLEL DISPATCH ─────────────────────────────────────────
    ↓              ↓              ↓              ↓
[AGENT 1]     [AGENT 2]     [AGENT 3]     [AGENT N]
Web Search    Database      Archives      API Source
    ↓              ↓              ↓              ↓
RESULTS ←──────────────────────────────────────────────────
    ↓
[DEDUPLICATION]
    ↓
[SYNTHESIS AGENT]
    - Cross-source validation
    - Contradiction resolution
    - Evidence grading
    ↓
[HUMAN REVIEW] (if findings are high-impact)
    ↓
OUTPUT: Research Brief with citations
```

**Cost Management:**
- Set per-agent token budget
- Abort stragglers after timeout; use partial results
- Cache results by query for 24h

**Suitable Cerebro Applications:**
- CerebroResearch intelligence gathering
- CerebroSearch multi-source retrieval
- Competitive intelligence automation
- Due diligence automation

---

### AGENT-PATTERN-0006: Reflection Loop Agent

**Source:** TH-AI-0001 | **Evidence Grade:** B | **Status:** CURRENT

**Name:** Reflection Loop Agent (Self-Critique and Improve)

**Problem:**
First-pass LLM outputs often contain errors, missing information, or suboptimal reasoning. A single generation pass is insufficient for high-quality enterprise output.

**Pattern:**
```
TASK INPUT
    ↓
[GENERATOR AGENT]
    Produces initial output
    ↓
[CRITIC AGENT] (same or different model)
    Evaluates output against criteria:
    - Accuracy
    - Completeness
    - Format compliance
    - Safety
    ↓
[DECISION]
    Good enough? → OUTPUT
    Needs improvement? → Back to Generator with critique
    Max iterations reached? → Escalate to human
    ↓
[IMPROVED GENERATOR PASS]
    Uses critique as additional context
    ↓
[RE-EVALUATE]
    ↓
OUTPUT (when quality threshold met)
```

**Max Iterations:** Set to 3 by default; increase only with explicit justification.

**Cost Warning:** Each reflection loop doubles token cost. Only apply to high-value, high-accuracy tasks.

**Suitable Cerebro Applications:**
- CerebroResearch report generation
- Legal document review (CerebroArchive)
- HiveForge code review agents
- CerebroPredict model validation

---

## WORKFLOW PATTERNS

---

### WORKFLOW-PATTERN-0001: Multi-Source Intelligence Aggregation

**Source:** TH-AI-0012 (Hermes system) | **Evidence Grade:** D | **Status:** CURRENT

**Name:** AI Research Intelligence Aggregation (Hermes Pattern)

**Trigger:** Scheduled (daily/weekly) or on-demand

**Problem:**
Staying current with rapidly evolving AI landscape requires monitoring dozens of sources. Manual monitoring is not scalable. A single search query misses emerging signals.

**Pattern:**
```
TRIGGER (Scheduled / On-Demand)
    ↓
PARALLEL SOURCE FETCH
├── Developer communities (Reddit, HackerNews)
├── Social signals (X/Twitter curated accounts)
├── Video platforms (YouTube AI channels)
├── Professional networks (LinkedIn posts)
├── Research feeds (arXiv, Hugging Face)
├── News aggregators
└── Industry blogs
    ↓
CONTENT CLASSIFIER (LLM)
    - Removes noise, spam, promotional
    - Tags by domain (agents, tools, models, etc.)
    ↓
RELEVANCE FILTER
    - Applies Cerebro Nexarch relevance criteria
    - Scores by strategic importance
    ↓
DEDUPLICATION
    - Semantic dedup across sources
    ↓
SYNTHESIS (LLM reasoning engine)
    - Identifies themes
    - Extracts key claims
    - Assesses credibility
    ↓
HUMAN REVIEW
    ↓
OUTPUT
├── Daily brief
├── Knowledge base delta
├── Technology radar updates
└── Implementation candidate flags
```

**Cerebro Application:** CerebroResearch daily intelligence feed

---

### WORKFLOW-PATTERN-0002: Spec → Generate → Debug → Ship (Vibe Coding Lifecycle)

**Source:** TH-AI-0013 | **Evidence Grade:** D | **Status:** CURRENT

**Name:** PRD-First AI-Assisted Development Lifecycle

**Problem:**
AI code generation without structure produces unmaintainable, insecure, or incorrect code. Vibe coding without discipline is technical debt.

**Pattern:**
```
REQUIREMENTS CAPTURE
    ↓
PRODUCT REQUIREMENTS DOCUMENT (PRD)
    - Feature list
    - User flows
    - Technical specs (framework, libraries, DB schema)
    - Security requirements
    - Testing requirements
    ↓
SYSTEM PROMPT SETUP
    - Load coding standards
    - Load security rules
    - Load naming conventions
    - Specify framework + libraries
    ↓
MVP GENERATION
    Natural language description → AI code generation
    ↓
GIT CHECKPOINT
    (commit before each generation step)
    ↓
STATIC ANALYSIS
    Lint + type check generated code
    ↓
DEBUG CYCLE
    Error → AI diagnosis → Fix → Re-test
    ↓
FEATURE LOOP (repeat MVP Generation → Debug)
    ↓
SECURITY REVIEW
    AI-generated code reviewed for injection, auth, secrets
    ↓
TEST GENERATION
    AI generates unit/integration tests
    ↓
CI PIPELINE
    ↓
HUMAN REVIEW + MERGE
    ↓
PRODUCTION DEPLOYMENT
    ↓
OBSERVABILITY MONITORING
```

**Key Discipline:** PRD MUST exist before any code generation begins. This is non-negotiable.

---

### WORKFLOW-PATTERN-0003: AI-Augmented Data Analysis

**Source:** TH-AI-0029 | **Evidence Grade:** D | **Status:** CURRENT

**Name:** AI-Augmented Data Analysis Pipeline

**Problem:**
Data analysis requires iterative exploration, visualization, and reporting. Traditional code-first approaches are slow. Pure AI approaches lack rigor.

**Pattern:**
```
DATA INPUT (CSV, DB, API, data warehouse)
    ↓
AI PLANNING PHASE
    - LLM proposes analysis approach
    - Human reviews and approves
    ↓
AUTOMATED EDA
    - AI generates descriptive stats code
    - Runs and returns results
    ↓
HUMAN REVIEW OF EDA FINDINGS
    ↓
HYPOTHESIS GENERATION (AI)
    - AI proposes 3–5 hypotheses to test
    - Human selects
    ↓
ANALYSIS CODE GENERATION (AI)
    - Generates Python/SQL for each hypothesis
    ↓
EXECUTION + RESULTS
    ↓
VISUALIZATION GENERATION (AI)
    - Charts, plots, dashboards
    ↓
NARRATIVE SYNTHESIS (AI)
    - Writes report from findings
    ↓
HUMAN REVIEW + EDIT
    ↓
FINAL DELIVERABLE
```

**Cerebro Application:** CerebroAnalytics AI-assisted analysis, CerebroInsight report generation

---

### WORKFLOW-PATTERN-0004: Trigger-Action Agent Automation (No-Code)

**Source:** TH-AI-0009 | **Evidence Grade:** C | **Status:** CURRENT

**Name:** No-Code Trigger-Action Agent (n8n Pattern)

**Problem:**
Business teams need AI automation without engineering resources. Full code-based agents are overengineered for simple trigger-action workflows.

**Pattern:**
```
TRIGGER
├── Schedule (cron)
├── Webhook (API call)
├── Email received
├── Form submitted
├── File created/updated
└── Database row inserted
    ↓
CONTEXT ACQUISITION
    - Fetch relevant data
    - Enrich with business context
    ↓
AI REASONING NODE
    - LLM processes input with instructions
    - Generates structured output
    ↓
CONDITIONAL ROUTING
    - Branch based on AI output
    ↓
ACTION EXECUTION
├── Send email/Slack
├── Update CRM
├── Create task
├── Generate document
└── Call API
    ↓
LOGGING + MONITORING
```

**Platform:** n8n (prototype), CerebroFlow (production)

---

## PROMPT PATTERNS

---

### PROMPT-PATTERN-0001: Persistent Agent System Prompt Architecture

**Source:** TH-AI-0023 (OpenClaw setup) | **Evidence Grade:** D | **Status:** CURRENT

**Objective:** Define a reusable system prompt architecture for persistent AI agents.

**Applicable Tasks:** Any production agent requiring stable identity, consistent behavior, and clear boundaries.

**Pattern:**
```
[IDENTITY BLOCK]
You are {agent_name}, {agent_role} for {organization}.
Your expertise covers: {domain_list}

[MISSION BLOCK]
Your primary mission is to {mission_statement}.
You serve {persona}: {user/team/organization}.
Always prioritize {priority_hierarchy}.

[CAPABILITY BLOCK]
You have access to these tools:
- {tool_name}: {tool_description and when to use it}
(list all tools explicitly)

[BEHAVIOR BLOCK]
You MUST always:
- {mandatory_behavior_1}
- {mandatory_behavior_2}

You MUST NOT:
- {prohibited_action_1}
- {prohibited_action_2}

[OUTPUT FORMAT BLOCK]
Respond in {format: JSON|markdown|prose}.
Structure every response as:
{output_schema_or_example}

[ESCALATION BLOCK]
Escalate to human when:
- {escalation_condition_1}
- {escalation_condition_2}

[CONTEXT BLOCK]
Current date: {date}
Current user: {user_name}
Current session context: {session_context}
```

**Variables:** agent_name, agent_role, organization, domain_list, mission_statement, tool_list, behavior_rules, output_schema, escalation_conditions

**Why It Works:** Provides stable grounding, prevents scope drift, makes behavior predictable and auditable.

**Failure Modes:**
- Too-long system prompts dilute attention (keep under 2K tokens)
- Contradictory rules cause unpredictable behavior
- Missing escalation conditions → agent attempts tasks it cannot complete

---

### PROMPT-PATTERN-0002: TCREI (Task-Context-Reference-Evaluate-Iterate)

**Source:** TH-AI-0024 (Google Prompt Engineering Guide) | **Evidence Grade:** C | **Status:** CURRENT

**Objective:** Structured five-step prompting methodology for consistent high-quality outputs.

**Pattern:**

```
T — TASK
"Your task is to [specific action verb] [object] [constraint]."
Example: "Your task is to summarize the following enterprise contract in under 200 words, focusing on liability clauses."

C — CONTEXT
"[Background information that shapes the response]"
Example: "This contract is between Cerebro Nexarch and an enterprise customer in the financial services industry. The audience for this summary is the legal team, who need actionable items."

R — REFERENCES
"Here are examples of the desired output:"
[Positive example 1]
[Positive example 2]
"Here is an example of what NOT to do:"
[Negative example]

E — EVALUATE
"A good response will:
- [ ] Cover all liability clauses
- [ ] Be under 200 words
- [ ] Use plain language (no legal jargon)
- [ ] List action items at the end"

I — ITERATE
If output is unsatisfactory, apply one of:
1. Add more context → return to C
2. Simplify the task → return to T
3. Add constraints → specify length, format, tone
4. Rephrase using analogy → "as if explaining to..."
```

**Why It Works:** Forces structured thinking about the task before generating. Reduces hallucination by anchoring to examples. Evaluation criteria prevent prompt-writer from accepting poor outputs.

**Agent Usage:** Embed TCREI structure in agent task prompts; use E (evaluate) as the agent's self-evaluation criteria.

---

### PROMPT-PATTERN-0003: Constraint-Based Prompt Refinement

**Source:** TH-AI-0024 | **Evidence Grade:** D | **Status:** CURRENT

**Objective:** Systematically narrow AI output quality through constraint addition.

**When to Use:** Initial prompt produces outputs that are too broad, too long, incorrect domain, wrong format, or wrong tone.

**Pattern:**
```
INITIAL PROMPT → EVALUATE OUTPUT
    ↓
OUTPUT TOO BROAD?
    Add: "Focus only on [specific_aspect]. Ignore [exclusions]."

OUTPUT TOO LONG?
    Add: "Respond in exactly [N] words/bullets/paragraphs."

WRONG DOMAIN?
    Add: "Consider only [domain_constraint]. Do not reference [excluded_domain]."

WRONG FORMAT?
    Add: "Structure your response as [exact_format_specification]."

WRONG TONE?
    Add: "Write in a [tone] style for [audience] with [expertise_level] knowledge."

WRONG DEPTH?
    Add: "Assume the reader is [expertise_level]. Include [technical details | only summaries]."
```

---

### PROMPT-PATTERN-0004: Expert Persona Assignment

**Source:** TH-AI-0024 | **Evidence Grade:** D | **Status:** CURRENT

**Objective:** Improve domain-specific output quality by assigning expert persona to the model.

**Pattern:**
```
"You are a [specific expert title] with [N] years of experience in [domain].
You have deep expertise in [specific_specializations].
You work at [context: company type, industry].
When responding, draw on your expertise to [expected behavior].
Your responses should reflect the standards and rigor of [professional benchmark]."
```

**Examples:**
```
"You are a Principal Security Architect with 15 years of experience in enterprise zero-trust architecture. You specialize in AI system security, prompt injection prevention, and agent authorization design. When reviewing AI workflows, you apply the rigor of a CISSP-certified professional."

"You are a Senior Data Engineer with 10 years of experience building production ML pipelines at Fortune 500 companies. You specialize in Python, Apache Spark, and vector databases. When reviewing data architectures, you prioritize scalability, cost efficiency, and maintainability."
```

**Why It Works:** LLMs have richer representations of domain-expert behavior patterns in their training data. Persona assignment activates those representations.

**Failure Modes:** Overly specific or contradictory personas reduce performance. Keep persona focused on 2–3 relevant domains.

---

### PROMPT-PATTERN-0005: Expert Power User Prompt Structure

**Source:** TH-AI-0027 | **Evidence Grade:** D | **Status:** CURRENT

**Objective:** Differentiated prompting strategy for complex, multi-step AI tasks.

**Pattern (Top 10% structure):**
```
[ROLE]: You are a [expert_persona].

[CONTEXT]: [rich_background_information]

[TASK]: [specific_task_with_success_criteria]

[CONSTRAINTS]:
- Must: [hard_requirements]
- Must not: [explicit_prohibitions]
- Prefer: [soft_preferences]

[OUTPUT FORMAT]:
{
  "section_1": "...",
  "section_2": "...",
  "confidence": "high|medium|low",
  "caveats": ["..."],
  "follow_up_questions": ["..."]
}

[EVALUATION CRITERIA]:
Evaluate your own response against:
1. [criterion_1]
2. [criterion_2]
3. [criterion_3]
If your response does not meet all criteria, revise before responding.
```

**Key Differentiator:** Includes self-evaluation instruction. Forces model to critique its own output before returning it.

---

## CONTEXT ENGINEERING PATTERNS

---

### CONTEXT-PATTERN-0001: Writing Context

**Source:** TH-AI-0015 | **Evidence Grade:** A | **Status:** CURRENT

**Definition:** The agent writes information to a persistent context store for future reference during the task.

**Use Cases:**
- Maintaining working memory across long agent runs
- Accumulating findings during research tasks
- Tracking progress through multi-step workflows
- Preventing context loss across agent handoffs

**Implementation:**
```python
# Agent scratchpad — vendor neutral
agent_state = {
    "task_id": "...",
    "completed_steps": [],
    "findings": [],
    "pending_actions": [],
    "working_memory": {},
    "session_context": {}
}

# After each significant step:
agent_state["findings"].append(new_finding)
agent_state["completed_steps"].append(step_id)
persist(agent_state, storage=HiveMemory)
```

**Cerebro Implementation:** HiveMemory agent scratchpad with structured JSON schema

---

### CONTEXT-PATTERN-0002: Selecting Context

**Source:** TH-AI-0015 | **Evidence Grade:** A | **Status:** CURRENT

**Definition:** The agent retrieves relevant context from external knowledge stores at task time rather than loading all context upfront.

**Use Cases:**
- RAG-augmented agents
- Knowledge-base-powered customer service agents
- Enterprise document Q&A
- Dynamic context assembly based on query

**Implementation:**
```
USER QUERY
    ↓
[QUERY ENCODER]
    Convert to embedding vector
    ↓
[VECTOR SEARCH] (HiveVector)
    Top-K most relevant chunks
    ↓
[RELEVANCE FILTER]
    Score and filter below threshold
    ↓
[CONTEXT ASSEMBLY]
    Format retrieved chunks for injection
    ↓
[PROMPT ASSEMBLY]
    System prompt + retrieved context + user query
    ↓
[LLM GENERATION]
```

**Key Principle:** Select ONLY what is relevant. Injecting irrelevant context reduces model quality and increases cost.

---

### CONTEXT-PATTERN-0003: Compressing Context

**Source:** TH-AI-0015 | **Evidence Grade:** A | **Status:** CURRENT

**Definition:** Systematically condense large context volumes into compact representations without losing critical information.

**Use Cases:**
- Long-running agent sessions approaching context limit
- Summarizing conversation history
- Compressing document corpora for embedding
- Reducing token cost for repeated context

**Compression Strategies:**

**Strategy 1 — Recursive Summarization:**
```
FULL DOCUMENT (100K tokens)
    ↓
[CHUNK into segments of 8K tokens]
    ↓
[SUMMARIZE each chunk] → 500 tokens per chunk
    ↓
[COMBINE summaries] → 5K tokens
    ↓
[SUMMARIZE combined] → 1K tokens
```

**Strategy 2 — Extraction:**
```
FULL CONTEXT
    ↓
[IDENTIFY key facts, decisions, open items]
    ↓
[EXTRACT only these elements]
    ↓
[STRUCTURED COMPACT REPRESENTATION]
{
  "key_decisions": [],
  "open_items": [],
  "critical_facts": [],
  "next_actions": []
}
```

**Strategy 3 — Sliding Window:**
Keep the most recent N turns + a running summary of all prior turns.

**When to Trigger:** When context usage exceeds 60% of model context window.

---

### CONTEXT-PATTERN-0004: Isolating Context

**Source:** TH-AI-0015 | **Evidence Grade:** A | **Status:** CURRENT

**Definition:** Separating context across different agents, tenants, or task environments to prevent cross-contamination.

**Use Cases:**
- Multi-tenant enterprise deployments (CRITICAL)
- Multi-agent systems with specialized agents
- Parallel agent execution without state leakage
- Security-sensitive workflows with data classification boundaries

**Implementation:**
```
MULTI-TENANT ISOLATION:
    Tenant A context → Tenant A agent namespace → Tenant A storage
    Tenant B context → Tenant B agent namespace → Tenant B storage
    (NEVER cross-inject)

MULTI-AGENT ISOLATION:
    Agent A context: { task_id, agent_id, scoped_tools, scoped_data }
    Agent B context: { task_id, agent_id, scoped_tools, scoped_data }
    Shared context: only what orchestrator explicitly shares

SECURITY CLASSIFICATION:
    CONFIDENTIAL data → CONFIDENTIAL agent context only
    PUBLIC data → any agent context
    (HiveGovern enforces context classification policy)
```

**Security Note:** Context isolation is the primary defense against tenant data leakage in multi-tenant AI systems. This is a security control, not just an engineering preference.

**Cerebro Implementation:** HiveMemory namespace isolation + HiveGovern context policy enforcement

---

## ARCHITECTURE PATTERNS

---

### ARCH-PATTERN-0001: LLM Gateway with Intelligent Routing

**Source:** TH-AI-0004 (model selection strategy) | **Evidence Grade:** B | **Status:** CURRENT

**Name:** Intelligent LLM Gateway

**Problem:** Different tasks require different models. Routing all requests to a single model wastes cost on simple tasks and underserves complex tasks.

**Architecture:**
```
ALL AI REQUESTS
    ↓
[LLM GATEWAY] (HiveModels)
    ├── Intent Classification
    ├── Cost Budget Check
    ├── Privacy Classification
    ├── Latency SLA Check
    ↓
[MODEL ROUTER]
    ├── coding/STEM → Claude 3.7 Sonnet
    ├── math/logic → o3-mini
    ├── long-context → Gemini 2.5 Pro
    ├── privacy-sensitive → Local Qwen/Llama
    ├── simple/fast → GPT-4o mini
    └── default → GPT-4o
    ↓
[SELECTED MODEL]
    ↓
[RESPONSE + TELEMETRY]
    - model used, tokens, cost, latency logged
```

**Cerebro Application:** LLM Gateway → HiveModels with routing intelligence

---

### ARCH-PATTERN-0002: Enterprise Context Architecture

**Source:** TH-AI-0015, TH-AI-0016 | **Evidence Grade:** A | **Status:** CURRENT

**Name:** Layered Enterprise Context Stack

**Architecture:**
```
LAYER 1: SYSTEM CONTEXT (stable, rarely changes)
    - Agent identity and mission
    - Organizational constraints
    - Security policies (from HiveGovern)

LAYER 2: ORGANIZATIONAL CONTEXT (session-stable)
    - Tenant-specific knowledge
    - Organization profile and preferences
    - Team context and permissions

LAYER 3: TASK CONTEXT (per-task)
    - Task specification
    - Task-specific constraints
    - Prior task results if chained

LAYER 4: RETRIEVED CONTEXT (per-query, dynamic)
    - RAG results (HiveVector)
    - Tool outputs
    - Real-time data fetches

LAYER 5: WORKING MEMORY (per-agent-run)
    - Agent scratchpad
    - Intermediate findings
    - Decision log

LAYER 6: CONVERSATION HISTORY (compressed)
    - Recent N turns
    - Summary of prior turns
```

**Principle:** Context flows top-down (system overrides task). Lower layers are discarded first when compressing.

---

## PATTERN INDEX

| Pattern ID | Name | Type | Priority | Cerebro Component |
|---|---|---|---|---|
| AGENT-PATTERN-0001 | Hierarchical Multi-Agent | Agent | P0 | CerebroAgent |
| AGENT-PATTERN-0002 | Routing Specialist Agent | Agent | P0 | CerebroAgent |
| AGENT-PATTERN-0003 | MCP-Connected Agent | Agent | P0 | HiveAPI |
| AGENT-PATTERN-0004 | Sequential Agent Pipeline | Agent | P1 | CerebroFlow |
| AGENT-PATTERN-0005 | Parallel Research Swarm | Agent | P1 | CerebroResearch |
| AGENT-PATTERN-0006 | Reflection Loop Agent | Agent | P1 | HiveForge |
| WORKFLOW-PATTERN-0001 | Multi-Source Intelligence Aggregation | Workflow | P1 | CerebroResearch |
| WORKFLOW-PATTERN-0002 | PRD-First AI Development Lifecycle | Workflow | P1 | HiveForge |
| WORKFLOW-PATTERN-0003 | AI-Augmented Data Analysis | Workflow | P2 | CerebroAnalytics |
| WORKFLOW-PATTERN-0004 | No-Code Trigger-Action Agent | Workflow | P2 | CerebroFlow |
| PROMPT-PATTERN-0001 | Persistent Agent System Prompt | Prompt | P0 | Prompt Registry |
| PROMPT-PATTERN-0002 | TCREI Framework | Prompt | P0 | Prompt Registry |
| PROMPT-PATTERN-0003 | Constraint-Based Refinement | Prompt | P1 | Prompt Registry |
| PROMPT-PATTERN-0004 | Expert Persona Assignment | Prompt | P1 | Prompt Registry |
| PROMPT-PATTERN-0005 | Expert Power User Structure | Prompt | P2 | Prompt Registry |
| CONTEXT-PATTERN-0001 | Writing Context | Context | P0 | HiveMemory |
| CONTEXT-PATTERN-0002 | Selecting Context (RAG) | Context | P0 | HiveVector |
| CONTEXT-PATTERN-0003 | Compressing Context | Context | P1 | HiveMemory |
| CONTEXT-PATTERN-0004 | Isolating Context | Context | P0 | HiveMemory + HiveShield |
| ARCH-PATTERN-0001 | Intelligent LLM Gateway | Architecture | P0 | HiveModels |
| ARCH-PATTERN-0002 | Layered Enterprise Context Stack | Architecture | P0 | HiveMemory + HiveKnowledge |
