# Evaluation Contract

## Quality & Correctness Metrics
- **Drift Detection Accuracy:** Must achieve >98% precision and >90% recall against synthetic datasets with injected drift.
- **Hallucination Detection:** F1 score > 0.85 on standardized internal benchmark datasets (e.g., HaluEval variants).
- **Correlation Integrity:** 100% of generated spans must correctly resolve to their parent trace_id.

## Performance Metrics
- **Ingestion Latency Overhead:** <50ms added to inference path if synchronously tracked (preferably asynchronous).
- **Query Latency:** 95th percentile query time for 7-day metric aggregation < 2 seconds.

## Acceptance Thresholds
- Passing the automated adversarial test suite for drift algorithms.
- Validated integration with P46 (verified end-to-end event emission and trigger).
