# Product Specification: HivePlanner™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 3 — AI Runtime  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HivePlanner™** is the strategic planning intelligence layer — the AI system that helps enterprises turn ambiguous goals into executable plans. It bridges the gap between "we want to achieve X" and "here is exactly what we need to do, in what order, with what resources, by when."

HivePlanner is consumed by HiveAgents (to plan complex multi-step tasks before executing them), by CerebroProjects (to generate project plans from objective statements), and directly by enterprise planners via the Planning Copilot.

---

## 2. Core Capabilities

### 2.1 Goal Decomposition
Given a high-level goal, HivePlanner breaks it into executable sub-goals and tasks:

**Input**
```json
{
  "goal": "Launch CerebroHive in the German market by Q1 2027",
  "constraints": [
    "Budget: €2.5M",
    "Headcount: no new hires approved until Q4 2026"
  ],
  "context": {
    "current_state": "No DACH presence; product is EU-data-residency capable",
    "known_risks": ["GDPR localization requirements", "local competitor incumbent"]
  }
}
```

**Output**
```json
{
  "plan": {
    "goal": "Launch CerebroHive in Germany by Q1 2027",
    "phases": [
      {
        "name": "Compliance & Legal Readiness",
        "duration": "8 weeks",
        "parallel": false,
        "tasks": [
          { "task": "Complete German-language DPA template", "owner": "Legal", "effort": "3 days" },
          { "task": "Engage German counsel for GDPR audit", "owner": "Legal", "effort": "2 weeks" },
          { "task": "Certify EU data residency for all customer data", "owner": "Engineering", "effort": "3 weeks" }
        ]
      },
      {
        "name": "Go-to-Market Preparation",
        "duration": "10 weeks",
        "parallel": true,
        "tasks": [...]
      }
    ],
    "critical_path": ["Compliance & Legal Readiness", "Partner Channel Recruitment", "Launch"],
    "risk_register": [
      { "risk": "GDPR audit takes longer than estimated", "probability": "medium", "impact": "high", "mitigation": "Start early; use pre-approved DPA templates" }
    ]
  }
}
```

### 2.2 Planning Algorithms
HivePlanner uses a hybrid reasoning approach:

**LLM-Driven Decomposition**
- Large language model with planning-specialized system prompt.
- Few-shot examples from the enterprise's historical successful plans (retrieved from HiveMemory).
- Chain-of-thought reasoning trace exposed in the API response (explainability).

**Constraint Satisfaction**
- Resource constraints (budget, headcount, time) enforced as hard constraints.
- Dependency resolution: topological sort ensures dependent tasks are ordered correctly.
- Conflict detection: if two tasks require the same scarce resource simultaneously, conflicts are surfaced.

**Historical Pattern Matching**
- HivePlanner retrieves similar past plans from HiveKnowledge (organizational plan history).
- "We've launched in France before — here's what worked, here's what didn't."
- Task duration estimates informed by actuals from historical CerebroProjects data.

### 2.3 Plan Evaluation
Before returning a plan to the caller, HivePlanner evaluates it on:

| Dimension | Check |
|---|---|
| Completeness | Are all necessary steps included to achieve the goal? |
| Feasibility | Is the plan achievable within the stated constraints? |
| Risk coverage | Are major risks addressed in the plan? |
| Dependency validity | Are task dependencies logically correct? |
| Duration realism | Are task durations realistic based on historical data? |

Evaluation scores surfaced to the caller alongside the plan. Low-scoring plans include specific improvement suggestions.

### 2.4 Adaptive Re-Planning
Plans rarely survive contact with reality unchanged. HivePlanner supports continuous re-planning:

- **Progress input**: Feed actual task completions and delays back to HivePlanner.
- **Re-planning trigger**: When actual progress diverges significantly from plan (e.g., milestone slips by >20%), HivePlanner generates a revised plan.
- **Impact analysis**: "If Phase 1 completes 2 weeks late, which later milestones are affected and by how much?"
- **Recovery options**: Multiple recovery plan variants generated (catch-up options, scope reduction options, timeline extension options) with trade-off analysis.

### 2.5 Planning Copilot (Interactive Interface)
Conversational planning interface for enterprise planners:

```
Planner: "I need to plan a cloud migration for our ERP system."

HivePlanner: "To build a useful plan, I need a few inputs. 
How many applications are in scope? What's the target cloud provider? 
What's the budget and timeline? Are there blackout periods 
(e.g., financial year-end freeze)?"

Planner: "About 3 applications, Azure, $800K budget, 9 months, 
Q4 is frozen."

HivePlanner: [Generates structured plan with phases, tasks, 
resource requirements, risk register, and timeline 
— Q4 automatically marked as no-deployment period]

Planner: "Add a parallel workstream for the security review."

HivePlanner: [Updates plan with new workstream, recalculates 
critical path, identifies resource conflicts]
```

---

## 3. Integration with HiveAgents
When a complex agent task requires planning before execution:

```python
# Agent invokes HivePlanner as a tool
plan = await tools.hive_planner.create_plan(
    goal="Investigate and resolve the data quality issue in the revenue pipeline",
    constraints={"max_tool_calls": 30, "max_runtime_minutes": 20},
    context={"pipeline": "salesforce_opportunities", "issue": "duplicate records"}
)

# Agent executes the plan step by step
for step in plan.steps:
    result = await tools.execute(step)
    await tools.hive_planner.report_progress(plan.id, step.id, result)
```

HivePlanner provides the structure; HiveAgents provides the execution capability.

---

## 4. Technology Stack

| Component | Technology |
|---|---|
| Decomposition Engine | LLM (via HiveModels) + custom planning prompt library |
| Constraint Solver | Google OR-Tools (resource constraint satisfaction) |
| Historical Retrieval | HiveVector (semantic search over historical plans) |
| Plan Storage | PostgreSQL (versioned plan objects) |
| Evaluation Engine | LLM-as-judge (via HiveEvaluation patterns) |
| API | FastAPI (Python) |

---

## 5. SLAs

| Metric | Target |
|---|---|
| Plan generation latency (simple, <10 tasks) | <10 seconds |
| Plan generation latency (complex, 10–50 tasks) | <60 seconds |
| Re-planning latency | <30 seconds |
| Plan evaluation completeness | 100% (all 5 dimensions scored) |
| API availability | 99.9% |

---

## 6. Roadmap

| Milestone | Timeline |
|---|---|
| Monte Carlo simulation (probabilistic timeline with confidence intervals) | Q4 2026 |
| Cross-enterprise plan templates (industry-specific plan blueprints from anonymized successful plans) | Q1 2027 |
| Autonomous plan execution monitoring (HivePlanner monitors its own plans' execution in CerebroProjects) | Q2 2027 |
| Strategic alignment scoring (how well does this plan advance our declared OKRs?) | Q2 2027 |
