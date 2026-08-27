# Architecture

## Component Diagram

```mermaid
graph TD
    Client[Client Applications / AI Agents] --> |GraphQL/Cypher| API[Graph API Gateway]
    API --> GraphEngine[(Graph Storage Engine)]
    
    subgraph Knowledge Graph Platform (P04)
        API
        GraphEngine
        
        Ingestion[Ingestion Pipeline] --> GraphEngine
        OntologyMgr[Ontology Manager] --> API
        ER[Entity Resolution Engine] <--> GraphEngine
        Embeddings[Graph Embeddings Engine] <--> GraphEngine
    end
    
    DataSources[(Enterprise Data Lakes)] --> Ingestion
    P03[P03 Vector Intelligence] <--> Embeddings
    P28[P28 GraphRAG] --> API
```

## Technology Stack Decisions
- **Graph Storage Engine:** Apache AGE (PostgreSQL extension).
  - *Rationale:* Leverages existing PostgreSQL enterprise infrastructure, supports Cypher queries via OpenCypher, and allows hybrid relational-graph querying without spinning up a completely disparate NoSQL cluster like Neo4j.
- **Query Language:** openCypher.
  - *Rationale:* Industry standard, declarative, and highly expressive for complex graph pattern matching.
- **API Layer:** GraphQL and gRPC endpoints.
  - *Rationale:* Provides flexibility for client applications and high performance for internal microservices.
- **Entity Resolution / ML:** Python-based services (PyTorch Geometric for GNNs).

## Deployment Topology
- Distributed cluster running on Kubernetes (GKE).
- Master-Replica architecture for the Apache AGE instances to ensure read scalability.
- StatefulSets for graph storage with persistent volumes (NVMe SSDs for low-latency traversals).

## Scalability Approach
- Read replicas handle the bulk of GraphRAG traversals.
- Graph partitioning and sharding based on heavily disconnected enterprise sub-graphs (if necessary).
- Caching layer (Redis) for frequently accessed ontologies and node properties.

## Integration Points
- **P03 Vector Intelligence:** P04 consumes node embeddings from P03, and P03 utilizes graph context for hybrid search.
- **P28 GraphRAG:** P28 consumes the Cypher endpoints for multi-hop semantic context generation.
- **P50 Enterprise Brain:** P50 queries P04 for long-term relational memory and enterprise grounding.
