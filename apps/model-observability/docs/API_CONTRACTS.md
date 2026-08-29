# API Contracts

## Telemetry Ingestion (gRPC/HTTP)
- **Method:** POST /v1/telemetry/traces
- **Request:** OTLP Trace format (standard OpenTelemetry).
- **Response:** 202 Accepted.

## Hallucination Feedback API
- **Method:** POST /api/v1/observability/hallucination/feedback
- **Request:**
  `json
  {
    "trace_id": "uuid",
    "is_hallucination": true,
    "human_correction": "string"
  }
  `
- **Response:** 200 OK.

## Metrics Query API
- **Method:** GET /api/v1/observability/metrics/{model_id}
- **Response:**
  `json
  {
    "latency_p95": 120.5,
    "drift_score": 0.04,
    "status": "HEALTHY"
  }
  `

## Versioning Strategy
URI-based versioning (e.g., /v1/).

## Rate Limits & Authentication
- Ingestion: Extremely high rate limits, authenticated via cluster-internal mTLS or API keys.
- Query: Authenticated via Nexarch Identity (JWT), limited to 100 req/sec per user.
