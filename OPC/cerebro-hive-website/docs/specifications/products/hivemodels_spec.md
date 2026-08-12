# Product Specification: HiveModels™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 3 — AI Runtime  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveModels™** is the unified model registry, serving infrastructure, and lifecycle management platform for all AI models in the CerebroHive Intelligence Mesh. It abstracts away the complexity of multi-provider LLM integration, fine-tuning, deployment, and inference routing — so every product in the platform calls a single, stable API regardless of which model runs underneath.

The core value: model providers change, prices change, capabilities improve. HiveModels insulates every product from those changes behind a stable interface.

---

## 2. Supported Model Types

| Type | Examples | Use Cases |
|---|---|---|
| Large Language Models (LLM) | GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro | Chat, reasoning, code generation |
| Embedding Models | text-embedding-3-large, E5-large, BGE-M3 | Vector search, RAG, semantic similarity |
| Vision Models | GPT-4o vision, Claude vision | Document extraction, image analysis, visual QA |
| Speech Models | Whisper (transcription), ElevenLabs (TTS) | Call intelligence, voice interfaces |
| Classifier Models | Custom BERT classifiers, fine-tuned models | Prompt injection detection, content classification, NER |
| Reranking Models | MiniLM cross-encoder, Cohere Rerank | RAG re-ranking, search quality improvement |
| Image Generation | DALL-E 3, Stable Diffusion | Creative content, document illustration |
| Fine-tuned Models | Tenant-specific fine-tunes of base models | Domain-specific accuracy improvements |

---

## 3. Core Capabilities

### 3.1 Unified Inference API
Single API surface regardless of underlying model or provider:

```http
POST /v1/models/chat
Authorization: Bearer {hive_token}

{
  "model": "gpt-4o",          // or "claude-sonnet", "gemini-pro", etc.
  "messages": [
    { "role": "system", "content": "You are a financial analyst." },
    { "role": "user", "content": "Summarize Q3 revenue trends." }
  ],
  "temperature": 0.1,
  "max_tokens": 1000,
  "stream": true               // SSE streaming supported
}
```

**Provider abstraction**: The caller uses model IDs (e.g., `"gpt-4o"`) but HiveModels resolves this to the correct provider API, handles authentication, and normalizes the response format. Switching from GPT-4o to Claude requires changing one string — no application code change.

**Routing modifiers**:
```json
{
  "model": "auto",                    // HiveModels selects best model for the task
  "model_hints": {
    "capability": "code_generation",  // optimize for code tasks
    "cost_tier": "standard",          // not "premium" or "economy"
    "latency": "low"                  // prefer faster models
  }
}
```

### 3.2 Model Registry
Central catalog of all available models:
- Provider metadata: provider, model version, context length, capabilities, pricing.
- Deployment status: enabled/disabled per tenant, per use case.
- Performance benchmarks: latency P50/P95/P99, throughput, quality scores from HiveEvaluation.
- Cost tracking: $/1K input tokens and $/1K output tokens, updated when providers change pricing.

**Model aliasing**: Stable aliases that route to the recommended model for a capability:
- `hive:chat:default` → currently routes to Claude 3.5 Sonnet
- `hive:embed:default` → currently routes to text-embedding-3-large
- `hive:code:default` → currently routes to GPT-4o
- Alias targets updated centrally — applications using aliases automatically get model improvements.

### 3.3 Fine-Tuning Pipeline
Managed fine-tuning for tenant-specific model adaptation:

**Fine-Tuning Workflow**
1. Dataset preparation: upload training data (JSONL format) to HiveLake. HiveModels validates format and quality.
2. Experiment configuration: base model, hyperparameters, evaluation split.
3. Training job: submitted to HiveCompute (GPU workloads). Progress tracked in real-time.
4. Evaluation: automatic HiveEvaluation run on holdout set. Compare fine-tuned vs. base model.
5. Deployment: promote fine-tuned model to production (shadow → canary → full rollout).
6. Registry: fine-tuned model registered as `{tenant_id}/{base_model}/{version}`.

