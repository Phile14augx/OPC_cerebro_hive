# KN-INFRA-000002: Reasoning Model Routing — o3-mini vs DeepSeek-R1 vs Standard LLM

```yaml
knowledge_id: "KN-INFRA-000002"
title: "Reasoning Model Routing Policy — Task-Type-Based LLM Selection in router-service"
version: "1.0"

category: "ai-infrastructure"
subcategory: "model-routing"

source_video:
  video_id: "NONE"
  title: "CEREBRO_RECOMMENDATION — derived from KN-FOUNDM-000001 (DeepSeek-R1)"
  url: ""
  publication_date: ""
  # NOTE: This is a CEREBRO_RECOMMENDATION knowledge object. The routing policy
  # is synthesized from independently verified facts in KN-FOUNDM-000001.
  # No specific @airevolutionx video covers model routing policy.

primary_sources:
  - type: docs
    url: "https://api.deepseek.com/v1"
    title: "DeepSeek API — deepseek-reasoner model endpoint"
    authors: ["DeepSeek AI"]
    date: "2025-ONGOING"
    accessed: "2026-08-14"
  - type: docs
    url: "https://platform.openai.com/docs/models/o3-mini"
    title: "OpenAI o3-mini — Reasoning Model API Documentation"
    authors: ["OpenAI"]
    date: "2025-ONGOING"
    accessed: "2026-08-14"

claim: >
  CEREBRO_RECOMMENDATION: services/router-service should implement a three-tier model
  routing policy based on task type, not just cost. Tasks requiring multi-step reasoning,
  planning, or decomposition should be routed to reasoning-class models (DeepSeek-R1 or
  OpenAI o3-mini). Tasks requiring fast text generation, summarization, or simple
  classification should be routed to standard LLMs (GPT-4o, Claude Sonnet). Tasks requiring
  long-form generation or coding should be routed to code-optimized models. This routing
  policy enables approximately 30% cost reduction on reasoning-heavy planning tasks
  (routing to DeepSeek-R1 instead of GPT-4) while maintaining equivalent or better output
  quality, subject to a data sovereignty gate for enterprise tenants.

claim_type: MODELED
# CEREBRO_RECOMMENDATION: derived from KN-FOUNDM-000001 facts (DeepSeek-R1 benchmark
# parity with o1; $0.14/1M token cost; MIT license). The 30% cost reduction figure
# is a model estimate, not a measured Cerebro result. An experiment (EXP-0002) is
# required to validate this estimate against actual Cerebro workloads.

# ── PROVENANCE ──────────────────────────────────────────────────────────────────
claim_provenance: CEREBRO_RECOMMENDATION
# This routing policy is an engineering recommendation synthesized from:
# - KN-FOUNDM-000001: DeepSeek-R1 benchmark parity with OpenAI o1 (INDEPENDENTLY_VERIFIED, A-grade)
# - Industry standard practice: task-type routing is common in LLMOps
# - Cerebro repository forensics: services/router-service exists as routing layer
# Evidence for the routing policy itself: MODELED (requires EXP-0002 to validate).

repo_gap_tag: PARTIAL
# services/router-service exists in the Cerebro Nexarch repository.
# Current status: model routing service is present (in TRIAL ring).
# Gap: no task-type classification routing policy is confirmed implemented.
# The router-service likely routes by cost or model name, not by task semantics.
# Implementation needed: task intent classifier → model tier selection → model selection.

repo_mapping:
  packages:
    - "packages/agent-sdk"
  services:
    - "services/router-service"
    - "services/llm-gateway"
    - "services/governance-api"
  apps: []
  gap_detail: >
    Three components needed in router-service:
    
    (1) Task Intent Classifier: lightweight classifier (few-shot prompting with fast model)
        categorizes incoming LLM requests into task types:
        PLANNING — multi-step task decomposition, complex reasoning
        CODING — code generation, debugging, code review
        GENERATION — document writing, summarization, creative text
        CLASSIFICATION — categorization, extraction, simple QA
        CONVERSATION — short interactive turns, clarification
    
    (2) Model Tier Table:
        PLANNING → reasoning-class (DeepSeek-R1 or o3-mini)
        CODING → code-optimized (DeepSeek-R1, GPT-4o, or Claude Sonnet)
        GENERATION → standard LLM (GPT-4o, Claude Sonnet)
        CLASSIFICATION → fast LLM (GPT-4o-mini, Claude Haiku, DeepSeek-V3)
        CONVERSATION → fast LLM (GPT-4o-mini, Claude Haiku)
    
    (3) Data Sovereignty Gate: per-tenant policy enforced by governance-api:
        data_sovereignty_required: true → block DeepSeek (Chinese jurisdiction);
        route PLANNING tasks to OpenAI o3-mini instead of DeepSeek-R1
        data_sovereignty_required: false → allow DeepSeek-R1 for PLANNING tasks

technical_mechanism: >
  ROUTING ARCHITECTURE:
  
  Request flow:
  agent-sdk LLM call → router-service → [task classifier] → [model tier selection]
  → [data sovereignty gate] → llm-gateway → [model provider API]
  
  TASK CLASSIFICATION (lightweight, <100ms):
  Option A: Rule-based — agent-sdk annotates requests with task_type hint
    advantages: zero latency, zero cost, predictable
    disadvantages: requires agent developer to annotate correctly
  Option B: LLM classifier — fast model (GPT-4o-mini) classifies intent from prompt
    advantages: automatic; catches unannotated requests
    disadvantages: adds 50–200ms; costs ~$0.0001 per classification call
  Recommendation: Option A (agent annotation) as primary; Option B as fallback.
  
  MODEL SELECTION TABLE (v1 recommendation):
  Task Type       | Default Model        | Data-Sovereign Fallback | Cost Tier
  PLANNING        | deepseek-reasoner    | o3-mini                | HIGH
  CODING          | deepseek-reasoner    | claude-sonnet-4-5      | HIGH
  GENERATION      | gpt-4o               | claude-sonnet-4-5      | MEDIUM
  CLASSIFICATION  | gpt-4o-mini          | gpt-4o-mini            | LOW
  CONVERSATION    | gpt-4o-mini          | claude-haiku-3-5       | LOW
  
  COST IMPACT (estimated, pre-EXP-0002 validation):
  Current assumption: all agent LLM calls routed to GPT-4 class ($10–15/1M tokens)
  Post-routing: PLANNING tasks → DeepSeek-R1 ($0.14/1M tokens)
  If 30% of agent calls are PLANNING type → ~20–25% overall LLM cost reduction.
  EXP-0002 must validate the 30% PLANNING task fraction assumption.
  
  DATA SOVEREIGNTY GATE:
  Per-tenant flag: data_sovereignty_required (boolean, stored in governance-api)
  If true: all requests blocked from Chinese-jurisdiction APIs (DeepSeek)
  If false: DeepSeek-R1 allowed for cost optimization
  Default: data_sovereignty_required = true for new tenants (safe default)
  Tenant admin can opt out explicitly (requires acceptance of data jurisdiction terms)

problem_solved: >
  Without task-type routing, all LLM calls use the same model regardless of whether
  the task requires reasoning capability or not. This wastes expensive reasoning compute
  on simple tasks and under-invests reasoning on complex planning tasks.
  The performance gap between reasoning-class models (R1, o3-mini) and standard models
  (GPT-4o) on complex multi-step reasoning is substantial (see KN-FOUNDM-000001 benchmarks).
  Conversely, reasoning-class models are slower and more expensive for simple tasks where
  a fast model suffices. Task-type routing optimizes both cost and quality simultaneously.

architecture_pattern: "Task-Adaptive LLM Routing (LLMOps / Model Router Pattern)"

implementation_requirements:
  - requirement: "Task type annotation in agent-sdk: TaskType enum (PLANNING, CODING, GENERATION, CLASSIFICATION, CONVERSATION)"
  - requirement: "Router rule table in router-service: task_type → [model_tier, fallback_model_tier]"
  - requirement: "Data sovereignty gate: per-tenant flag in governance-api; enforced in router-service"
  - requirement: "Latency budget enforcement: PLANNING tasks accept higher latency; CONVERSATION tasks require <2s"
  - requirement: "Cost tracking per task type: report in governance-api dashboard"
  - requirement: "EXP-0002 validation: measure actual cost reduction and quality impact before production rollout"
  - requirement: "Add DeepSeek API provider to services/llm-gateway (api.deepseek.com/v1, deepseek-reasoner model)"

advantages:
  - "Estimated 20–30% LLM cost reduction without quality regression (pending EXP-0002)"
  - "Improved planning quality: reasoning-class models outperform standard on decomposition tasks"
  - "Infrastructure already exists: router-service + llm-gateway are the target components"
  - "Data sovereignty gate makes DeepSeek adoption safe for enterprise tenants by default"
  - "Extensible: new model tiers (e.g., self-hosted DeepSeek distilled on HiveCompute) plug into the same routing table"

limitations:
  - "Task classification accuracy determines routing quality — wrong classification wastes cost"
  - "Reasoning models have higher latency (extended thinking tokens) — unsuitable for interactive chat"
  - "DeepSeek-R1 extended thinking tokens can produce 10K–50K tokens before the final answer — parsing required"
  - "Data sovereignty gate blocks cost savings for all tenants by default — requires explicit opt-in"
  - "30% cost reduction estimate is unvalidated — EXP-0002 is required before relying on this figure"

risks:
  - "Quality regression if PLANNING tasks are incorrectly classified as GENERATION (routed to cheaper model)"
  - "Latency spikes: agent interactive sessions accidentally routed to reasoning model → poor UX"
  - "DeepSeek API reliability: single provider for PLANNING tasks creates a dependency"
  - "Thinking token budget: unconstrained DeepSeek-R1 reasoning can produce very expensive outputs"

maturity: PRODUCTION
# Model routing is a well-established LLMOps pattern. DeepSeek-R1 and o3-mini APIs
# are production-stable. The routing policy itself is a CEREBRO_RECOMMENDATION that
# requires experimental validation (EXP-0002) before production deployment.

evidence_level: B
# Evidence for component capabilities: A (DeepSeek-R1 benchmarks, KN-FOUNDM-000001).
# Evidence for routing policy effectiveness: MODELED (requires EXP-0002 to validate).
# Overall grade: B (strong foundation; specific cost/quality impact unvalidated).

cerebro_relevance:
  products:
    - "CerebroAgent"
    - "HiveCompute"
    - "services/router-service"
  eios_layers: [2, 3, 7]
  score: 8.5
  rationale: >
    Layer 2 (AI Infrastructure): router-service is the LLM infrastructure routing layer.
    Task-type routing directly reduces infrastructure cost (LLM API spend).
    Layer 3 (Agent Runtime): planning agents (multi-step task decomposition) are the
    primary CerebroAgent use case — these benefit most from reasoning-class models.
    Layer 7 (LLMOps): routing policy is an operational concern; requires telemetry,
    cost tracking, and A/B testing capability in governance-api.

scoring:
  technical_value: 8.5
  strategic_value: 8.0
  customer_value: 7.5    # customers benefit indirectly through cost and quality
  revenue_potential: 8.5  # 20–30% cost reduction directly increases Cerebro margin
  engineering_leverage: 9.0   # router-service + llm-gateway already exist
  differentiation: 7.5
  evidence_strength: 8.0  # B-grade: component evidence A; policy estimate unvalidated
  technical_maturity: 8.5
  implementation_ease: 7.5    # routing table + data sovereignty gate are straightforward
  security_confidence: 8.0    # data sovereignty gate is the security control
  cerebro_priority_score: 81.0

priority: P1
horizon: NOW
# Prerequisite: Add DeepSeek-R1 provider to llm-gateway (depends on KN-FOUNDM-000001
# recommended action step 1). Then implement routing table. Run EXP-0002 before
# full production rollout. Both steps are low-risk and high-leverage.

recommended_action: >
  Step 1: Add DeepSeek API provider to services/llm-gateway.
    Endpoint: api.deepseek.com/v1; models: deepseek-reasoner (R1), deepseek-chat (V3)
    Handle extended thinking token parsing: strip <think>...</think> for final answer;
    optionally expose thinking tokens as agent scratchpad.
  
  Step 2: Add TaskType annotation to packages/agent-sdk:
    export enum TaskType { PLANNING, CODING, GENERATION, CLASSIFICATION, CONVERSATION }
    agent.createCompletion({ ..., taskType: TaskType.PLANNING })
  
  Step 3: Implement routing table in services/router-service.
    Rule: taskType === PLANNING && !tenant.dataSovereigntyRequired → deepseek-reasoner
    Rule: taskType === PLANNING && tenant.dataSovereigntyRequired → o3-mini
    Default: gpt-4o-mini for CLASSIFICATION, CONVERSATION; gpt-4o for GENERATION.
  
  Step 4: Run EXP-0002 (see knowledge/18-experiments/EXP-0002.md):
    Measure: cost reduction, quality regression, latency impact.
    Gate production rollout on: >15% cost reduction, <5% quality regression.
  
  Step 5: Add thinking token budget: max_thinking_tokens: 10000 on DeepSeek-R1 calls.
    Prevents runaway token costs on simple planning tasks.

related_components:
  - "services/router-service"
  - "services/llm-gateway"
  - "services/governance-api"

related_knowledge:
  - "KN-FOUNDM-000001"   # DeepSeek-R1 benchmarks and integration path
  - "KN-AGENT-000001"    # Always-on agents are the primary PLANNING task consumers

discovered_at: "2026-08-14"
verified_at: "2026-08-14"
last_reviewed_at: "2026-08-14"
technology_version: "CEREBRO_RECOMMENDATION v1.0 — derived from KN-FOUNDM-000001 (2026-08-14)"
supersedes: ""
superseded_by: ""

validity_status: CURRENT
status: UNDERSTOOD
```
