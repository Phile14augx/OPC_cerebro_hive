# Evaluation Contract

## Quality Measurement Metrics

### Entity Resolution
- **Precision:** > 95% (minimize false positives when merging entities).
- **Recall:** > 90% (minimize false negatives when deduplicating).
- *Measurement:* Evaluated against a continuously updated golden dataset of known duplicates.

### Graph Completeness (Link Prediction)
- **Mean Reciprocal Rank (MRR):** > 0.8 on link prediction benchmarks.
- **Hits@10:** > 90% for inferred relationships.

### Performance & Scale
- **Latency (1-hop):** < 10ms (p95)
- **Latency (3-hop):** < 50ms (p95)
- **Ingestion Throughput:** > 5,000 nodes/sec; > 15,000 edges/sec.

### Adversarial Testing
- **Query Injection:** Continuous automated suites testing against Cypher injection attacks.
- **DoS Testing:** Automated deployment of "infinite loop" queries to ensure query planner timeouts function correctly.

## Acceptance Thresholds
Before a release to production (L3), the product must pass 100% of the semantic integrity checks defined in the `nexarch-core-ontology` benchmark suite, proving no regression in the core enterprise graph topology.
