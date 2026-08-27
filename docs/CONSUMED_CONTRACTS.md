# Consumed Contracts — P01 Nexarch Data Fabric

## From P41 — Nexarch AI Governance
- Interface: Evaluate Policy (`POST /api/v1/governance/policies/evaluate`)
- Version: v1
- Usage: Validates data access policies and ingestion constraints before processing sensitive datasets.

## From P44 — Nexarch Privacy Intelligence
- Interface: Anonymize sensitive payload (`POST /v1/privacy/anonymize`)
- Version: v1
- Usage: Masks or anonymizes PII data directly in the ingestion or transformation stream before it lands in Lakehouse.

## From P46 — Nexarch MLOps Control Plane
- Interface: Pipeline Execution API (`POST /v1/pipelines/trigger`)
- Version: v1
- Usage: Triggers ML training pipelines asynchronously when new curated features or datasets arrive via the data fabric.

## From P47 — Nexarch Model Observability
- Interface: Telemetry Ingestion (`POST /v1/telemetry/traces`)
- Version: v1
- Usage: Sends data pipeline tracing and transformation metrics into the observability plane.

## From P48 — Nexarch Evaluation Lab
- Interface: Creates a new evaluation dataset (`POST /api/v1/datasets`)
- Version: v1
- Usage: Publishes transformed and prepared benchmark datasets directly into the evaluation lab for LLM testing.
