# API Contracts

## Overview
The MLOps Control Plane exposes both REST (MLflow compatible) and gRPC endpoints for native integrations.

### 1. Experiment Tracking API
**Method:** `POST /api/2.0/mlflow/runs/create`
- **Description:** Create a new experiment run.
- **Request:**
  ```json
  {
    "experiment_id": "string",
    "user_id": "string",
    "name": "string"
  }
  ```
- **Response:**
  ```json
  {
    "run": {
      "info": { "run_id": "string", "experiment_id": "string", "status": "RUNNING" }
    }
  }
  ```

### 2. Model Registry API
**Method:** `POST /v1/models/versions/transition`
- **Description:** Transition a model version's stage (e.g., Staging -> Production).
- **Request:**
  ```json
  {
    "model_name": "string",
    "version": "integer",
    "stage": "string",
    "governance_token": "string"
  }
  ```
- **Response:** `200 OK` (Triggered validation / async promotion).

### 3. Pipeline Execution API
**Method:** `POST /v1/pipelines/trigger`
- **Description:** Trigger a training or evaluation pipeline.
- **Request:**
  ```json
  {
    "pipeline_id": "string",
    "parameters": { "learning_rate": 0.01 },
    "trigger_source": "string"
  }
  ```
- **Response:** `202 Accepted` with `execution_id`.

## Versioning Strategy
- Semantic versioning (v1, v2) via URI paths.
- Backward compatibility guaranteed for N-2 minor releases.

## Rate Limits & Authentication
- **Auth**: OAuth2/OIDC integrated with Enterprise Identity.
- **Limits**: 1000 requests/minute per service account for experiments; 50 requests/minute for pipeline triggers.
