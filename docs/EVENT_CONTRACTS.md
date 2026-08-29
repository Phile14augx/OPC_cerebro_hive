# Event Contracts

## Domain Events

### 1. Node Created
- **Event Name:** `KnowledgeGraph.Node.Created`
- **Subject:** `nexarch.knowledge-graph.node.created`
- **Description:** Emitted when a new entity node is successfully persisted.
- **Payload Schema:**
```json
{
  "eventId": "evt_abc123",
  "timestamp": "2026-08-27T10:00:00Z",
  "version": "1.0",
  "data": {
    "nodeId": "node_987",
    "labels": ["Document", "Policy"],
    "properties": {
      "title": "Leave Policy 2026"
    }
  }
}
```

### 2. Edge Created
- **Event Name:** `KnowledgeGraph.Edge.Created`
- **Subject:** `nexarch.knowledge-graph.edge.created`
- **Description:** Emitted when a new relationship is formed between two nodes.
- **Payload Schema:**
```json
{
  "eventId": "evt_def456",
  "timestamp": "2026-08-27T10:01:00Z",
  "version": "1.0",
  "data": {
    "edgeId": "edge_555",
    "type": "MENTIONS",
    "sourceNodeId": "node_111",
    "targetNodeId": "node_222",
    "properties": {
      "confidence": 0.95
    }
  }
}
```

### 3. Ontology Updated
- **Event Name:** `KnowledgeGraph.Ontology.Updated`
- **Subject:** `nexarch.knowledge-graph.ontology.updated`
- **Description:** Emitted when the foundational enterprise schema is migrated or altered.

## Consumed Events

### 1. Document Processed
- **Source:** P01 Data Ingestion
- **Event Name:** `DataIngestion.Document.Processed`
- **Usage:** Triggers the Knowledge Graph to extract entities and relationships via NLP/LLMs to update the graph topology.

### 2. Entity Embedded
- **Source:** P03 Vector Intelligence
- **Event Name:** `VectorIntelligence.Entity.Embedded`
- **Usage:** Updates node properties with the latest vector embeddings.
