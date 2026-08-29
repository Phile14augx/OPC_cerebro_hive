# API Contracts

## Base Path
`v1/vector`

## Versioning Strategy
Semantic versioning in the API path (`/v1/`, `/v2/`). Non-breaking schema additions are deployed continuously.

## Authentication & Rate Limits
- **Authentication:** Service-to-Service mTLS & JWT-based RBAC (must have `vector:read` or `vector:write` scopes).
- **Rate Limits:** 5,000 requests/minute per tenant for reads; 1,000 requests/minute per tenant for writes.

---

## 1. Insert/Update Vectors
**Method:** `POST`
**Path:** `/v1/vector/upsert`

**Request Schema:**
```json
{
  "namespace": "string",
  "vectors": [
    {
      "id": "string",
      "values": [0.1, 0.2, ...],
      "sparse_values": {"indices": [1, 5], "values": [0.5, 0.9]},
      "metadata": {
        "source_id": "string",
        "acl_groups": ["string"]
      }
    }
  ]
}
```

**Response Schema:**
```json
{
  "upserted_count": "integer"
}
```

---

## 2. Hybrid Search
**Method:** `POST`
**Path:** `/v1/vector/search`

**Request Schema:**
```json
{
  "namespace": "string",
  "query_vector": [0.1, 0.2, ...],
  "query_text": "string (optional for BM25)",
  "top_k": "integer",
  "filter": {
    "metadata_field": {"$eq": "value"}
  },
  "fusion_strategy": "RRF",
  "include_metadata": "boolean"
}
```

**Response Schema:**
```json
{
  "results": [
    {
      "id": "string",
      "score": "number",
      "metadata": {}
    }
  ]
}
```

---

## 3. Rerank Candidates
**Method:** `POST`
**Path:** `/v1/vector/rerank`

**Request Schema:**
```json
{
  "query_text": "string",
  "candidates": [
    {
      "id": "string",
      "text": "string"
    }
  ],
  "top_n": "integer"
}
```

**Response Schema:**
```json
{
  "results": [
    {
      "id": "string",
      "relevance_score": "number"
    }
  ]
}
```
