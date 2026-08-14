# CEREBRO-NEXARCH-APPLIED-AI-BEST-PRACTICES.md
# Cerebro Nexarch Pvt Ltd — Applied AI Best Practices Database
# Knowledge Engineering Division

**Version:** 1.0  
**Source:** Tina Huang AI KB + Verified Primary Sources + CerebroHive Architecture  
**Date:** 2026-08-14  
**Status:** LIVING DOCUMENT

Practices use: **MUST** / **MUST NOT** / **SHOULD** / **SHOULD NOT** / **MAY**

---

## DOMAIN 1: AGENT ENGINEERING

---

### BP-AI-0001 — Six-Component Agent Architecture Checklist

**Rule:** MUST design every Cerebro agent against the six-component architecture before writing any code.

**Problem Prevented:** Missing critical components (guardrails, memory, orchestration) discovered post-deployment, requiring costly rework.

**Components Required:**
1. Model — core reasoning LLM
2. Tools — external system integrations
3. Knowledge & Memory — storage and retrieval
4. Audio/Speech — multimodal capabilities (if needed)
5. Guardrails — safety and constraint mechanisms
6. Orchestration — deployment, monitoring, improvement

**Applicable Systems:** All CerebroAgent, HiveAgents implementations

**Verification:** Architecture review checklist must be signed off before sprint planning

**Evidence:** TH-AI-0003, Anthropic agent design documentation

---

### BP-AI-0002 — Specialized Agents over Monolithic Agents

**Rule:** MUST use specialized agents for domain-specific tasks. MUST NOT build a single agent that attempts to handle all domains.

**Problem Prevented:** General-purpose agents produce mediocre quality across all domains. Debugging and improvement become impossible.

**Implementation:** Define one agent per domain. Use a routing agent (AGENT-PATTERN-0002) to dispatch between specialists.

**Exception:** Low-stakes, low-complexity automation that does not justify the orchestration overhead of a multi-agent system.

**Evidence:** TH-AI-0005, DeepLearning.AI agent patterns

---

### BP-AI-0003 — Human-in-the-Loop for High-Impact Actions

**Rule:** MUST NOT automate irreversible, financial, or high-impact actions without explicit human approval.

**Problem Prevented:** Autonomous agents executing incorrect high-impact actions with no recovery path.

**Applicable Operations (require approval):**
- Sending external communications to customers
- Modifying financial records
- Deleting data
- Provisioning infrastructure
- Signing contracts or commitments

**Implementation:** Every agent MUST declare its HITL requirements at design time via the workflow YAML schema.

**Evidence:** CerebroHive Constitution §15, industry best practice

---

### BP-AI-0004 — Agent Evaluation Before Production

**Rule:** MUST define agent evaluation metrics before implementation begins. MUST NOT deploy to production without passing evaluation thresholds.

**Problem Prevented:** Agents deployed to production with unknown accuracy, hallucination rate, or failure modes.

**Minimum Evaluation Set:**
- Task completion rate (target > 90%)
- Hallucination rate (target < 5%)
- Structured output validity (target > 98%)
- Cost per task (within budget ceiling)
- Human escalation rate (establish baseline)

**Evidence:** TH-AI-0003, HiveOps evaluation architecture

---

### BP-AI-0005 — Agent Memory Architecture

**Rule:** SHOULD implement all four memory types for persistent agents: working memory, episodic memory, semantic memory, and procedural memory.

**Problem Prevented:** Agents that forget context across runs, repeat mistakes, or fail to learn from feedback.

**Memory Type Mapping:**
- Working memory → agent scratchpad (HiveMemory session store)
- Episodic memory → task history (HiveMemory long-term store)
- Semantic memory → knowledge graph (HiveKnowledge)
- Procedural memory → updated prompts and tools (Prompt Registry)

**Evidence:** TH-AI-0003, CerebroHive EIOS architecture

---

## DOMAIN 2: CONTEXT ENGINEERING

