# Event Contracts: Pattern Intelligence (P09)

## Published Events

### `PatternDetectedEvent`
Emitted when a new significant pattern is discovered.
```json
{
  "eventId": "uuid",
  "timestamp": "iso8601",
  "source": "p09-pattern-intelligence",
  "type": "pattern.detected",
  "data": {
    "patternId": "string",
    "category": "anomaly | trend | correlation",
    "description": "string",
    "confidence": "number",
    "affectedResources": ["string"]
  }
}
```
