# Event Contracts

## Emitted Events

### 1. `governance.policy.evaluated`
* **Subject:** `nexarch.governance.policy.evaluated`
* **Payload:**
  ```json
  {
    "eventId": "evt-001",
    "timestamp": "2026-08-27T10:00:00Z",
    "action": "deploy_model",
    "resourceId": "model-123",
    "allowed": false,
    "violations": ["policy-001"]
  }
  ```

### 2. `governance.approval.status_changed`
* **Subject:** `nexarch.governance.approval.status_changed`
* **Payload:**
  ```json
  {
    "eventId": "evt-002",
    "timestamp": "2026-08-27T10:05:00Z",
    "approvalId": "app-789",
    "resourceId": "decision-456",
    "oldStatus": "pending",
    "newStatus": "approved",
    "approverId": "user-123"
  }
  ```

### 3. `governance.alert.budget_exceeded`
* **Direction:** P41 publishes → all products subscribe (especially P44)
* **Subject:** `governance.alert.budget_exceeded`
* **Payload:**
  ```json
  {
    "subjectId": "string",
    "provenanceRecordId": "string",
    "verdict": "deny | escalate",
    "policyRef": "string",
    "timestamp": "ISO8601"
  }
  ```

## Consumed Events

### 1. `privacy.compliance.violation`
* **Source:** P44 Privacy Intelligence
* **Subject:** `nexarch.privacy.compliance.violation`
* **Action:** Triggers an automatic policy evaluation and potentially revokes model approvals.

### 2. `governance.privacy.budget.consumed`
* **Direction:** P44 publishes → P41 subscribes
* **Subject:** `governance.privacy.budget.consumed`
* **Payload schema:**
  ```json
  {
    "eventType": "privacy_budget_consumed",
    "sourceProduct": "P44",
    "subjectId": "string",
    "epsilon": "float",
    "delta": "float",
    "cumulativeEpsilon": "float",
    "threshold": "float",
    "exceeded": "boolean",
    "operation": "string",
    "timestamp": "ISO8601"
  }
  ```
* **P41 action on receipt:**
  - Creates a ProvenanceRecord entry
  - Evaluates OPA policy: `governance/privacy/budget_enforcement.rego`
  - If exceeded=true and policy verdict=deny: emits `governance.alert.budget_exceeded` subject
  - If exceeded=true and policy verdict=escalate: triggers human approval workflow
