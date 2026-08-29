# API Contracts: Pattern Intelligence (P09)

## REST API

### `POST /api/v1/patterns/analyze`
Submits a dataset or stream identifier for pattern analysis.
**Request:**
```json
{
  "sourceId": "string",
  "dataType": "time-series | event",
  "analysisType": "anomaly | trend | correlation",
  "parameters": {}
}
```
**Response (202 Accepted):**
```json
{
  "jobId": "string",
  "status": "pending"
}
```

### `GET /api/v1/patterns/{jobId}`
Retrieves the results of an analysis job.
**Response (200 OK):**
```json
{
  "jobId": "string",
  "status": "completed",
  "results": [
    {
      "patternId": "string",
      "type": "anomaly",
      "confidence": 0.95,
      "details": {}
    }
  ]
}
```