---

### BP-CE-0001 — Context Engineering over Prompt Engineering for Agents

**Rule:** SHOULD treat context engineering as the primary discipline for agent quality. Prompt engineering alone is insufficient for complex agents.

**Problem Prevented:** Agents that produce inconsistent results because their information environment is poorly constructed, not because their instructions are wrong.

**Applicable Systems:** All agents with multi-step reasoning, tool use, or long-running tasks.

**Evidence:** TH-AI-0016, LangChain context engineering research

---

### BP-CE-0002 — Context Isolation for Multi-Tenant Deployments

**Rule:** MUST isolate context between different enterprise tenants. Tenant A's context MUST NEVER appear in Tenant B's agent context.

**Problem Prevented:** Data leakage between enterprise customers — a catastrophic security and compliance failure.

**Implementation:** HiveMemory namespace isolation per tenant_id + HiveGovern context policy enforcement.

**Verification:** Security test: attempt cross-tenant context injection in staging before production deployment.

**Evidence:** CerebroHive Constitution §15 (multi-tenancy standard), CONTEXT-PATTERN-0004

---

### BP-CE-0003 — Context Compression at 60% Window Usage

**Rule:** SHOULD trigger context compression when agent context usage exceeds 60% of model context window.

**Problem Prevented:** Context overflow causing agent failures, or excessive token costs from unnecessarily large context windows.

**Implementation:** Recursive summarization of conversation history + structured extraction of key decisions and open items.

**Exception:** Tasks where full conversation history is legally required (audit, compliance use cases).

**Evidence:** TH-AI-0015, CONTEXT-PATTERN-0003

---

### BP-CE-0004 — Structured Context Formatting

**Rule:** MUST use structured formats (XML tags, markdown headers, JSON) for context that will be parsed or acted upon by agents.

**Problem Prevented:** Agents that misinterpret unstructured context, produce incorrect structured outputs, or hallucinate on ambiguous input.

**Implementation:**
```xml
<task_context>
  <user_request>{request}</user_request>
  <organizational_context>{context}</organizational_context>
  <retrieved_documents>{rag_results}</retrieved_documents>
  <constraints>{constraints}</constraints>
</task_context>
```

**Evidence:** TH-AI-0015, OpenAI structured output documentation

---

## DOMAIN 3: PROMPT ENGINEERING

---

### BP-PE-0001 — TCREI Prompt Structure for All Production Prompts

**Rule:** SHOULD structure all production agent task prompts using the TCREI framework (Task, Context, References, Evaluate, Iterate).

**Problem Prevented:** Vague prompts producing variable, low-quality outputs that fail evaluation criteria.

**Applicable Systems:** All Prompt & Tool Registry entries, CerebroAgent task prompts

**Exception:** Simple, single-step utility prompts (format conversion, simple extraction) that do not require full TCREI structure.

**Evidence:** TH-AI-0024, Google Prompt Engineering Guide (official)

---

### BP-PE-0002 — Prompt Version Control

**Rule:** MUST version all production prompts in the Prompt & Tool Registry. MUST NOT modify production prompts without creating a new version.

**Problem Prevented:** Silent prompt changes causing unexplained agent behavior changes in production; inability to rollback.

**Implementation:** Every Prompt & Tool Registry entry must have: version, created_at, author, change_reason, linked evaluation results.

**Evidence:** CerebroHive Architecture (Prompt & Tool Registry component)

---

### BP-PE-0003 — Explicit Output Format in Every Agent Prompt

**Rule:** MUST specify the exact output format in every agent prompt. For structured data, MUST provide JSON schema.

**Problem Prevented:** Agents returning unstructured text when downstream systems expect JSON, or returning JSON when prose is needed.

**Evidence:** TH-AI-0015 (structured context formatting), industry standard

---

### BP-PE-0004 — Self-Evaluation Instruction for High-Stakes Tasks

