# Evaluation Contract

## Quality and Correctness Metrics

1. **Data Completeness:** 
   - Ensure 100% of rows from the source reach the landing zone without dropping.
2. **Data Consistency:** 
   - No data duplication (0% duplicate rate during ingestion).
   - Schema enforcement blocks invalid records correctly.
3. **Query Latency:**
   - Sub-second latency for cached queries.
   - p95 latency < 5 seconds for federated queries across indexed datasets.
4. **Pipeline Execution Success Rate:**
   - > 99.5% success rate for daily scheduled transformation jobs.

## Test Suites Required
- **Connector Certification Suite:** Validates source integrations (Postgres, MySQL, S3, Kafka).
- **Federation Benchmarks:** Uses TPC-DS datasets to evaluate Trino query planning and federation efficiency.
- **Chaos Engineering Tests:** Verifies exactly-once processing guarantees in Kafka/Flink during pod failures.

## Acceptance Thresholds
- All critical user journeys (CUJs) for data ingestion and querying must pass with 100% success rate under load.
- No critical or high severity security vulnerabilities in automated scans.
