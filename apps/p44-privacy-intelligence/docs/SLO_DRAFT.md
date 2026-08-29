# SLO Draft: Nexarch Privacy Intelligence

## Availability SLO
- **API Availability**: 99.99% uptime for core endpoints (`/v1/privacy/detect-pii`, `/v1/privacy/anonymize`).
- **Federated Orchestration Availability**: 99.9% uptime (FL rounds can tolerate higher coordination latency).

## Latency SLO
- **PII Detection (Sync)**: 
  - p50 < 20ms
  - p95 < 50ms
  - p99 < 100ms
- **Anonymization Processing (Sync)**:
  - p95 < 50ms for payloads up to 100KB.

## Error Rate SLO
- **Internal Server Errors (5xx)**: < 0.1% of total requests over a 5-minute rolling window.
- **Budget Exhaustion (429/403)**: Tracked as a business metric, not an SLO error, but invalid budget tracking failures must be 0%.

## Measurement Methodology
- **Prometheus Metrics**: `http_request_duration_seconds`, `http_requests_total` instrumented at the API gateway level.
- **Synthetic Probes**: Automated black-box testing every 1 minute against the `/v1/privacy/detect-pii` endpoint.
