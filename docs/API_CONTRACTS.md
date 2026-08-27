# API Contracts: Nexarch Feature Intelligence (P02)

## Versioning Strategy
All APIs are versioned via URL path (e.g., `/api/v1/...`). Breaking changes will introduce a new major version (e.g., `/api/v2/...`), with the old version deprecated and supported for at least 6 months.

## Authentication & Rate Limits
- **Authentication:** OAuth2 / OIDC tokens required for all endpoints. Service accounts used for machine-to-machine communication.
- **Rate Limits:** Online serving endpoints rate-limited per consumer based on SLA (default: 10,000 req/sec per tenant). Management endpoints limited to 100 req/sec.

## Core Endpoints

### 1. Get Online Features
Retrieves the latest feature values for a given entity or set of entities.

- **Method:** `POST`
- **Path:** `/api/v1/serve/features`
- **Request Body:**
  ```json
  {
    "feature_service": "customer_churn_model:v2",
    "entities": [
      { "user_id": "u123" },
      { "user_id": "u456" }
    ]
  }
  ```
- **Response Body:**
  ```json
  {
    "results": [
      {
        "entity": { "user_id": "u123" },
        "features": {
          "total_purchases_30d": 15,
          "avg_session_length": 120.5,
          "user_embedding": [0.12, -0.45, 0.88]
        }
      }
    ]
  }
  ```

### 2. Generate Offline Training Dataset
Submits a job to generate a point-in-time correct training dataset.

- **Method:** `POST`
- **Path:** `/api/v1/offline/datasets`
- **Request Body:**
  ```json
  {
    "feature_list": [
      "user:total_purchases_30d",
      "user:avg_session_length",
      "item:category_encoded"
    ],
    "entity_dataframe_uri": "s3://bucket/path/to/events.parquet",
    "output_uri": "s3://bucket/path/to/training_data/",
    "format": "parquet"
  }
  ```
- **Response Body:**
  ```json
  {
    "job_id": "job-8f7d9a",
    "status": "SUBMITTED"
  }
  ```

### 3. Register Feature View
Registers a new feature definition and transformation logic.

- **Method:** `POST`
- **Path:** `/api/v1/registry/feature-views`
- **Request Body:**
  ```json
  {
    "name": "user_activity_30d",
    "entities": ["user_id"],
    "features": [
      { "name": "total_purchases", "type": "INT64" },
      { "name": "avg_session_length", "type": "FLOAT" }
    ],
    "transformation_query": "SELECT user_id, count(*) as total_purchases, avg(length) as avg_session_length FROM user_sessions WHERE timestamp >= NOW() - INTERVAL 30 DAY GROUP BY user_id"
  }
  ```
- **Response Body:**
  ```json
  {
    "version": 1,
    "status": "CREATED",
    "uri": "/api/v1/registry/feature-views/user_activity_30d/v1"
  }
  ```
