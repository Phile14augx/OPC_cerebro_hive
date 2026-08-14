# Technology Matrix

Registry source: `packages/plugin-sdk/src/technology.ts`. Logos in the UI are **not** evidence of support.

| Technology | Generate | Build | Run | Test | Deploy |
|---|---:|---:|---:|---:|---:|
| React | planned | planned | planned | planned | planned |
| Next.js | planned | planned | planned | planned | planned |
| Spring Boot | planned | planned | planned | planned | planned |
| Fastify / NestJS | planned | planned | planned | planned | planned |
| Go | planned | planned | planned | planned | planned |
| Rust / Axum | planned | planned | planned | planned | planned |
| .NET | planned | planned | planned | planned | planned |
| FastAPI | planned | planned | planned | planned | planned |
| C++ / Drogon | planned | — | experimental | planned | experimental |
| PostgreSQL | n/a | n/a | local compose | planned | planned |
| Redis | n/a | n/a | local compose | planned | planned |
| MongoDB | n/a | n/a | local compose | planned | planned |
| Qdrant | n/a | n/a | local compose | planned | planned |
| Pinecone | n/a | n/a | credential required | planned | external |
| Kubernetes / AWS / Azure / GCP | n/a | n/a | credential required | — | external |

“planned” means the registry knows the technology and Day 2+ generators/adapters are scheduled. `generator.supported` and local `runtime.supported` are **false** until an adapter writes or runs real artifacts. Compose-backed data stores (Postgres, Redis, MongoDB, Qdrant) may list a container image without claiming a Database Studio adapter exists.
