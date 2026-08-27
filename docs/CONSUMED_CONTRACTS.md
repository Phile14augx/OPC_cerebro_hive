# Consumed Contracts

## P01 Data Fabric

### API Endpoints
- `POST /v1/ingest/connectors`
  - Request: `{ name: string, sourceType: string, configuration: object }`
  - Response: `201 Connector created`
- `POST /v1/transform/jobs`
  - Request: `{ jobName: string, parameters: object }`
  - Response: `202 Job accepted`
- `POST /v1/query`
  - Request: `{ sql: string }`
  - Response: `200 Query results`

### Events Consumed
- `p01.data.ingested`
  - Payload: `{ datasetId: string, timestamp: string, rowCount: number, schemaVersion: string }`
- `p01.pipeline.completed`
  - Payload: `{ pipelineId: string, status: string, durationMs: number, outputDatasets: array }`
- `p01.schema.updated`
  - Payload: `{ datasetId: string, changes: object }`

## P41 AI Governance
- `POST /api/v1/governance/policies/evaluate`
  - Request: `{ policyId: string, resource: object, context: object }`
  - Response: `{ decision: string, violations: array }`
- `POST /api/v1/governance/workflows/approval`
  - Request: `{ workflowType: string, resourceId: string, justification: string }`
  - Response: `{ approvalId: string, status: string }`
- `POST /api/v1/governance/models/cards`
  - Request: `{ modelId: string, name: string, capabilities: array, limitations: array }`
  - Response: `{ cardId: string, status: string }`

## P44 Privacy Intelligence
- `POST /v1/privacy/anonymize`
  - Request: `{ data: object, strategy: string }`
  - Response: `{ anonymized_data: object }`
- `POST /v1/privacy/detect-pii`
  - Request: `{ text: string }`
  - Response: `List of detected PII entities`
- `POST /v1/fl/federation-rounds`
  - Request: `{ model_id: string, participants: array }`
  - Response: `201 Round initiated`
- `GET /v1/consent/check`
  - Request: `query params (user_id, purpose)`
  - Response: `Consent status`

## P46 MLOps Control Plane
- `POST /api/2.0/mlflow/runs/create`
  - Request: `{ experiment_id: string, user_id: string, name: string }`
  - Response: `{ run: { info: object } }`
- `POST /v1/models/versions/transition`
  - Request: `{ model_name: string, version: integer, stage: string, governance_token: string }`
  - Response: `200 OK`
- `POST /v1/pipelines/trigger`
  - Request: `{ pipeline_id: string, parameters: object, trigger_source: string }`
  - Response: `202 Accepted`

## P47 Model Observability
- `POST /v1/telemetry/traces`
  - Request: `OTLP Trace format`
  - Response: `202 Accepted`
- `POST /api/v1/observability/hallucination/feedback`
  - Request: `{ trace_id: string, is_hallucination: boolean, human_correction: string }`
  - Response: `200 OK`
- `GET /api/v1/observability/metrics/{model_id}`
  - Request: `{ model_id }`
  - Response: `{ latency_p95: number, drift_score: number, status: string }`

## P48 Evaluation Lab
- `POST /api/v1/datasets`
  - Request: `{ name: string, description: string, type: string, source_uri: string }`
  - Response: `{ dataset_id: string, status: string }`
- `POST /api/v1/evaluations`
  - Request: `{ target: object, dataset_ids: array, metrics: array }`
  - Response: `{ evaluation_id: string, status: string }`
- `GET /api/v1/evaluations/{id}`
  - Request: `{ id: string }`
  - Response: `{ evaluation_id: string, status: string, summary: object, passed_thresholds: boolean }`
- `POST /api/v1/adversarial/jobs`
  - Request: `Adversarial job parameters`
  - Response: `Job status`
