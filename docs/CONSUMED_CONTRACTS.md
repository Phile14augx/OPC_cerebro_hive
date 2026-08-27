# Consumed Contracts

## P01: Data Fabric
- **Interface Name:** DataIngestionEvents (implied by Data Fabric API) / `POST /v1/ingest/connectors`
- **Version:** 1.0.0
- **Usage:** P04 consumes data ingestion pipelines to feed unstructured and structured data into the Knowledge Graph extraction pipelines, generating nodes and edges.

## P03: Vector Intelligence
- **Interface Name:** Vector Intelligence API (`POST /v1/vector/upsert` and `/v1/vector/search`)
- **Version:** v1
- **Usage:** P04 delegates the storage of graph node embeddings (e.g. Node2Vec/GraphSAGE) to P03's vector store, and utilizes P03's hybrid search for retrieval.

## P41: AI Governance
- **Interface Name:** Evaluate Policy API (`POST /api/v1/governance/policies/evaluate`)
- **Version:** v1
- **Usage:** P04 verifies governance policies before executing sensitive graph modifications or merging entities that require strict compliance tracking.

## P44: Privacy Intelligence
- **Interface Name:** Privacy Intelligence API (`POST /v1/privacy/anonymize` and `/v1/privacy/detect-pii`)
- **Version:** 1.0.0
- **Usage:** P04 uses privacy classification endpoints to anonymize or detect PII in node properties before persisting them in the graph, enforcing data privacy labels like 'Restricted'.

## P47: Model Observability
- **Interface Name:** Telemetry Ingestion API (`POST /v1/telemetry/traces`)
- **Version:** v1
- **Usage:** P04 streams OpenTelemetry traces of graph traversals and GraphRAG operations to P47 for latency, error rate monitoring, and general APM.

## P48: Evaluation Lab
- **Interface Name:** Evaluation API (`POST /api/v1/evaluations` and `/api/v1/datasets`)
- **Version:** v1
- **Usage:** P04 utilizes the Evaluation Lab to validate the accuracy of entity resolution (precision/recall) and link prediction logic against known datasets before promoting model changes.
