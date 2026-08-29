# Event Contracts

## Domain Events

### Emitted Events

1. **`p01.data.ingested`**
   - **Trigger:** Data batch successfully lands in the Lakehouse.
   - **Payload:**
     ```json
     {
       "datasetId": "string",
       "timestamp": "iso8601",
       "rowCount": "number",
       "schemaVersion": "string"
     }
     ```
   - **Version:** 1.0

2. **`p01.pipeline.completed`**
   - **Trigger:** A data transformation pipeline completes.
   - **Payload:**
     ```json
     {
       "pipelineId": "string",
       "status": "SUCCESS|FAILURE",
       "durationMs": "number",
       "outputDatasets": ["string"]
     }
     ```
   - **Version:** 1.0

3. **`p01.schema.updated`**
   - **Trigger:** A schema evolution event is detected.
   - **Payload:**
     ```json
     {
       "datasetId": "string",
       "changes": "object"
     }
     ```
   - **Version:** 1.0

### Consumed Events

1. **`p46.model.deployed`**
   - **Usage:** Adjusts pre-processing priorities based on active ML models.
2. **`p47.alert.triggered`**
   - **Usage:** Halts pipelines or triggers rollbacks if observability systems detect anomalies in infrastructure.

## Subject / Topic Naming Convention
- System: NATS JetStream
- Naming: `{product_id}.{domain}.{action}` (e.g., `p01.data.ingested`)
