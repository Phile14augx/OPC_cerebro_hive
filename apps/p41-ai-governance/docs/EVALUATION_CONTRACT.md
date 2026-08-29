# Evaluation Contract

## Quality & Correctness Metrics
* **Policy Evaluation Accuracy:** 100% correct evaluations against a predefined adversarial test suite of complex Rego policies.
* **Approval Workflow State Machine:** 100% valid state transitions (no skipped steps in escalation chains).
* **Provenance Integrity:** 100% of generated provenance chains must successfully pass cryptographic verification.

## Performance Metrics
* **Evaluation Latency:** p95 < 20ms, p99 < 50ms for cached policy evaluations.
* **Throughput:** Capable of 5,000 policy evaluations per second per node.

## Benchmark Datasets
* **Adversarial Policy Suite:** A set of 500 edge-case OPA policies designed to test rule conflicts, deep nesting, and performance bottlenecks.
* **Compliance Edge Cases:** Scenarios simulating conflicting P44 privacy signals and urgent escalation approvals.

## Acceptance Thresholds
* Zero critical security vulnerabilities in the governance engine.
* Latency and accuracy metrics met consistently under load testing over a 24-hour period.
