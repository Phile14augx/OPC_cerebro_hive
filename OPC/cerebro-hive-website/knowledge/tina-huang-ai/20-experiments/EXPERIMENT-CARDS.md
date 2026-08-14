# CEREBRO NEXARCH — AI EXPERIMENT CARDS

**Version:** 1.0  
**Date:** 2026-08-14  
**Source:** Tina Huang AI Knowledge Base — Experiment Candidates  
**Owner:** Knowledge Engineering Division / HiveForge

---

## Experiment Schema

Each experiment card:
- **ID:** EXP-XXX
- **Hypothesis:** What we believe to be true
- **Test:** How we'll test it
- **Success Metric:** Quantified definition of "the hypothesis was confirmed"
- **Failure Metric:** Quantified definition of "the hypothesis was rejected"
- **Effort:** S / M / L
- **Time-box:** Maximum duration before we make a go/no-go decision
- **Risk:** HIGH / MEDIUM / LOW
- **Investment if confirmed:** What we build next if the hypothesis holds

---

## EXP-001 — Context Engineering Improves Agent Quality by >20%

**Priority:** P0  
**Status:** READY TO RUN  
**Effort:** S  
**Time-box:** 2 weeks  
**Risk:** LOW

**Hypothesis:**  
Applying the four context engineering strategies (Write, Select, Compress, Isolate) to CerebroAgent will improve task completion rate by >20% compared to basic prompt engineering alone.

**Baseline:** Current CerebroAgent task completion rate (measure first, before intervention).

**Test Design:**
```
Control group:   Agent with basic prompt engineering (current state)
Treatment group: Agent with all four context engineering strategies applied

Task set: 50 representative enterprise tasks across 5 categories
Evaluators: 2 human reviewers blind to condition + automated metrics
Duration: 1 week of evaluation per group
```

**Metrics:**
- Task completion rate (primary)
- Output quality score (1-5 human rating)
- Hallucination rate (fact-checked sample)
- Token cost per task

**Success:** Treatment group task completion rate ≥ control + 20%  
**Failure:** Treatment group improvement < 10% (insufficient to justify complexity)

**Investment if Confirmed:** IMP-001 (Context Engineering Framework) gets P0 priority (already P0 — confirms resource allocation).

**Investment if Failed:** Investigate which of the four strategies contributes most. Implement only high-ROI strategies.

**Source KOs:** TH-AI-0015  
**Best Practices:** BP-CE-0001

---

## EXP-002 — MCP Reduces Agent Tool Integration Time by >50%

**Priority:** P0  
**Status:** READY TO RUN  
**Effort:** S  
**Time-box:** 2 weeks  
**Risk:** LOW

**Hypothesis:**  
Using MCP-compatible tool servers instead of custom API integrations reduces integration development time per tool by >50%.

**Test Design:**
```
Baseline: Time to integrate Tool A using custom API connector (current approach)
Treatment: Time to integrate Tool B using MCP server (if existing MCP server available)
           OR: Time to build MCP server for Tool B vs custom connector for Tool C

Measure: Developer hours from "start integration" to "agent can use tool in production"
Tools to test: 3 representative integrations (internal tool + external SaaS + database)
```

**Success:** MCP integration time ≤ 50% of custom connector time across 3 tools  
**Failure:** MCP integration time > 75% of custom connector time

**Investment if Confirmed:** IMP-003 (MCP Integration Layer) confirmed as highest-leverage infrastructure investment.

**Investment if Failed:** Evaluate hybrid approach: MCP for external tools, custom connectors for deep internal integrations.

**Source KOs:** TH-AI-0010  
**Patterns:** AGENT-PATTERN-0003

---

## EXP-003 — Routing Agent Reduces Wrong-Agent Errors by >80%

**Priority:** P1  
**Status:** READY TO RUN  
**Effort:** S  
**Time-box:** 1 week  
**Risk:** LOW

**Hypothesis:**  
A triage/routing agent that classifies requests before dispatch reduces wrong-agent routing errors by >80% compared to static routing rules.

