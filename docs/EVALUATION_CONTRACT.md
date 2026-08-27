# Evaluation Contract: Nexarch Privacy Intelligence

## Quality & Correctness Metrics

### PII Detection
- **Precision**: > 98% across standard PII entities (SSN, Email, Phone, Credit Card).
- **Recall**: > 99% across standard PII entities.
- **Latency**: p95 < 50ms per 10KB text block.

### Differential Privacy
- **Utility Loss**: Model accuracy drop must be < 5% compared to non-DP models, for a privacy budget $\epsilon = 1.0$.
- **Budget Enforcement**: Hard enforcement. API must reject queries strictly when $\epsilon$ or $\delta$ budget is exhausted (0% failure rate).

### Federated Learning
- **Convergence Rate**: FedAvg implementations must converge within 1.2x the number of rounds of centralized training.
- **Secure Aggregation Overhead**: Cryptographic overhead should not exceed 20% of total round time.

## Benchmark Datasets
- **PII Detection**: Enron Email Dataset (annotated for PII), Synthetic Multi-lingual PII corpus.
- **Federated Learning**: LEAF benchmark suite (FEMNIST, Sentiment140).

## Acceptance Thresholds
- All L1 architectural patterns verified by the Chief Architecture Agent.
- Zero high-severity vulnerabilities in STRIDE threat model.
- PII Detection metrics consistently meet the Precision/Recall thresholds in continuous integration tests.
