# CerebroArchive — Reference Architecture (10/10)

## Vision
A modern AI research and knowledge platform optimized for maximum performance, low latency, and rapid development. We prioritize a pragmatic, progressive scale path—starting simple with a Modular Monolith and evolving toward microservices only as traffic demands.

## 1. Domain-Driven Modular Monolith (Go API)
To avoid early operational complexity, we begin with a **Domain-Driven Modular Monolith**, extracting services only when scale requires it.

```text
internal/
    archive/
    research/
    ingestion/
    search/
    identity/
    analytics/
    administration/
```
Each domain contains its own handlers, services, repositories, models, validation, and tests, ensuring strict boundaries and facilitating future microservice extraction.

## 2. Monorepo Organization
```text
apps/
    web        (Next.js Frontend)
    api        (Go Domain-Driven API)
    ai         (FastAPI Python Services)
packages/
    shared
    ui
    types
    sdk
internal/
    docs
    scripts
deploy/
    docker
    kubernetes
infra/
    terraform
docs/
    architecture
    adr        (Architectural Decision Records)
```

## 3. Recommended Technology Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 + React + TypeScript | SSR, SEO, streaming |
| **API Layer** | Go (Gin/Fiber) | Extremely fast, low memory, high concurrency |
| **AI Services** | Python (FastAPI) | ML ecosystem, embeddings, inference |
| **Authentication** | Keycloak or Auth.js + JWT | Enterprise-ready |
| **Database** | PostgreSQL 17 | ACID, JSONB, Full Text Search |
| **Cache** | Valkey (Redis-compatible) | Open-source (replaces Redis due to licensing) |
| **Search** | OpenSearch | Papers, semantic search, filtering |
| **Vector DB** | pgvector (inside PostgreSQL) | Semantic search without another database |
| **Object Storage** | MinIO (S3 compatible) | PDFs, datasets, images |
| **Queue** | NATS JetStream | Fast asynchronous processing |
| **Monitoring** | Prometheus, Grafana, Loki, OpenTelemetry | Full Observability |

## 4. Background Worker & Ingestion Pipeline
Operations that shouldn't block HTTP requests are offloaded to workers via NATS.

**Comprehensive Ingestion Pipeline:**
`Upload` → `Validation` → `Virus Scan` → `Metadata Extraction` → `OCR` → `Language Detection` → `Citation Extraction` → `Entity Recognition` → `Embedding Generation` → `Index` → `Publish`

## 5. Expanded Database Model (Multi-Tenant Ready)
- **Core (Tenant Aware):** Organizations, Workspaces, Users, Roles & Permissions
- **Content:** Papers, Journals / Conferences, Versions / Revisions, Licenses
- **Metadata:** Authors, Citations, References, Categories, Tags
- **Research Data:** Benchmarks, Models, Datasets
- **User Features:** Collections, Saved Searches, Notifications, Bookmarks
- **Governance:** Activity log, Audit log

## 6. Phased Search Strategy
- **Phase 1:** PostgreSQL Full-Text Search
- **Phase 2:** PostgreSQL + pgvector (Semantic Search)
- **Phase 3:** OpenSearch (Advanced faceting, aggregations, and large-scale search)

## 7. Enterprise Governance & Lifecycle

### AI Governance
- Model versioning, prompt versioning, embedding regeneration
- Evaluation datasets and hallucination monitoring
- Human review workflows

### Testing & API Strategy
- Unit, Integration, E2E, Contract, Load, and Security testing
- OpenAPI generation, request/response validation, typed SDK generation
- API strictly versioned starting at `/api/v1`

### Security, Operations & DR
- Automated PostgreSQL backups, MinIO versioning, replication, retention policies
- Structured JSON logs, Request IDs, Correlation IDs, Tracing
- Row-Level Security, Signed URLs, Rate Limiting, API Keys, Audit logging
- Feature flags, configuration management, secret rotation

### Architectural Decision Records (ADR)
All major choices (e.g., Why Go? Why Valkey? Why OpenSearch later?) must be documented in `/docs/adr/`.

## 8. Non-Functional Requirements (NFR)
| Category            | Target                                        |
| ------------------- | --------------------------------------------- |
| API latency         | <100 ms (95th percentile for cached requests) |
| Search latency      | <300 ms                                       |
| Availability        | 99.9%+                                        |
| Error rate          | <0.1%                                         |
| Recovery objectives | Defined RPO/RTO targets                       |
| Accessibility       | WCAG 2.2 AA                                   |

## 9. Deployment Roadmap

**Phase 1: Minimum Viable Platform**
Next.js, Go (Modular Monolith), PostgreSQL, Valkey, MinIO, Docker Compose

**Phase 2: AI & Asynchronous Processing**
FastAPI AI service, pgvector, NATS & Background workers

**Phase 3: High Scale & Search**
OpenSearch, Horizontal scaling of the Go API

**Phase 4: Enterprise Scale**
Kubernetes, Read replicas, CDN optimization, Multi-region deployment