**Rule:** SHOULD add self-evaluation instruction to agent prompts for high-stakes outputs (reports, financial analysis, legal documents).

**Pattern:**
```
Before returning your response, evaluate it against these criteria:
[ ] {criterion_1}
[ ] {criterion_2}
[ ] {criterion_3}
If your response does not satisfy all criteria, revise before responding.
```

**Problem Prevented:** Poor-quality outputs on high-stakes tasks that could have been improved with one additional self-critique step.

**Evidence:** TH-AI-0027, PROMPT-PATTERN-0005

---

## DOMAIN 4: AI CODING

---

### BP-CODING-0001 — PRD Before Code Generation

**Rule:** MUST create a Product Requirements Document before any AI code generation session.

**Problem Prevented:** AI-generated code that is structurally wrong, solves the wrong problem, or produces unmaintainable architecture.

**Minimum PRD Contents:**
- Feature list
- User flows
- Technical specification (framework, libraries, DB schema)
- Security requirements
- Testing requirements

**Evidence:** TH-AI-0013, developer community best practice

---

### BP-CODING-0002 — Framework Specification in Code Prompts

**Rule:** SHOULD explicitly specify the target framework, libraries, and coding standards in every code generation prompt.

**Problem Prevented:** AI defaulting to incorrect or inconsistent technology choices (e.g., using jQuery when React is the standard).

**Evidence:** TH-AI-0013 (vibe coding fundamentals)

---

### BP-CODING-0003 — Git Checkpoint Before Each AI Generation

**Rule:** MUST commit to version control before each AI code generation step.

**Problem Prevented:** Inability to recover from bad AI-generated code overwrites.

**Evidence:** TH-AI-0013

---

### BP-CODING-0004 — Security Review Gate for AI-Generated Code

**Rule:** MUST NOT deploy AI-generated code to production without a security review.

**Problem Prevented:** Prompt injection vulnerabilities, insecure authentication, secrets embedded in code, SQL injection in generated queries.

**Implementation:** Static analysis (Semgrep) + manual security review on all AI-generated code before PR merge.

**Evidence:** CerebroHive SECURITY.md, TH-AI-0013

---

### BP-CODING-0005 — System Prompt for Coding Standards Enforcement

**Rule:** SHOULD use agent system prompts to enforce Cerebro Nexarch coding standards during AI-assisted development.

**Problem Prevented:** AI-generated code that violates naming conventions, architectural standards, or security policies.

**Template System Prompt Section:**
```
You are a Cerebro Nexarch coding assistant. All code you generate MUST:
- Use TypeScript (strict mode)
- Follow the repository naming conventions in {link}
- Implement proper error handling with typed errors
- Include JSDoc comments on all public functions
- NEVER include API keys, secrets, or hardcoded credentials
- MUST NOT use `any` types
```

**Evidence:** TH-AI-0014, CerebroHive coding standards

---

## DOMAIN 5: WORKFLOW AUTOMATION

---

### BP-AUTO-0001 — Prototype Automation in n8n Before Production

**Rule:** SHOULD prototype all CerebroFlow automation workflows in n8n before production implementation.

**Problem Prevented:** Expensive production re-work from untested workflow logic. n8n enables rapid iteration on workflow design.

**Evidence:** TH-AI-0009, AUTOMATION-PATTERN-0001

---

### BP-AUTO-0002 — Declare Workflow Type Before Building

**Rule:** MUST declare the automation trigger type and approval model before building any workflow.

**Required declarations:**
- Trigger type: event-driven | scheduled | human-triggered | agent-triggered
- Human approval required: yes | no | conditional
- Failure handling: retry | escalate | abort
- Maximum cost per execution

**Evidence:** WORKFLOW-PATTERN-0004 template

---

## DOMAIN 6: MODEL SELECTION

---

### BP-MODEL-0001 — Task-Model Routing Decision

**Rule:** SHOULD route tasks to the most cost-effective model that meets quality requirements. MUST NOT route all tasks to the most expensive model by default.

