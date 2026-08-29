# Event Contracts: Nexarch Feature Intelligence (P02)

## NATS Subjects Naming Convention
All events use the prefix `nexarch.p02.feature_intelligence.`.
Format: `nexarch.p02.feature_intelligence.<domain>.<event_type>`

## Emitted Events

### 1. Feature Drift Detected
Emitted when the data quality monitor detects significant statistical drift in a feature's distribution.
- **Subject:** `nexarch.p02.feature_intelligence.monitoring.drift_detected`
- **Payload Schema:**
  ```json
  {
    "eventId": "uuid",
    "timestamp": "2026-08-27T10:00:00Z",
    "featureName": "user:avg_session_length",
    "metric": "wasserstein_distance",
    "value": 0.45,
    "threshold": 0.30,
    "severity": "HIGH"
  }
  ```

### 2. Feature View Registered
Emitted when a new feature view is created or updated in the registry.
- **Subject:** `nexarch.p02.feature_intelligence.registry.view_registered`
- **Payload Schema:**
  ```json
  {
    "eventId": "uuid",
    "timestamp": "2026-08-27T10:05:00Z",
    "featureViewName": "user_activity_30d",
    "version": 2,
    "author": "data_scientist@example.com"
  }
  ```

### 3. Offline Dataset Ready
Emitted when an asynchronous job to generate a training dataset completes.
- **Subject:** `nexarch.p02.feature_intelligence.offline.dataset_ready`
- **Payload Schema:**
  ```json
  {
    "jobId": "job-8f7d9a",
    "timestamp": "2026-08-27T10:30:00Z",
    "outputUri": "s3://bucket/path/to/training_data/",
    "rowCount": 1500000,
    "status": "SUCCESS"
  }
  ```

## Consumed Events

### 1. Data Fabric Ingestion Complete (From P01)
Triggers batch transformation jobs to update the offline and online feature stores.
- **Subject:** `nexarch.p01.data_fabric.ingestion.completed`
- **Expected Payload:** Dataset URI, partition keys, schema version.

### 2. Real-time Event Stream (From P01)
Continuous ingestion for streaming feature transformations (e.g., rolling window aggregations).
- **Subject:** `nexarch.p01.data_fabric.stream.*`
- **Expected Payload:** Raw event data (JSON/Protobuf).
