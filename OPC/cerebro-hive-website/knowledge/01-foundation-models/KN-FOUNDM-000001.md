# KN-FOUNDM-000001: DeepSeek-R1 — Open-Source Reasoning Model via Pure Reinforcement Learning

```yaml
knowledge_id: "KN-FOUNDM-000001"
title: "DeepSeek-R1 — Open-Source Reasoning via Group Relative Policy Optimization (GRPO)"
version: "1.0"

category: "foundation-models"
subcategory: "reasoning-models"

source_video:
  video_id: "pN17MOfhZJk"
  title: "DeepSeek Just CRUSHED Big Tech AGAIN With JANUS PRO - New SHOCKING AI Model!"
  url: "https://www.youtube.com/watch?v=pN17MOfhZJk"
  publication_date: "2025-01-28"
  # NOTE: This video covers Janus Pro; DeepSeek-R1 is a related but distinct model.
  # R1 knowledge derived primarily from the peer-reviewed paper, not this specific video.

primary_sources:
  - type: arxiv
    url: "https://arxiv.org/abs/2501.12948"
    title: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning"
    authors: ["DeepSeek-AI", "Daya Guo", "Dejian Yang", "et al."]
    date: "2025-01-22"
    accessed: "2026-08-14"
  - type: benchmark
    url: "https://www.nature.com/articles/s41586-025-09422-z"
    title: "DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning"
    authors: ["DeepSeek-AI"]
    date: "2025-PUBLISHED-IN-NATURE-VOL-645"
    accessed: "2026-08-14"
  - type: github
    url: "https://github.com/deepseek-ai/DeepSeek-R1"
    title: "DeepSeek-R1 Official Repository"
    authors: ["DeepSeek-AI"]
    date: "2025-01-22"
    accessed: "2026-08-14"

claim: >
  DeepSeek-R1 demonstrates that strong reasoning capability in LLMs can be achieved
  through pure reinforcement learning (specifically GRPO — Group Relative Policy
  Optimization) without human-annotated chain-of-thought demonstrations. The model
  achieves emergent reasoning behaviors including self-reflection, self-verification,
  and dynamic strategy adaptation during training. DeepSeek-R1 matches or exceeds
  OpenAI o1 performance on mathematical reasoning (MATH-500), coding (Codeforces),
  and scientific problem-solving (AIME) benchmarks. The model is released under MIT
  license with distilled smaller variants (1.5B to 70B parameters) enabling self-hosted
  deployment. Published in Nature, Volume 645 (2025).

claim_type: MEASURED
# Peer-reviewed paper with benchmark results in Nature journal

# ── PROVENANCE ──────────────────────────────────────────────────────────────────
claim_provenance: INDEPENDENTLY_VERIFIED
# Primary source: peer-reviewed paper (arxiv 2501.12948, published Nature Vol 645 2025).
# Benchmark results independently reported across the AI research community.
# MIT license and open weights confirmed on GitHub.

repo_gap_tag: MISSING
# No DeepSeek-R1 integration exists in the Cerebro Nexarch repo.
# services/llm-gateway does not have a DeepSeek provider.
# The model's open-source nature (MIT) and distilled variants make self-hosted
# deployment on HiveCompute viable without per-call API costs.

repo_mapping:
  packages:
    - "packages/llm-providers"
  services:
    - "services/llm-gateway"
    - "services/router-service"
  apps: []
  gap_detail: >
    Two integration paths:
    (1) API integration: Add DeepSeek API provider to llm-gateway;
        route planning/reasoning tasks to DeepSeek-R1 as cost-effective o3 alternative.
    (2) Self-hosted: Deploy distilled R1 variant (7B or 14B) on HiveCompute;
        enables reasoning without per-token API cost for high-volume tasks.
    router-service should add routing policy: "planning + multi-step reasoning → R1 class models".

technical_mechanism: >
  DeepSeek-R1's training uses GRPO (Group Relative Policy Optimization), which:
  1. Samples a group of candidate responses per question from the policy model
  2. Scores each using verifiable reward signals (correct/incorrect for math, code execution for coding)
  3. Normalizes scores within the group (group-relative) to compute advantages
  4. Updates policy via PPO-like gradient to increase probability of better responses
  
  No human-annotated chain-of-thought examples are required. Emergent behaviors:
  - Self-reflection: model revisits and corrects earlier steps
  - Self-verification: model checks its own answer
  - Dynamic strategy adaptation: model switches approaches when stuck
  
  Chain-of-thought reasoning tokens appear in the model output before the final answer,
  making the reasoning process inspectable and auditable.
  
  Distillation: Smaller models (1.5B–70B) are trained to mimic R1's reasoning patterns,
  transferring capability at a fraction of compute cost.

problem_solved: >
  Eliminates the expensive human-labeling bottleneck for training reasoning models.
  Makes frontier-class reasoning capability available open-source (MIT) and
  self-hostable — directly challenging the cost model of OpenAI o1/o3 API access.
  Enables high-volume reasoning tasks at infrastructure cost rather than per-token cost.

architecture_pattern: "Reasoning Model via RL + Chain-of-Thought"

implementation_requirements:
  - requirement: "Add DeepSeek API provider to services/llm-gateway (api.deepseek.com/v1)"
  - requirement: "Add routing policy in router-service: multi-step reasoning → R1 class"
  - requirement: "Configure context window handling (R1 supports 128K context)"
  - requirement: "Handle extended thinking tokens in response parsing (may be 10K-50K tokens before answer)"
  - requirement: "For self-hosted: evaluate distilled variant size vs. quality tradeoff; 14B recommended for balance"
  - requirement: "Evaluate inference cost vs. OpenAI o3-mini for same task type"

advantages:
  - "MIT license — zero licensing cost; self-hostable on HiveCompute"
  - "o1-class reasoning performance at fraction of API cost (API pricing ~$0.14/1M tokens as of 2025)"
  - "Thinking tokens provide inspectable reasoning chain — valuable for enterprise audit"
  - "Distilled variants enable edge/embedded deployment on Digital Twin nodes"
  - "Open weights allow fine-tuning for domain-specific reasoning (industrial, legal, financial)"
  - "Proven in peer-reviewed Nature paper — not vendor marketing"

limitations:
  - "Extended thinking tokens increase latency and context cost on long reasoning chains"
  - "Chinese lab: some enterprise customers may have data sovereignty / jurisdiction concerns"
  - "Reasoning benchmark performance does not guarantee task performance in all domains"
  - "Distilled variants sacrifice some capability for size — evaluate carefully per use case"
  - "Self-hosted deployment requires GPU infrastructure investment (HiveCompute)"

risks:
  - "Geopolitical risk: future export controls could affect model access or API availability"
  - "Thinking token budget: unconstrained reasoning can produce very long (expensive) outputs"
  - "Data confidentiality: sending sensitive data to DeepSeek API (Chinese jurisdiction) may violate enterprise policy"
  - "Training data provenance: as with all LLMs, DeepSeek-R1 training data is not fully disclosed"

maturity: PRODUCTION
# Published in peer-reviewed Nature journal; MIT release with GitHub repo; API available.

evidence_level: A
# Peer-reviewed paper (Nature Vol 645, 2025); open weights; independent reproduction

cerebro_relevance:
  products:
    - "HiveCompute"
    - "CerebroAgent"
    - "services/router-service"
  eios_layers: [2, 3, 7]
  score: 8.5
  rationale: >
    DeepSeek-R1 is the primary cost-competitive alternative to OpenAI o3 for reasoning
    tasks. Layer 2 (AI Infrastructure): self-hosted distilled variants reduce inference
    cost dramatically. Layer 3 (Agent Runtime): planning agents that decompose complex
    tasks benefit from R1-class models. Layer 7 (LLMOps): router-service should route
    planning tasks to reasoning models and execution tasks to faster/cheaper models.
    The MIT license and open weights make this an immediate candidate for HiveCompute
    self-hosted offering. Data sovereignty concern is the main brake.

scoring:
  technical_value: 9.0
  strategic_value: 8.5
  customer_value: 8.0
  revenue_potential: 8.0       # cost reduction for HiveCompute offering
  engineering_leverage: 8.5
  differentiation: 7.5         # open source = competitors can also adopt it
  evidence_strength: 9.5       # A-grade: peer-reviewed Nature paper
  technical_maturity: 9.0      # production API + open weights
  implementation_ease: 7.5     # API integration is easy; self-hosted harder
  security_confidence: 6.0     # Chinese jurisdiction data concern
  cerebro_priority_score: 81.5

priority: P1
horizon: NOW
# API integration is fast (days); routing policy is clear. Self-hosted HiveCompute
# deployment is medium-term (requires GPU infrastructure). Begin with API integration.

recommended_action: >
  1. Immediately: Add DeepSeek API provider to services/llm-gateway.
     Endpoint: api.deepseek.com/v1; model: deepseek-reasoner (R1).
  
  2. Add routing rule in router-service: tasks with planning/decomposition intent
     → route to R1 class (DeepSeek-R1 or o3-mini for US-jurisdiction tenants).
  
  3. Enterprise tenant policy: default route to OpenAI o3-mini for tenants with
     data sovereignty requirements; allow explicit opt-in to DeepSeek for cost savings.
  
  4. Evaluate distilled 14B variant on HiveCompute for medium-complexity reasoning
     tasks (evaluate vs. API cost on sample workload).
  
  5. Create EXP-0002: "Reasoning Model Routing — R1 vs o3-mini for Planning Tasks"
     targeting: 30% cost reduction on planning tasks, <10% quality regression.

related_components:
  - "services/llm-gateway"
  - "services/router-service"

related_knowledge:
  - "KN-AGENT-000001"   # Always-on agents need cost-effective reasoning model access

discovered_at: "2026-08-14"
verified_at: "2026-08-14"
last_reviewed_at: "2026-08-14"
technology_version: "DeepSeek-R1 (arXiv 2501.12948, January 2025); API: deepseek-reasoner"
supersedes: ""
superseded_by: ""

validity_status: CURRENT
status: UNDERSTOOD
```
