# API Contracts

## Public Endpoints

### 1. Graph Query API (REST/gRPC)

**POST /api/v1/knowledge-graph/query**
Executes a Cypher query against the enterprise knowledge graph.

**Request:**
```json
{
  "query": "MATCH (p:Person)-[:WORKS_IN]->(d:Department) WHERE p.name = $name RETURN d",
  "parameters": {
    "name": "Jane Doe"
  },
  "options": {
    "timeoutMs": 5000,
    "consistency": "EVENTUAL"
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "d": {
        "id": "dept_123",
        "labels": ["Department"],
        "properties": {
          "name": "Engineering",
          "costCenter": "CC-908"
        }
      }
    }
  ],
  "metrics": {
    "executionTimeMs": 14,
    "nodesScanned": 5
  }
}
```

### 2. Entity Resolution API

**POST /api/v1/knowledge-graph/entities/merge**
Proposes or forces the merging of two distinct nodes into one.

**Request:**
```json
{
  "sourceNodeId": "node_abc",
  "targetNodeId": "node_xyz",
  "strategy": "PRESERVE_TARGET_PROPERTIES"
}
```

### 3. Ontology Management API

**GET /api/v1/knowledge-graph/ontology**
Retrieves the currently active enterprise ontology schema.

## Versioning Strategy
- Global prefix `/api/v1/`.
- Non-breaking changes (adding optional fields) occur within the same version.
- Breaking changes require a bump to `/v2/` and 6 months of active deprecation support.

## Rate Limits & Authentication
- **Authentication:** Service-to-service via mutual TLS (mTLS) and OAuth2 machine-to-machine tokens.
- **Authorization:** RBAC on graph labels (e.g., restricted access to `Confidential` labelled nodes).
- **Rate Limits:** 10,000 requests per minute per service account (configurable).
