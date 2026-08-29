# Event Contracts: Nexarch Privacy Intelligence

All events are published and consumed via NATS JetStream.

## Domain Events Emitted

### `privacy.pii.detected.v1`
Emitted when the PII engine flags high-confidence sensitive information.
```json
{
  "event_id": "uuid",
  "timestamp": "iso8601",
  "payload": {
    "source_system": "string",
    "entity_type": "string (e.g., SSN, EMAIL)",
    "confidence_score": "float",
    "action_taken": "string (e.g., REDACTED, FLAGGED)"
  }
}
```

### `privacy.consent.granted.v1`
Emitted when a new consent record is added to the ledger.
```json
{
  "event_id": "uuid",
  "timestamp": "iso8601",
  "payload": {
    "user_id": "string",
    "lawful_basis": "string (e.g., ARTICLE_6_1_A)",
    "purpose": "string"
  }
}
```

### `fl.round.completed.v1`
Emitted when a federated learning aggregation round is completed.
```json
{
  "event_id": "uuid",
  "timestamp": "iso8601",
  "payload": {
    "round_id": "string",
    "model_id": "string",
    "status": "string (SUCCESS/FAILED)",
    "participants_aggregated": "integer"
  }
}
```

## Events Consumed

### `governance.policy.updated.v1` (from P41)
Consumed to update dynamic anonymization strategies or consent requirements based on shifting compliance policies.
