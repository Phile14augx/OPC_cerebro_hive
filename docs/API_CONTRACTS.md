# API Contracts

## Versioning Strategy
All APIs are versioned using URL paths (e.g., `/api/v1/...`). Semantic versioning is applied to SDK releases.

## Rate Limits & Auth
- **Auth**: Standard Nexarch OAuth2/JWT via API Gateway. Requires `eval-lab:read` or `eval-lab:write` scopes.
- **Rate Limits**: 100 requests/minute per tenant for control plane APIs. Asynchronous job submissions are limited to 10 concurrent active jobs per tenant.

## Public REST Endpoints

### 1. `POST /api/v1/datasets`
Creates a new evaluation dataset.
- **Request**:
  ```json
  {
    "name": "enterprise-rag-qa",
    "description": "Internal Q&A benchmark for HR policies",
    "type": "QA_PAIRS",
    "source_uri": "s3://nexarch-datasets/hr-qa.jsonl"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "dataset_id": "ds_01H...",
    "status": "INGESTING"
  }
  ```

### 2. `POST /api/v1/evaluations`
Triggers a new evaluation run.
- **Request**:
  ```json
  {
    "target": {
      "type": "MODEL",
      "model_id": "gpt-4-turbo-internal"
    },
    "dataset_ids": ["ds_01H..."],
    "metrics": [
      {
        "name": "faithfulness",
        "type": "LLM_JUDGE",
        "judge_model": "gpt-4"
      },
      {
        "name": "latency",
        "type": "SYSTEM"
      }
    ]
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "evaluation_id": "ev_01H...",
    "status": "QUEUED"
  }
  ```

### 3. `GET /api/v1/evaluations/{id}`
Retrieves evaluation results.
- **Response**: `200 OK`
  ```json
  {
    "evaluation_id": "ev_01H...",
    "status": "COMPLETED",
    "summary": {
      "faithfulness": 0.92,
      "latency_p95_ms": 1200
    },
    "passed_thresholds": true
  }
  ```

### 4. `POST /api/v1/adversarial/jobs`
Launches an automated red-teaming session against a target agent endpoint.
