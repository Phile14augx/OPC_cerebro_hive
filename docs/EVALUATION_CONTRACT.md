# Evaluation Contract: Nexarch Feature Intelligence (P02)

## Quality and Correctness Metrics

1. **Point-in-Time Correctness:**
   - **Metric:** Zero data leakage in generated datasets.
   - **Measurement:** Automated integration tests that insert historical data and verify that generated training rows strictly exclude data from the future relative to the entity timestamp.
   - **Threshold:** 100% pass rate on the temporal join test suite.

2. **Offline-Online Skew:**
   - **Metric:** Percentage difference between feature values retrieved from the online store and those computed for the same timestamp in the offline store.
   - **Measurement:** Daily shadow sampling comparing online API responses to batch recalculated values.
   - **Threshold:** < 0.01% discrepancy (allowing for acceptable stream-processing delays).

3. **Transformation Accuracy:**
   - **Metric:** Correctness of built-in primitives (PCA, normalization, binning).
   - **Measurement:** Unit and integration tests comparing Engine outputs against baseline standard libraries (e.g., scikit-learn).
   - **Threshold:** Numerical precision errors within 1e-6.

## Performance Metrics

1. **Online Serving Latency:**
   - p50 < 2ms, p99 < 10ms for single-entity requests.
   - p99 < 25ms for batch requests (up to 100 entities).

2. **Throughput:**
   - Support > 50,000 QPS per production cluster without SLA degradation.

3. **Ingestion Lag:**
   - Time from event arriving in P01 to being available in the online feature store.
   - Threshold: p99 < 2 seconds.

## Test Suites Required
- `feature-store-temporal-tests`: Evaluates point-in-time correctness.
- `serving-load-tests`: Measures API latency under heavy concurrency.
- `drift-detection-benchmarks`: Evaluates the sensitivity and false-positive rate of the drift monitoring system using adversarial datasets with known statistical shifts.
