# Evaluation Contract

## Correctness & Quality Metrics

1. **Retrieval Recall@K (AI Metric)**
   - *Definition:* The percentage of queries where the relevant ground-truth document is present in the top-K retrieved results.
   - *Threshold:* Recall@10 > 92% on standard BEIR enterprise datasets.

2. **Reranker Precision (AI Metric)**
   - *Definition:* Lift in Mean Reciprocal Rank (MRR) after applying the cross-encoder reranking step.
   - *Threshold:* Reranking must improve baseline MRR by at least 15%.

3. **Latency (System Metric)**
   - *Definition:* Time taken to return `top_k=100` candidates from a 10-million vector index.
   - *Threshold:* p95 < 50ms, p99 < 100ms.

4. **Hallucination/Leakage Rate (Security Metric)**
   - *Definition:* Number of vectors returned that do not match the provided tenant ID or ACL constraints.
   - *Threshold:* 0% (Strict requirement).

## Benchmark Datasets
- Internal standard BEIR suite adaptation (Enterprise-focused).
- Adversarial tenant-isolation test suite (queries injected with unauthorized tenant contexts).

## Measurement Methodology
- Automated nightly benchmarks running against a synthetic 10M vector dataset in a staging environment.
- Continual automated regression testing of the Hybrid RRF scoring algorithm against known good query-document pairs.
