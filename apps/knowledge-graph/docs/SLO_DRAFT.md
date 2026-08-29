# SLO Draft

## Service Level Objectives

### Availability
- **Target:** 99.95% uptime for the Graph Query API.
- **Measurement:** Synthetic transactions running a standard 2-hop query every 10 seconds.

### Latency
- **p50 Latency:** < 10ms for standard 1-hop lookups.
- **p95 Latency:** < 50ms for complex multi-hop (up to 3 hops) graph traversals.
- **Measurement:** Application performance monitoring (APM) traces on the `POST /api/v1/knowledge-graph/query` endpoint.

### Error Rate
- **Target:** < 0.1% HTTP 5xx errors.
- **Measurement:** Total 5xx responses divided by total requests over a rolling 5-minute window.

### Data Freshness
- **Target:** < 2 minutes delay from when a source event (e.g., `Document Processed`) is emitted to when the resulting nodes/edges are available in the graph.
- **Measurement:** Timestamp comparison between source event creation and graph insertion commit log.