**Routing Decision Order:**
1. Privacy requirement → local model if data cannot leave premises
2. Coding/STEM task → Claude Sonnet
3. Extended context (>100K tokens) → Gemini 2.5 Pro
4. Math/logic reasoning → o3-mini
5. Default → GPT-4o

**Evidence:** TH-AI-0004, ARCH-PATTERN-0001

---

### BP-MODEL-0002 — Independent Verification of Model Claims

**Rule:** MUST NOT adopt a model based on YouTube demonstrations or influencer recommendations alone. MUST run internal benchmarks on target task categories.

**Problem Prevented:** Adopting inferior models based on cherry-picked demos; missing better alternatives.

**Verification Process:** Benchmark on 100+ representative tasks from actual Cerebro workloads before radar status change to ADOPT.

**Evidence:** Master Prompt §39 (Verify All Material Claims)

---

## DOMAIN 7: RAG AND KNOWLEDGE

---

### BP-RAG-0001 — Semantic Chunking Required

**Rule:** MUST chunk documents at semantic boundaries (paragraph, section, concept) rather than fixed character counts.

**Problem Prevented:** Retrieved chunks that split concepts mid-sentence, reducing retrieval quality and LLM comprehension.

**Evidence:** Industry RAG best practices, HiveKnowledge architecture

---

### BP-RAG-0002 — Citation Tracking for All RAG Outputs

**Rule:** MUST implement provenance/citation tracking for all agent outputs derived from retrieved knowledge.

**Problem Prevented:** Unverifiable AI outputs; inability to audit or correct incorrect information.

**Implementation:** Every RAG-derived output must include source document reference, chunk ID, retrieval score.

**Evidence:** CerebroHive Constitution §19 (explainability standard)

---

## DOMAIN 8: EVALUATION

---

### BP-EVAL-0001 — Define Metrics Before Implementation

**Rule:** MUST define evaluation criteria and success thresholds before writing any agent code.

**Problem Prevented:** Post-hoc rationalization of poor-quality agents; no clear definition of "good enough."

**Evidence:** TH-AI-0003, HiveOps evaluation architecture

---

### BP-EVAL-0002 — Hype Filter for External Claims

**Rule:** MUST NOT accept AI capability claims from tutorials, demos, or influencer content without independent verification.

**Hype Signals to Watch:**
- "10x productivity" without measured data
- Demo environments with pre-loaded data
- Claims about ROI without cost data
- Benchmark scores without methodology disclosure
- Cherry-picked screenshots or recordings

**Evidence:** Master Prompt §41 (Hype Filter)

---

## DOMAIN 9: SECURITY

---

### BP-SEC-0001 — Prompt Injection Defense is Mandatory

**Rule:** MUST implement prompt injection defense on ALL agent inputs that include external content.

**Problem Prevented:** Malicious documents, emails, or web pages that hijack agent behavior by embedding adversarial instructions.

**Implementation:**
- HiveShield injection detection on all external inputs
- Sandboxing of external document content in agent context
- Never inject raw external content into system prompt

**Evidence:** CerebroHive SECURITY.md, emerging AI security research

---

### BP-SEC-0002 — Least-Privilege Tool Access

**Rule:** MUST configure each agent with only the tool permissions it requires for its specific task. MUST NOT grant broad tool access as a default.

**Problem Prevented:** Compromised agents with broad tool access causing maximum damage.

**Implementation:** HiveIdentity RBAC per agent type + HiveShield tool call gating.

**Evidence:** CerebroHive Constitution §15 (security standards)

---

## DOMAIN 10: PRODUCTION ENGINEERING

---

### BP-PROD-0001 — Never Confuse Demo with Production

**Rule:** MUST clearly distinguish: DEMO / PROTOTYPE / POC / PILOT / PRODUCTION-READY / PRODUCTION-PROVEN.

**Problem Prevented:** YouTube demonstrations adopted as production architecture without adequate validation.

