```yaml
name: services/ml-svc
language: C++
framework: gRPC
entrypoint: src/main.cpp
protocol: gRPC
deployment: standalone binary (Dockerfile present)
consumes:
  - pgvector (via pgvector_client)
produces:
  - embedding_engine, lead_scorer, recommender, vector_index — all exposed via ml_service_impl.cpp gRPC service
health: not yet confirmed
owner: unknown
confidence: structural
duplicate: Possible overlap with any TS-side vector/embedding work in packages/ai or elsewhere — not checked this pass.
status: >
  Real file structure: embeddings, lead scoring, recommendations, vector index, all backed by a Postgres pgvector client, exposed over gRPC. Not deep-read past file structure.
notes: >
  (none)
```
