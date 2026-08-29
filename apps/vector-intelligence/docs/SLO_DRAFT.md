# SLO Draft

## Availability SLO
- **Target:** 99.95% uptime for the `v1/vector/search` endpoint.
- **Target:** 99.9% uptime for the `v1/vector/upsert` endpoint.
- **Measurement:** Synthetic probes executed every 10 seconds against a dedicated health check namespace.

## Latency SLO
- **Read (Search):** p50 < 30ms, p95 < 50ms, p99 < 100ms.
- **Write (Upsert):** p95 < 200ms per batch of 100 vectors.
- **Measurement:** Exported via Prometheus metrics at the API Gateway layer, filtering out requests that exceed max payload limits.

## Error Rate SLO
- **Target:** < 0.1% 5xx errors across all endpoints.
- **Measurement:** Ratio of 5xx HTTP/gRPC status codes over total requests over a rolling 1-hour window.

## Data Freshness SLO
- **Target:** Newly upserted vectors are available in ANN search results within 5 seconds (p95).
- **Measurement:** E2E integration test emitting a vector and polling the search endpoint until the ID is retrieved.
