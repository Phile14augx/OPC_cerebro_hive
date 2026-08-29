# Consumed Contracts

## P01 Data Fabric
- **Ingestion APIs**:
  - `POST /v1/ingest/connectors`
  - `POST /v1/transform/jobs`
  - `POST /v1/query`
- **Events Consumed**:
  - `p01.data.ingested`
  - `p01.pipeline.completed`
  - `p01.schema.updated`

## P44 Privacy Intelligence
- **Endpoints**:
  - `POST /v1/privacy/anonymize`
  - `POST /v1/privacy/detect-pii`
  - `POST /v1/fl/federation-rounds`
  - `GET /v1/consent/check`

## P46 MLOps Control Plane
- **Endpoints**:
  - `POST /api/2.0/mlflow/runs/create`
  - `POST /v1/models/versions/transition`
  - `POST /v1/pipelines/trigger`

## P47 Model Observability
- **Endpoints**:
  - `POST /v1/telemetry/traces`
  - `POST /api/v1/observability/hallucination/feedback`
  - `GET /api/v1/observability/metrics/{model_id}`

## P48 Evaluation Lab
- **Endpoints**:
  - `POST /api/v1/datasets`
  - `POST /api/v1/evaluations`
  - `GET /api/v1/evaluations/{id}`
  - `POST /api/v1/adversarial/jobs`
