# API Contracts

## Overview
REST/gRPC endpoints for Nexarch AI Governance.

## Endpoints

### 1. Evaluate Policy
`POST /api/v1/governance/policies/evaluate`
* **Description:** Evaluates a specific action against the active policy set.
* **Request:**
  ```json
  {
    "action": "deploy_model",
    "resourceId": "model-123",
    "context": { "user": "admin", "environment": "prod" }
  }
  ```
* **Response:**
  ```json
  {
    "allowed": false,
    "reason": "Missing required approval",
    "policyViolations": ["policy-001"]
  }
  ```

### 2. Request Approval
`POST /api/v1/governance/approvals`
* **Description:** Initiates an approval workflow for a governed action.
* **Request:**
  ```json
  {
    "workflowType": "human_in_the_loop",
    "resourceId": "decision-456",
    "justification": "Requires manual override."
  }
  ```
* **Response:**
  ```json
  {
    "approvalId": "app-789",
    "status": "pending"
  }
  ```

### 3. Register Model Card
`POST /api/v1/governance/models/cards`
* **Description:** Registers or updates a model card.
* **Request:**
  ```json
  {
    "modelId": "model-123",
    "name": "Fraud Detection V2",
    "capabilities": ["classification"],
    "limitations": ["Requires structured data"]
  }
  ```
* **Response:**
  ```json
  {
    "cardId": "card-001",
    "status": "registered"
  }
  ```

## Versioning Strategy
URI-based versioning (e.g., `/api/v1/`). Major breaking changes will increment the version number.

## Rate Limits & Authentication
* **Rate Limits:** 10,000 requests per minute per tenant for policy evaluations; 100 requests per minute for model card registration.
* **Authentication:** Requires Nexarch Identity (JWT) with specific governance roles (`governance.admin`, `governance.evaluator`).
