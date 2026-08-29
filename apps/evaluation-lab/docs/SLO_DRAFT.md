# SLO Draft

## Service Level Objectives

### 1. Availability SLO
- **Target**: 99.9% uptime for the Control Plane API (API Gateway, Job Submission, Retrieving Results).
- **Measurement**: Prober checking `/health` and submitting a test job every 1 minute.

### 2. Latency SLO
- **Target (Control Plane)**: 95% of API requests complete in < 200ms.
- **Target (Evaluation Execution)**: 90% of automated evaluation jobs complete within 2x the total inference latency of the target (e.g., if a dataset takes 10 mins to infer, eval completes in < 20 mins).
- **Measurement**: Distributed tracing (P47) measuring job start to job complete timestamps.

### 3. Error Rate SLO
- **Target**: < 1% error rate on job execution (excluding failures caused by the target model being down).
- **Measurement**: Percentage of jobs resulting in internal `WORKER_FAULT` vs total jobs.

### 4. Data Freshness SLO
- **Target**: Production traces sent from P47 are ingested and available for shadow evaluation within 5 minutes (P99).
- **Measurement**: Timestamp difference between trace generation in P47 and availability in P48 Datasets.
