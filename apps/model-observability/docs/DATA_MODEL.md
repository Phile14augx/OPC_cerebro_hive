# Data Model

## Core Entities

### ModelBaseline
- id: UUID [Internal]
- model_id: String [Internal]
- eature_stats: JSON (mean, variance, distribution references) [Confidential]
- created_at: DateTime [Internal]

### TraceSpan
- 	race_id: UUID [Internal]
- span_id: UUID [Internal]
- parent_span_id: UUID (optional) [Internal]
- model_id: String [Internal]
- prompt_tokens: Int [Internal]
- completion_tokens: Int [Internal]
- latency_ms: Float [Internal]
- inference_payload: JSON [Restricted]

### AlertRule
- id: UUID [Internal]
- model_id: String [Internal]
- metric: String (e.g., "latency", "psi") [Internal]
- 	hreshold: Float [Internal]
- operator: Enum (GT, LT, EQ) [Internal]

## Retention Policies
- Raw traces: 7 days
- Aggregated metrics (1m resolution): 30 days
- Aggregated metrics (1h resolution): 1 year
- Drift events: 5 years

## Privacy Classification Details
- Public: None
- Internal: Telemetry metadata (tokens, latency, UUIDs, thresholds)
- Confidential: Feature statistics and aggregated model baselines
- Restricted: Raw inference payloads (prompts/responses) - MUST undergo PII masking before storage
