# SLO Draft

## Service Level Objectives

- **Availability SLO**: 99.95% uptime for the Tracking and Registry APIs. (Allowed downtime: ~21.6 minutes/month).
- **Pipeline Execution Availability SLO**: 99.9% of triggered pipelines must transition to `RUNNING` within 5 minutes (assuming resource availability).

- **Latency SLO**:
  - p50 < 50ms for metric logging.
  - p95 < 200ms for metric logging.
  - p99 < 1s for querying experiment histories.

- **Error Rate SLO**:
  - < 0.1% for all internal server errors (HTTP 5xx) on core API routes.

- **Data Freshness SLO**:
  - State changes in Model Registry must be eventually consistent across deployment controllers within 10 seconds (p99).

## Measurement Methodology
- PromQL queries against API Gateway metrics (`http_request_duration_seconds`).
- Synthetic probes executing a full "log metric -> register model -> promote" flow every 5 minutes.
- Distributed tracing (OpenTelemetry) to measure pipeline orchestration lag.