**Supported Fine-Tuning Methods**
- Full fine-tuning (for smaller models on HiveCompute GPUs)
- LoRA / QLoRA (parameter-efficient, for large models)
- OpenAI fine-tuning API (for GPT models via OpenAI provider)

### 3.4 Intelligent Routing
HiveModels routes inference requests to optimize for the caller's declared priorities:

**Routing Strategies**

| Strategy | Behavior |
|---|---|
| Cost-optimized | Route to cheapest model meeting minimum quality threshold |
| Latency-optimized | Route to fastest model available (may sacrifice cost) |
| Quality-optimized | Route to highest-quality model for the task type |
| Fallback | Primary model → fallback model on error or timeout |
| A/B | Split traffic between two model versions for comparison |
| Canary | Route X% to new model version, rest to stable version |

**Fallback Chain Example**
```yaml
routing:
  primary: gpt-4o
  fallback:
    - claude-3-5-sonnet   # if OpenAI is unavailable
    - gemini-1-5-pro       # if both are unavailable
  fallback_trigger: [timeout_5s, error_rate_10pct]
```

### 3.5 Prompt Caching
- **Semantic cache**: Responses to semantically equivalent prompts (even if not identical) returned from cache (Redis, TTL configurable).
- **Provider-native cache**: OpenAI and Anthropic prompt caching enabled (reduces cost for repeated system prompts).
- Cache hit rate tracked per model and use case in HiveObservatory.
- Cache invalidation: TTL-based + explicit invalidation via API.

### 3.6 Context Management
- **Token counting**: Accurate token count for any model/text combination before sending (avoids truncation surprises).
- **Automatic truncation**: When input exceeds context limit, configurable truncation strategies (truncate oldest messages, summarize older context via HiveMemory consolidation).
- **Context caching**: Long system prompts cached at provider level to reduce cost on repeated calls.

---

## 4. Provider Integrations

| Provider | Models | Integration |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o-mini, text-embedding-3 series, DALL-E 3, Whisper | Native API |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku | Native API |
| Google | Gemini 1.5 Pro, Gemini 1.5 Flash | Vertex AI |
| Meta | Llama 3.1 (self-hosted) | HiveCompute vLLM |
| Mistral | Mistral Large, Mistral 7B | Native API + self-hosted |
| Cohere | Command R+, Rerank v3 | Native API |
| Custom | Any OpenAI-compatible API endpoint | OpenAI-compatible connector |

---

## 5. Technology Stack

| Component | Technology |
|---|---|
| Inference API | Python FastAPI (thin routing layer) |
| Model Router | Go (low-latency routing logic) |
| Provider SDKs | openai, anthropic, google-generativeai Python SDKs |
| Self-hosted Inference | vLLM (OpenAI-compatible serving for self-hosted models) |
| Semantic Cache | Redis + HiveVector (semantic similarity cache) |
| Fine-Tuning Orchestration | Temporal (training job workflow) |
| Training Runtime | PyTorch + Hugging Face Transformers on HiveCompute GPUs |
| Registry | PostgreSQL (model catalog, routing config) |

---

## 6. SLAs

| Metric | Target |
|---|---|
| Inference API latency overhead (routing + auth) | <10ms added to provider latency |
| Provider failover time | <5 seconds (automatic fallback on primary failure) |
| Cache hit response latency P99 | <50ms |
| Fine-tuning job start latency (GPU available) | <5 minutes |
| Model registry availability | 99.99% |
| Token counting accuracy | 100% (matches provider tokenizer) |

---

## 7. Roadmap

| Milestone | Timeline |
|---|---|
| Multi-modal unified API (image + audio + text in single call, normalized across providers) | Q4 2026 |
| Speculative decoding (draft model accelerates primary model — 2–3x throughput improvement) | Q1 2027 |
| Continuous model evaluation (daily automated eval of all production models; auto-alert on quality drop) | Q1 2027 |
| Cost optimizer (automatic model downgrade for low-priority tasks while maintaining quality threshold) | Q2 2027 |
