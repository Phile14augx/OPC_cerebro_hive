# Product Specification: HiveVector™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Data & Intelligence — Tier 2  
**Security Classification:** Tier 1 — Mission Critical

---

## 1. Product Overview

**HiveVector™** is the high-performance vector database and retrieval engine that powers every AI retrieval workload in the CerebroHive Intelligence Mesh. It is the enabling infrastructure beneath CerebroSearch (semantic search), HiveMemory (agent memory), CerebroArchive (knowledge retrieval), and every RAG pipeline in the platform.

Vector search is not a feature that can be bolted on — it requires purpose-built infrastructure for multi-tenancy, access control, index management, and observability at enterprise scale. HiveVector was built from the ground up to meet those requirements.

---

## 2. Architectural Position

```
Consumers (Layer above):
  CerebroSearch → HiveVector (document retrieval)
  HiveMemory    → HiveVector (agent semantic memory)
  CerebroArchive → HiveVector (knowledge Q&A)
  HiveKnowledge → HiveVector (entity embeddings)
  Any RAG pipeline
         │
         ▼
   HiveVector API (unified retrieval interface)
         │
   ┌─────┴────────────────────────────────────┐
   │          Vector Store Engine             │
   │  ┌────────────────┐  ┌────────────────┐  │
   │  │  pgvector       │  │  Qdrant        │  │
   │  │  (primary)      │  │  (high-speed)  │  │
   │  │  <1M vectors/ns │  │  >1M vecs/ns  │  │
   │  └────────────────┘  └────────────────┘  │
   └──────────────────────────────────────────┘
         │
   HiveStorage (raw vector blobs — backup/archive)
   HiveIdentity (namespace ACL)
```

---

## 3. Core Capabilities

### 3.1 Multi-Engine Storage
HiveVector operates two storage backends, selected automatically based on collection size and throughput requirements:

**pgvector (primary, <1M vectors per namespace)**
- PostgreSQL extension providing native vector storage and ANN search.
- Advantages: ACID transactions, SQL joins (combine vector search with structured metadata filters), operational simplicity.
- Index types: IVFFlat (balanced), HNSW (high-recall, lower memory).
- Default for most enterprise workloads where correctness and transactional consistency matter more than raw throughput.

**Qdrant (high-throughput, >1M vectors or >1,000 QPS)**
- Dedicated vector database engine written in Rust. Purpose-built for high-dimensional ANN at scale.
- Advantages: Handles billions of vectors, higher QPS, lower latency at scale, native payload filtering.
- Used automatically when namespace grows beyond 1M vectors or sustained query rate exceeds 1,000 QPS.
- Migration from pgvector to Qdrant is transparent to callers — HiveVector handles routing.

### 3.2 Namespace Isolation
Every tenant and every use case (agent memory, document search, knowledge graph) gets a dedicated namespace:

- **Hard Isolation**: Namespaces are completely isolated. A search query in namespace A cannot return results from namespace B — enforced at the storage engine level.
- **Sub-Namespaces**: Namespaces can be hierarchically partitioned. A tenant with 50 departments can have `tenant/finance`, `tenant/legal`, `tenant/hr` sub-namespaces with independent access control.
- **Cross-Namespace Search**: Explicitly authorized cross-namespace search (e.g., a global search across all departments) is supported with a dedicated federated search API that unions results and re-ranks.

### 3.3 Hybrid Search (Dense + Sparse)
Pure vector search misses keyword matches; pure keyword search misses semantic relationships. HiveVector supports hybrid search combining both:

**Dense Retrieval (bi-encoder)**
- Query and documents encoded as dense vectors using embedding models (text-embedding-3-large, E5-large, GTE-large).
- Cosine similarity-based ANN search.
- Best for: semantic similarity, concept matching, paraphrases.

**Sparse Retrieval (BM25)**
- Classic keyword-based retrieval using BM25 scoring.
- Maintained as an inverted index alongside the vector index.
- Best for: exact term matching, rare terms, product codes, proper nouns.

**Fusion (Reciprocal Rank Fusion)**
- Results from dense and sparse retrieval are fused using RRF (Reciprocal Rank Fusion).
- RRF weight (α parameter) is configurable per collection (default: 0.6 dense / 0.4 sparse).
- Final results re-ranked by a cross-encoder for maximum precision.

### 3.4 Metadata Filtering
Every vector is stored with an associated metadata payload (structured JSON). Queries can combine vector similarity with metadata filters:

```json
// Find semantically similar documents, but only from the finance department
// and only documents created in the last 90 days
{
  "query_vector": [0.1, 0.23, ...],
  "filter": {
    "must": [
      { "key": "department", "match": { "value": "finance" } },
      { "key": "created_at", "range": { "gte": "2026-04-24" } },
      { "key": "classification", "match": { "value": "confidential" } }
    ]
  },
  "top_k": 20
}
```

Filters are applied before similarity scoring (pre-filtering), avoiding expensive similarity computation on irrelevant documents.

### 3.5 Index Management
Vector indexes require active management to remain performant:

**Automatic Index Optimization**
- Background process monitors index fragmentation and query latency.
- Triggers index rebuild when recall drops below 95% (detected via shadow query evaluation).
- Index rebuilds are online — queries continue during rebuild.

**Embedding Model Versioning**
- Each collection is associated with a specific embedding model version.
- When an embedding model is upgraded, HiveVector automatically re-embeds all vectors in the collection using the new model, with zero downtime (dual-index during migration).

