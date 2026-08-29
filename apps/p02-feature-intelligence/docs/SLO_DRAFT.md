# Service Level Objectives (SLO) Draft: P02

## 1. Availability SLO
- **Target:** 99.99% for the Online Serving API; 99.9% for the Feature Registry and Offline API.
- **Measurement:** Percentage of successful HTTP/gRPC responses (HTTP 2xx, 3xx) out of all valid requests, measured over a rolling 30-day window via API Gateway metrics.

## 2. Latency SLO
- **Target:** 99% of Online Serving API requests (payload < 10KB) complete in < 10ms.
- **Measurement:** Server-side latency measured at the API Gateway, excluding client network time.

## 3. Error Rate SLO
- **Target:** < 0.1% for all API endpoints.
- **Measurement:** (HTTP 5xx responses / Total requests) measured over a 5-minute rolling window. Alerts trigger on sustained breach.

## 4. Data Freshness SLO (Online Store)
- **Target:** 99% of streaming feature updates are reflected in the online store within 2 seconds of ingestion from P01.
- **Measurement:** End-to-end synthetic monitoring injecting timestamped events into P01 and polling the P02 Serving API until the updated value is returned.

## 5. Offline Job Reliability SLO
- **Target:** 99% of offline dataset generation jobs complete successfully within their predicted SLA bounds (dynamically calculated based on data volume).
- **Measurement:** Job success rate tracked in the orchestration engine metadata.
