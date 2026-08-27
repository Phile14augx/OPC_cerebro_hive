# Event Contracts

## NATS Subject Naming Convention
`nexarch.eval-lab.v1.{entity}.{action}`

## Emitted Events

### 1. `nexarch.eval-lab.v1.evaluation.completed`
Fired when an evaluation run finishes, consumed by P46 MLOps for promotion gates.
- **Payload**:
  ```json
  {
    "event_id": "evt_...",
    "timestamp": "2026-08-27T10:00:00Z",
    "evaluation_id": "ev_12345",
    "target_id": "model_v2",
    "result": "PASS",
    "scores": {
      "accuracy": 0.95,
      "safety": 0.99
    }
  }
  ```

### 2. `nexarch.eval-lab.v1.dataset.updated`
Fired when a new version of a benchmark dataset is available.
- **Payload**:
  ```json
  {
    "dataset_id": "ds_999",
    "version": "v1.2.0",
    "row_count": 5000
  }
  ```

## Consumed Events

### 1. `nexarch.observability.v1.trace.flagged` (from P47)
Listens for anomalous production traces to trigger shadow evaluations.
- **Payload Expected**:
  ```json
  {
    "trace_id": "tr_abc",
    "flag_reason": "USER_NEGATIVE_FEEDBACK",
    "context": { ... }
  }
  ```

### 2. `nexarch.mlops.v1.model.registered` (from P46)
Listens for new models to automatically trigger baseline suite evaluations.
- **Payload Expected**:
  ```json
  {
    "model_id": "mod_xyz",
    "version": "1.0",
    "tags": ["candidate"]
  }
  ```
