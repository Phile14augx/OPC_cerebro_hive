# Event Contracts

## Domain Events

### Emitted Events

#### `mlops.model.promoted.v1`
- **Description:** Emitted when a model version successfully transitions to Production.
- **Subject:** `nexarch.mlops.model.promoted`
- **Payload:**
  ```json
  {
    "model_id": "string",
    "version": "integer",
    "promoted_by": "string",
    "timestamp": "iso8601"
  }
  ```

#### `mlops.pipeline.completed.v1`
- **Description:** Emitted when a training pipeline finishes.
- **Subject:** `nexarch.mlops.pipeline.completed`
- **Payload:**
  ```json
  {
    "execution_id": "string",
    "pipeline_id": "string",
    "status": "SUCCESS|FAILED",
    "artifacts_uri": "string"
  }
  ```

### Consumed Events

#### `observability.model.drift_detected.v1` (From P47)
- **Description:** Consumed to trigger automated retraining (CT).
- **Subject:** `nexarch.observability.drift`
- **Payload:**
  ```json
  {
    "model_id": "string",
    "drift_score": 0.85,
    "feature": "string"
  }
  ```

#### `governance.approval.granted.v1` (From P41)
- **Description:** Consumed to unblock model deployment workflows.
- **Subject:** `nexarch.governance.approval`
