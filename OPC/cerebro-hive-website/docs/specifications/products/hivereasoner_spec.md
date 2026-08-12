# Product Specification: HiveReasoner™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 3 — AI Runtime  
**Security Classification:** Tier 2 — Business Critical

---

## 1. Product Overview

**HiveReasoner™** is the advanced reasoning runtime — the AI subsystem that handles tasks requiring multi-step logical inference, causal analysis, mathematical reasoning, and structured decision-making that exceed the reliable capabilities of a single LLM call. It wraps language models with structured reasoning scaffolds, verification loops, and confidence calibration.

Where standard LLM calls are appropriate for synthesis and generation, HiveReasoner is invoked when correctness matters — financial calculations, compliance determinations, diagnostic decisions, risk assessments.

---

## 2. Core Reasoning Modes

### 2.1 Chain-of-Thought with Verification
For complex multi-step problems where each step must be correct before proceeding:

```
Problem: "Determine whether Supplier X's payment terms change from Net-30 
to Net-45 violates our procurement policy and calculate the cash flow impact."

HiveReasoner Steps:
  Step 1: Retrieve current procurement policy (tool: search policy library)
  Step 2: Extract relevant payment term policy (reasoning: "Policy section 4.2 
          states vendor payment terms >Net-30 require CFO approval for spend >$50K/yr")
  Step 3: Retrieve Supplier X annual spend (tool: query CerebroERP)
  Step 4: Apply rule: spend=$240K > $50K threshold → CFO approval required
  Step 5: Calculate cash flow impact: 
          (Net-45 - Net-30) = 15 additional days × ($240K/365) = $9,863 additional 
          working capital requirement
  
  Conclusion: POLICY VIOLATION — CFO approval required. 
  Cash flow impact: +$9,863 working capital requirement.
  Confidence: HIGH (policy text unambiguous; calculation exact)
```

- Each step's output is verified before proceeding to the next.
- Mathematical steps verified by code execution (Python) rather than LLM calculation.
- Final answer includes full reasoning chain + confidence level + cited sources.

### 2.2 Constitutional AI Reasoning (Self-Critique)
For decisions with significant consequences, HiveReasoner applies a self-critique loop:

1. **Generate**: LLM produces initial answer.
2. **Critique**: A second LLM call critiques the answer for logical errors, missing considerations, and unsupported claims.
3. **Revise**: Original answer revised based on critique.
4. **Validate**: Final validation check against stated constraints and known facts.

Used for: contract interpretation, compliance determinations, risk assessments, medical information synthesis (CerebroHealth).

### 2.3 Multi-Agent Debate
For high-stakes decisions with genuine uncertainty: multiple independent reasoning agents argue different positions, then a judge agent synthesizes:

- **Proponent**: Argues for the affirmative position with supporting evidence.
- **Opponent**: Argues against, identifies weaknesses in proponent's reasoning.
- **Neutral**: Presents balanced analysis without advocacy.
- **Judge**: Weighs arguments, identifies strongest evidence, renders conclusion with confidence level.

Used for: strategic decisions, ambiguous regulatory interpretations, complex risk trade-offs.

### 2.4 Formal Verification (Rule-Based)
For deterministic reasoning (compliance checks, policy enforcement, eligibility determination):
- Business rules expressed in a structured format (decision tables, rule sets).
- HiveReasoner evaluates rules against facts deterministically (no LLM involved).
- Result is fully traceable: which rule fired, which fact triggered it.
- Integrated with HiveGovern's OPA policy engine for cross-platform rule enforcement.

### 2.5 Mathematical Reasoning
HiveReasoner never lets an LLM compute math that a calculator can verify:
- Mathematical expressions extracted from the LLM's reasoning trace.
- Expressions evaluated by Python (sympy for symbolic math, numpy for numerical).
- Results fed back into the reasoning chain as verified facts.
- Financial calculations always delegated to the calculation engine — LLM provides the formula, code verifies the number.

---

## 3. Confidence Calibration

Every HiveReasoner output includes calibrated confidence:

| Confidence Level | Meaning | Typical Action |
|---|---|---|
| HIGH (>85%) | Strong evidence, clear reasoning, verified | Auto-proceed |
| MEDIUM (60–85%) | Good evidence but some uncertainty | Proceed with logging; human review on significant actions |
| LOW (40–60%) | Significant uncertainty; multiple interpretations possible | Require human review |
| INSUFFICIENT (<40%) | Cannot reach conclusion with available information | Escalate; request more information |

Confidence is not self-reported by the LLM — it is computed from: source citation coverage, reasoning step verification success rate, agreement across debate agents (if used), and historical accuracy on similar question types.

---

## 4. Use Case Examples

### Compliance Determination
```
Input: "Does this contract clause require us to notify authorities 
within 72 hours of a data breach?"

HiveReasoner:
  1. Retrieve applicable regulations (GDPR, CCPA, sector-specific) for this customer's jurisdiction
  2. Classify contract clause type (data processing agreement)
  3. Apply GDPR Article 33 requirements (72-hour notification if breach affects EU residents)
  4. Check whether customer has EU resident data (query CerebroCustomer360)
  5. Render determination: YES — 72-hour notification required (GDPR Art. 33)
  Confidence: HIGH | Sources: [GDPR Art. 33 text, contract clause 7.2, customer data residency record]
```

### Financial Risk Assessment
```
Input: "Should we approve this $2.1M credit line for Acme Corp?"

HiveReasoner:
  1. Retrieve Acme Corp financial statements (tool: retrieve from HiveLake)
  2. Calculate key ratios: D/E ratio, current ratio, interest coverage
  3. Compare to credit policy thresholds
  4. Retrieve payment history from CerebroERP
  5. Check adverse news (tool: web search)
  6. Debate: Proponent (approve: ratios within policy, good history) vs. Opponent (caution: D/E elevated)
  7. Render: CONDITIONAL APPROVAL — approved at $1.5M; re-evaluate at 6 months
  Confidence: MEDIUM | Reasoning: [full chain]
```

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Reasoning Orchestration | Python + LangGraph (reasoning step graph) |
| LLM Backend | HiveModels (reasoning-optimized models: o1, Claude, Gemini) |
| Math Verification | Python (sympy, numpy) in sandboxed execution |
| Rule Engine | OPA (formal rule evaluation) |
| Knowledge Retrieval | HiveVector + HiveKnowledge (fact retrieval) |
| Confidence Computation | Custom probabilistic model (calibrated on historical outcomes) |
| API | FastAPI (Python) |

---

## 6. SLAs

| Metric | Target |
|---|---|
| Simple reasoning (single CoT, no debate) | <30 seconds |
| Constitutional reasoning (2-pass) | <90 seconds |
| Multi-agent debate | <3 minutes |
| Math verification accuracy | 100% (always correct vs. LLM's potentially-wrong calculation) |
| Confidence calibration (ECE score) | <0.08 (well-calibrated) |
| API availability | 99.9% |

---

## 7. Roadmap

| Milestone | Timeline |
|---|---|
| Formal proof generation (for mathematical theorems and logical proofs with machine-verifiable output) | Q1 2027 |
| Causal reasoning (distinguish correlation from causation in data analysis tasks) | Q1 2027 |
| Uncertainty quantification (Bayesian confidence intervals rather than point confidence estimates) | Q2 2027 |
| Domain-specific reasoning modules (legal, medical, financial — fine-tuned on domain corpora) | Q2 2027 |
