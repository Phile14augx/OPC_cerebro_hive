# API Contracts: Nexarch Privacy Intelligence

## OpenAPI Schema Draft

```yaml
openapi: 3.0.3
info:
  title: Nexarch Privacy Intelligence API
  version: 1.0.0
paths:
  /v1/privacy/anonymize:
    post:
      summary: Anonymize sensitive payload
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: object
                strategy:
                  type: string
                  enum: [k-anonymity, l-diversity, tokenization]
      responses:
        '200':
          description: Anonymized data
          content:
            application/json:
              schema:
                type: object
                properties:
                  anonymized_data:
                    type: object
  /v1/privacy/detect-pii:
    post:
      summary: Detect PII in text
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                text:
                  type: string
      responses:
        '200':
          description: List of detected PII entities
  /v1/fl/federation-rounds:
    post:
      summary: Start a new Federated Learning round
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                model_id:
                  type: string
                participants:
                  type: array
                  items:
                    type: string
      responses:
        '201':
          description: Round initiated
  /v1/consent/check:
    get:
      summary: Check if a user has consented to a specific processing purpose
      parameters:
        - name: user_id
          in: query
          required: true
          schema:
            type: string
        - name: purpose
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Consent status
```

## Versioning Strategy
- Semantic versioning for APIs (v1, v2) mapped in the URI path.
- Non-breaking schema additions are continuously deployed.

## Rate Limits & Authentication
- **Internal APIs**: Authenticated via standard Nexarch Service-to-Service mTLS.
- **Rate Limits**: Configured via the API Gateway tier (e.g., 1000 req/sec for PII detection per tenant, 10 req/sec for FL orchestration).
