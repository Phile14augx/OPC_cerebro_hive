# API Contracts

## OpenAPI-style Schema Draft

```yaml
openapi: 3.0.0
info:
  title: Nexarch Data Fabric API
  version: 1.0.0
paths:
  /v1/ingest/connectors:
    post:
      summary: Create a new data ingestion connector
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                sourceType:
                  type: string
                configuration:
                  type: object
      responses:
        '201':
          description: Connector created
  /v1/transform/jobs:
    post:
      summary: Trigger a transformation job (dbt/Spark)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                jobName:
                  type: string
                parameters:
                  type: object
      responses:
        '202':
          description: Job accepted
  /v1/query:
    post:
      summary: Execute federated query
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                sql:
                  type: string
      responses:
        '200':
          description: Query results
```

## Versioning Strategy
- API uses URI versioning (e.g., `/v1/`).
- Breaking changes require a new major version.
- Non-breaking changes (new fields) will be added to the current version.

## Rate Limits and Authentication
- **Rate Limits:** 100 requests per minute per tenant for management APIs; 1000 queries per second for Query API.
- **Authentication:** OAuth 2.0 with JWT tokens. Role-Based Access Control (RBAC) enforced at the dataset and column levels.
