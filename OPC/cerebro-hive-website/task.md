# Task Tracker: Milestone 18 - Enterprise Knowledge Graph

## Phase 1: Ontology & Graph SDK (`packages/ontology-sdk`)
- `[ ]` Define Entity schemas (Organization, Technology, Business domains)
- `[ ]` Define Relationship schemas (`BELONGS_TO`, `OWNS`, `USES`, `DEPENDS_ON`, `GENERATES`)
- `[ ]` Add Temporal and Provenance metadata to nodes and edges

## Phase 2: Graph Persistence (`services/knowledge-ops`)
- `[ ]` Scaffold the `GraphStore` abstraction interface
- `[ ]` Implement `PostgresGraphStore` (relational graph backing using Postgres)
- `[ ]` Scaffold the Event-Driven Ingestion Pipeline (Entity & Relationship Extraction)
- `[ ]` Implement Hybrid Entity Resolution (Deterministic match -> Probabilistic fallback)

## Phase 3: Query & Reasoning Integration
- `[ ]` Expose `QueryKnowledgeGraph` tool for Agents
- `[ ]` Update `ContextBuilder` to fuse Graph Traversal, Vector Search, and Memory Retrieval into a single context payload
