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

## Consumed Events

### 1. `privacy.compliance.violation`
* **Source:** P44 Privacy Intelligence
* **Subject:** `nexarch.privacy.compliance.violation`
* **Action:** Triggers an automatic policy evaluation and potentially revokes model approvals.
