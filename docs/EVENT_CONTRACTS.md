# Event Contracts

## NATS Subject Naming Convention
`nexarch.vector.{environment}.{domain}.{event_type}`

---

## Consumed Events

### 1. Feature Generation Completed
- **Subject:** `nexarch.feature.prod.embedding.generated`
- **Description:** Consumed from P02 when new embeddings are generated for raw text.
- **Payload:**
```json
{
  "event_id": "uuid",
  "source_entity_id": "string",
  "vector": [0.1, 0.2],
  "metadata": {},
  "timestamp": "iso8601"
}
```

### 2. Knowledge Graph Node Deleted
- **Subject:** `nexarch.kg.prod.node.deleted`
- **Description:** Consumed from P04 to cascade deletion and remove orphaned vectors.
- **Payload:**
```json
{
  "node_id": "string",
  "timestamp": "iso8601"
}
```

---

## Emitted Events

### 1. Vector Upsert Completed
- **Subject:** `nexarch.vector.prod.index.updated`
- **Description:** Emitted when a batch of vectors has been successfully indexed and is available for search.
- **Payload:**
```json
{
  "namespace": "string",
  "upserted_ids": ["string"],
  "timestamp": "iso8601"
}
```

### 2. Search Index Optimization Triggered
- **Subject:** `nexarch.vector.prod.index.optimizing`
- **Description:** Emitted when a re-indexing or HNSW graph optimization routine starts.
- **Payload:**
```json
{
  "namespace": "string",
  "algorithm": "HNSW",
  "status": "STARTED"
}
```