**Test Design:**
```
Dataset: 100 real requests from Cerebro system logs (diverse types)
Condition A: Static routing rules (current approach)
Condition B: LLM-based triage agent

Metric: % of requests routed to the correct specialist agent
Human review: Label each request's correct destination
```

**Success:** LLM triage agent accuracy ≥ 95% vs static rules accuracy ≤ 75%  
**Failure:** LLM triage accuracy < 85% (insufficient margin over static rules to justify added latency + cost)

**Investment if Confirmed:** IMP-007 (Routing Agent Layer) prioritized.

**Source KOs:** TH-AI-0011  
**Patterns:** AGENT-PATTERN-0002

---

## EXP-004 — PRD-First Coding Reduces Rework by >30%

**Priority:** P1  
**Status:** READY TO RUN  
**Effort:** M  
**Time-box:** 4 weeks (one sprint comparison)  
**Risk:** LOW

**Hypothesis:**  
Following the PRD-First Vibe Coding workflow reduces code rework (revisions after initial generation) by >30% compared to ad-hoc AI code generation.

**Test Design:**
```
Sprint A (control): Engineers use AI coding without PRD requirement
Sprint B (treatment): Engineers follow PRD-First workflow (BP-CODING-0001)

Measure per feature:
- Number of AI generation rounds until acceptable output
- Hours spent on revisions
- Security findings in review (Semgrep)
- Engineer-reported satisfaction (1-5)

Same 3 engineers both sprints. Similar-complexity features.
```

**Success:** PRD-First sprint shows ≥30% reduction in revision hours + ≥1pt satisfaction improvement  
**Failure:** <15% reduction in revision hours

**Investment if Confirmed:** IMP-005 becomes mandatory team standard with enforcement.

**Source KOs:** TH-AI-0013  
**Best Practices:** BP-CODING-0001

---

## EXP-005 — Reflection Loop Improves Report Quality by >25%