**Collection Snapshots**
- On-demand and scheduled snapshots of collections to HiveStorage.
- Point-in-time recovery from any snapshot.

### 3.6 Retrieval Observability
- **Query Logging**: Every search query logged (query embedding, filters, result IDs, latency, recall score) to HiveObservatory.
- **Retrieval Quality Monitoring**: Background eval runs synthetic queries against each collection and measures recall@K against a gold standard. Alerts when recall drops below configured threshold.
- **Index Health Dashboard**: Per-collection metrics in HiveConsole: index size, query QPS, latency P50/P95/P99, recall score.

---

## 4. Embedding Model Management

HiveVector does not perform embedding — that is the responsibility of the caller (via HiveModels). However, HiveVector maintains a **model registry** that tracks which embedding model was used to generate each collection's vectors, ensuring consistency:

| Model | Dimensions | Best For | Performance |
|---|---|---|---|
| text-embedding-3-large | 3072 | High-precision enterprise RAG | Highest quality, higher cost |
| text-embedding-3-small | 1536 | General-purpose retrieval | Balanced cost/quality |
| E5-large-v2 | 1024 | On-premise/open-source deployments | Strong multilingual |
| GTE-large | 1024 | Long-document retrieval | Strong context length |
| BGE-M3 | 1024 | Multilingual + hybrid (dense + sparse) | Best multilingual |

---

## 5. API Surface

### Create Collection
```http
POST /v1/vector/collections
Authorization: Bearer {hive_token}

{
  "name": "finance_documents",
  "namespace": "tenant_xyz/finance",
  "embedding_model": "text-embedding-3-large",
  "dimensions": 3072,
  "index_type": "hnsw",
  "hybrid_search": true,
  "metadata_schema": {
    "department": "string",
    "created_at": "datetime",
    "classification": "string",
    "document_type": "string"
  }
}

→ 201 Created { "collection_id": "col_abc123", "status": "ready" }
```

### Upsert Vectors
```http
POST /v1/vector/collections/{collection_id}/upsert
Authorization: Bearer {hive_token}

{
  "vectors": [
    {
      "id": "doc_001",
      "vector": [0.1, 0.23, ...],   // 3072 dimensions
      "sparse_vector": { "indices": [12, 45, 678], "values": [0.9, 0.7, 0.5] },
      "payload": {
        "text": "Q3 financial projections show 23% growth...",
        "department": "finance",
        "created_at": "2026-07-24T00:00:00Z",
        "classification": "confidential",
        "document_type": "report",
        "source_url": "sharepoint://finance/q3-projections.docx"
      }
    }
  ]
}

→ 200 OK { "upserted": 1, "updated": 0 }
```

### Search
```http
POST /v1/vector/collections/{collection_id}/search
Authorization: Bearer {hive_token}

{
  "query_vector": [0.08, 0.31, ...],
  "sparse_query": { "indices": [12, 45], "values": [0.8, 0.6] },
  "filter": {
    "must": [
      { "key": "department", "match": { "value": "finance" } }
    ]
  },
  "top_k": 10,
  "with_payload": true,
  "rerank": true
}

→ 200 OK
{
  "results": [
    {
      "id": "doc_001",
      "score": 0.94,
      "payload": { "text": "...", "department": "finance", ... }
    }
  ],
  "latency_ms": 18
}
```

---

## 6. Security Model

| Control | Implementation |
|---|---|
| Namespace Isolation | Hard separation at storage engine level — cannot be bypassed |
| Access Control | HiveIdentity RBAC: `hive-vector:read:{collection_id}` and `hive-vector:write:{collection_id}` scopes |
| Query Logging | All queries logged to HiveGovern (who searched for what, when) |
| Embedding Privacy | Vectors are stored as float arrays — reversing to original text is computationally infeasible for well-tuned embeddings |
| Snapshot Encryption | Collection snapshots in HiveStorage are encrypted with tenant CMK |

---

## 7. SLAs

| Metric | Target |
|---|---|
| Search latency P99 (<1M vectors, no rerank) | <20ms |
| Search latency P99 (<1M vectors, with rerank) | <80ms |
| Search latency P99 (>1M vectors, Qdrant) | <50ms |
| Recall@10 (HNSW, ef=128) | >97% |
| Upsert latency P99 | <50ms |
| Index availability | 99.9% |
| Collection snapshot completion (<10M vectors) | <30 minutes |

---

## 8. Roadmap

| Milestone | Timeline | Description |
|---|---|---|
| Multi-Vector Support (ColPali) | Q4 2026 | Support for multi-vector per document (ColBERT-style late interaction) and image embeddings for multimodal retrieval |
| Streaming Index Updates | Q1 2027 | Real-time index updates via Kafka stream — new documents indexed within <1 second of ingestion without batch jobs |
| Federated Search | Q1 2027 | Cross-collection, cross-namespace federated search with unified ranking (for enterprise global search use case) |
| Approximate Recall Guarantees | Q2 2027 | Configurable recall guarantees with latency trade-off (e.g., "guarantee >99% recall, accept up to 200ms latency") |

---

## 9. Success KPIs

| KPI | Target | Frequency |
|---|---|---|
| Search latency P99 | <20ms (no rerank) | Real-time |
| Recall@10 | >97% | Weekly (eval benchmark) |
| Index availability | 99.9% | Continuous |
| Cross-namespace isolation incidents | 0 | Real-time |
| Re-embedding success rate (model upgrades) | 100% | Per-upgrade |
| Retrieval quality degradation alerts | <24h detection latency | Continuous |
