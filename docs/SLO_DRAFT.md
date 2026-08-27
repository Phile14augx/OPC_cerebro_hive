# SLO Draft

## Availability SLO
* **99.99% Availability** for the Policy Evaluation API (critical path).
* **99.9% Availability** for the Model Card and Approval Workflow management APIs.

## Latency SLO
* **Policy Evaluation:** 
  * p50: < 10ms
  * p95: < 20ms
  * p99: < 50ms
* **Approval Workflow State Changes:**
  * p95: < 200ms

## Error Rate SLO
* **< 0.1%** HTTP 5xx error rate across all public APIs.

## Data Freshness SLO
* **Audit Logging:** Governance events are persisted to immutable storage within 5 seconds of the event occurrence (p99).

## Measurement Methodology
* **Availability:** Synthetic probes calling the evaluation endpoint every 10 seconds.
* **Latency & Errors:** Measured via API Gateway and Service Mesh (Envoy) metrics.
* **Freshness:** Measured by comparing event generation timestamps with immutable storage insertion timestamps.