**Priority:** P1  
**Status:** READY TO RUN  
**Effort:** S  
**Time-box:** 1 week  
**Risk:** MEDIUM (cost risk if loop doesn't terminate)

**Hypothesis:**  
Adding a single reflection loop (Generator → Critic → Improved Generator) to high-stakes report generation improves human-rated quality by >25% with acceptable cost overhead (<2x).

**Test Design:**
```
Task: Generate 20 enterprise intelligence reports (same topics)
Control: Single-pass generation (no reflection)
Treatment: One reflection loop (max 2 iterations)

Quality evaluation: 3 human reviewers rate each report 1-10
Cost tracking: Token cost per report for each condition
```

**Success:** Treatment quality score ≥ control + 25%; cost overhead ≤ 2x  
**Failure:** Quality improvement < 15% OR cost overhead > 3x

**Investment if Confirmed:** IMP-014 (Reflection Loop Quality Agent) prioritized.

**Risk Mitigation:** Hard cap at 2 iterations maximum. Cost ceiling enforced per loop.

**Source KOs:** TH-AI-0011  
**Patterns:** AGENT-PATTERN-0006

---

## EXP-006 — n8n Prototyping Reduces Workflow Development Time by >40%

**Priority:** P1  
**Status:** PENDING IMP-010  
**Effort:** M  
**Time-box:** 4 weeks  
**Risk:** LOW

**Hypothesis:**  
Prototyping CerebroFlow workflows in n8n before production implementation reduces total development time (prototype + production) by >40% compared to building directly in production.

**Test Design:**
```
Workflow A: Build directly in production CerebroFlow runtime
Workflow B: Prototype in n8n first → then implement in CerebroFlow

Measure: Total developer hours from requirements to production-ready workflow
Same developer. Similar complexity workflows (rate by story points beforehand).
3 pairs of workflows minimum.
```

**Source KOs:** TH-AI-0009  
**Dependencies:** IMP-010

---

## EXP-007 — Semantic Chunking Improves RAG Precision by >15%

**Priority:** P2  
**Status:** READY TO RUN  
**Effort:** S  
**Time-box:** 1 week  
**Risk:** LOW

**Hypothesis:**  
Switching HiveKnowledge from fixed-character chunking to semantic boundary chunking improves retrieval precision@5 by >15%.

**Test Design:**
```
Dataset: 50 enterprise documents + 100 representative queries with known correct answers
Baseline: Fixed character chunking (current: 512 chars, 50 overlap)
Treatment: Semantic chunking (paragraph boundaries + section headers)

Metric: Precision@5 (% of top-5 retrieved chunks containing the correct answer)
```

**Source KOs:** TH-AI-0020  
**Best Practices:** BP-RAG-0001

---

## EXP-008 — Local LLM (Qwen) Viable for Privacy-Sensitive Tasks

**Priority:** P2  
**Status:** READY TO RUN  
**Effort:** S  
**Time-box:** 1 week  
**Risk:** LOW

**Hypothesis:**  
Qwen 2.5 running locally on Mac Studio M4 via Ollama achieves >85% task completion rate on internal document summarization and classification tasks (the primary privacy-sensitive use case).

**Test Design:**
```
Tasks: 50 internal document summarization tasks + 50 classification tasks
Models: Qwen 2.5 (local) vs Claude claude-sonnet-4-5 (baseline)
Metric: Task completion rate, quality score (human), latency per task
Cost: $0 for local vs API cost baseline
```

**Source KOs:** TH-AI-0007  
**Dependencies:** None (requires Mac Studio M4 access)

---

## EXP-009 — Parallel Research Swarm vs Sequential Search

**Priority:** P2  
**Status:** PENDING EXP-001  
**Effort:** S  
**Time-box:** 1 week  
**Risk:** MEDIUM (cost)

**Hypothesis:**  
Parallel research agent swarm (5 simultaneous agents, different sources) produces higher-coverage intelligence reports than sequential single-agent search at <3x cost.

**Test Design:**
```
Task: Competitive intelligence reports on 10 topics
Control: Sequential agent — 5 searches, one at a time
Treatment: Parallel swarm — 5 agents simultaneously, deduplicate + synthesize

Metric: Coverage score (% of known ground-truth facts captured), total cost
```

**Source KOs:** TH-AI-0019  
**Patterns:** AGENT-PATTERN-0005

---

## EXP-010 — Human-in-the-Loop Approval Reduces Error Rate on High-Impact Operations

**Priority:** P2  
**Status:** PENDING IMP-001  
**Effort:** M  
**Time-box:** 30 days of production monitoring  
**Risk:** LOW

**Hypothesis:**  
Adding pre-execution human approval to high-impact agent operations (financial record modification, external communications) reduces error rate on those operations by >90% compared to fully automated execution.

**Test Design:**
```
Baseline: Historical error rate on automated high-impact operations (last 90 days)
Treatment: HITL approval enabled for same operation types

Metric: Error rate per 100 operations (errors = incorrect/unintended executions)
Secondary: Approval time (median, P95) — measures HITL overhead
```

**Source KOs:** TH-AI-0003  
**Best Practices:** BP-AI-0003

---

## Experiments Summary

| ID | Hypothesis | Priority | Status | Time-box |
|---|---|---|---|---|
| EXP-001 | Context engineering +20% quality | P0 | READY | 2 weeks |
| EXP-002 | MCP -50% integration time | P0 | READY | 2 weeks |
| EXP-003 | Routing agent -80% routing errors | P1 | READY | 1 week |
| EXP-004 | PRD-First -30% rework | P1 | READY | 4 weeks |
| EXP-005 | Reflection loop +25% quality | P1 | READY | 1 week |
| EXP-006 | n8n prototyping -40% dev time | P1 | Pending IMP-010 | 4 weeks |
| EXP-007 | Semantic chunking +15% RAG precision | P2 | READY | 1 week |
| EXP-008 | Local Qwen 85%+ viability | P2 | READY | 1 week |
| EXP-009 | Parallel swarm > sequential search | P2 | Pending EXP-001 | 1 week |
| EXP-010 | HITL -90% high-impact errors | P2 | Pending IMP-001 | 30 days |
