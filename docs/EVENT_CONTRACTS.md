# Event Contracts

## Emitted Events

### ModelDriftDetected
- **Subject:** observability.drift.detected
- **Payload:**
  `json
  {
    "event_id": "uuid",
    "model_id": "string",
    "timestamp": "iso8601",
    "metric": "PSI",
    "value": 0.25,
    "threshold": 0.20,
    "feature_name": "input_text_length"
  }
  `
- **Description:** Consumed by P46 MLOps to trigger retraining pipelines.

### HallucinationAlert
- **Subject:** observability.hallucination.alert
- **Payload:**
  `json
  {
    "trace_id": "uuid",
    "model_id": "string",
    "confidence": 0.98
  }
  `

## Consumed Events
- inference.request.completed (if not using direct OTel streaming)
- model.deployment.succeeded (from P46 to register new baselines)