**Required Label:** Every implementation candidate MUST carry a maturity label. Promotion between stages requires defined acceptance criteria.

**Evidence:** Master Prompt §42 (Prototype vs Production)

---

### BP-PROD-0002 — Cost Ceiling on Every Agent

**Rule:** MUST set a maximum token cost ceiling per agent run. MUST abort and escalate if ceiling is breached.

**Problem Prevented:** Runaway agent loops consuming unlimited API budget; unexpected cost spikes.

**Implementation:** HiveOps cost monitoring with per-run ceiling enforcement.

**Evidence:** CerebroHive Architecture (cost tracking component)

---

### BP-PROD-0003 — Temporal Versioning of All Knowledge Objects

**Rule:** MUST track first_seen, last_verified, technology_version, and status on all knowledge objects.

**Problem Prevented:** Outdated knowledge objects being acted upon as if current; tool recommendations that are 2 years old being implemented.

**Status Values:** CURRENT / EMERGING / OUTDATED / DEPRECATED / SUPERSEDED / UNVERIFIED / REJECTED

**Evidence:** Master Prompt §61 (Temporal Versioning)

---

## BEST PRACTICES INDEX

| ID | Domain | Rule Summary | Priority |
|---|---|---|---|
| BP-AI-0001 | Agent Engineering | Six-Component Architecture Checklist | P0 |
| BP-AI-0002 | Agent Engineering | Specialized Agents over Monolithic | P0 |
| BP-AI-0003 | Agent Engineering | HITL for High-Impact Actions | P0 |
| BP-AI-0004 | Agent Engineering | Evaluation Before Production | P0 |
| BP-AI-0005 | Agent Engineering | Four-Type Memory Architecture | P1 |
| BP-CE-0001 | Context Engineering | CE over PE for Agents | P0 |
| BP-CE-0002 | Context Engineering | Context Isolation for Multi-Tenant | P0 |
| BP-CE-0003 | Context Engineering | Compress at 60% Window Usage | P1 |
| BP-CE-0004 | Context Engineering | Structured Context Formatting | P1 |
| BP-PE-0001 | Prompt Engineering | TCREI Structure | P1 |
| BP-PE-0002 | Prompt Engineering | Prompt Version Control | P0 |
| BP-PE-0003 | Prompt Engineering | Explicit Output Format | P0 |
| BP-PE-0004 | Prompt Engineering | Self-Evaluation for High-Stakes | P1 |
| BP-CODING-0001 | AI Coding | PRD Before Code Generation | P0 |
| BP-CODING-0002 | AI Coding | Framework Specification | P1 |
| BP-CODING-0003 | AI Coding | Git Checkpoint Before Generation | P0 |
| BP-CODING-0004 | AI Coding | Security Review Gate | P0 |
| BP-CODING-0005 | AI Coding | System Prompt for Standards | P1 |
| BP-AUTO-0001 | Automation | Prototype in n8n First | P1 |
| BP-AUTO-0002 | Automation | Declare Workflow Type | P1 |
| BP-MODEL-0001 | Model Selection | Task-Model Routing | P1 |
| BP-MODEL-0002 | Model Selection | Verify Before Adopting | P0 |
| BP-RAG-0001 | RAG | Semantic Chunking | P1 |
| BP-RAG-0002 | RAG | Citation Tracking | P0 |
| BP-EVAL-0001 | Evaluation | Metrics Before Implementation | P0 |
| BP-EVAL-0002 | Evaluation | Hype Filter | P0 |
| BP-SEC-0001 | Security | Prompt Injection Defense | P0 |
| BP-SEC-0002 | Security | Least-Privilege Tool Access | P0 |
| BP-PROD-0001 | Production | Never Confuse Demo with Production | P0 |
| BP-PROD-0002 | Production | Cost Ceiling per Agent | P1 |
| BP-PROD-0003 | Production | Temporal Versioning | P1 |
