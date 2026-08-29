# SLO Draft

## Availability SLO
- **Ingestion API:** 99.99% uptime (critical for not blocking inference if tightly coupled, though async is preferred).
- **Dashboard/Query API:** 99.9% uptime.

## Latency SLO
- **Ingestion:** p99 < 100ms.
- **Query:** p50 < 500ms, p99 < 2s for standard time ranges.

## Error Rate SLO
- **Ingestion:** < 0.1% HTTP 5xx responses.

## Data Freshness SLO
- Real-time metrics available in the dashboard within 10 seconds of ingestion.
- Drift calculations updated within 5 minutes of data aggregation windows.

## Measurement Methodology
Prometheus metrics collected directly from the Telemetry Ingestion endpoints and Query API gateways.
