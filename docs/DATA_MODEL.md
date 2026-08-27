# Data Model

## Core Entities

### ModelBaseline
- id: UUID
- model_id: String
- eature_stats: JSON (mean, variance, distribution references)
- created_at: DateTime

### TraceSpan
- 	race_id: UUID
- span_id: UUID
- parent_span_id: UUID (optional)
- model_id: String
- prompt_tokens: Int
- completion_tokens: Int
- latency_ms: Float

### AlertRule
- id: UUID
- model_id: String
- metric: String (e.g., "latency", "psi")
- 	hreshold: Float
- operator: Enum (GT, LT, EQ)

## Retention Policies
- Raw traces: 7 days
- Aggregated metrics (1m resolution): 30 days
- Aggregated metrics (1h resolution): 1 year
- Drift events: 5 years

## Privacy Classification
- Telemetry metadata (tokens, latency): Internal
- Inference payloads (prompts/responses): Confidential/Restricted (may require PII masking before storage)
