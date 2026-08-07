# Cerebro Hive animated architecture infographic

## Purpose

Create an engineering-first animated architecture explorer that describes Cerebro Hive as a layered EIOS platform. It must make the current portfolio, shared platform, data/control paths, future products, services, and research horizon understandable without collapsing lifecycle status into a single undifferentiated diagram.

## Audience and delivery targets

Primary users are technical engineers and architects. The source artifact is a self-contained, responsive HTML explorer. The same visual model will be packaged for embedding in the Cerebro Hive website and designed so a guided animation sequence can be captured for presentations or video.

## Information architecture

The initial view is a Layered Blueprint. It presents six vertical layers:

1. Industry solutions and integration edge.
2. Cerebro Applications: 19 application products.
3. Hive Platform: 32 shared platform products.
4. Intelligence: agent runtime, models, planning, reasoning, memory, evaluation, and retrieval.
5. Data, infrastructure, identity, network, governance, security, and observability.
6. Research horizon: future deep-tech initiatives and research-stage products.

The initial layer view groups products by family rather than showing 51 individual cards. Selecting a family opens a drill-down panel with each product’s lifecycle stage, dependencies, stack, deployment posture, and key protocols. Selecting a product focuses the connection graph on its upstream and downstream dependencies.

## Visual and interaction design

The blueprint is dark, high-contrast, and technical. Solid nodes are shipped or active products; outlined/dashed nodes are future, MVP, or research-stage capabilities. Colour distinguishes planes (application, control, data/intelligence), while shape and labels always carry the meaning independently. A persistent legend exposes GA, Beta, MVP, and Research status.

Initial motion is a brief, non-looping reveal: infrastructure and trust foundations appear first; intelligence and platform services follow; applications and industry integrations settle last. On interaction, only affected links and the details panel animate. All motion respects `prefers-reduced-motion`.

## Canonical content

The visual is generated from the repository’s product registry and architecture documentation. The baseline includes 19 Cerebro Applications and 32 Hive Platform products. Representative stacks include:

- CerebroStudio: Next.js 14, React Server Components, GraphQL Federation, Redis pub/sub.
- CerebroAgent: Python, LangGraph, pgvector, Redis Streams, FastAPI.
- CerebroArchive: Python, Apache Tika, pgvector, dbt, PostgreSQL, Next.js.
- HiveIdentity: Rust, PostgreSQL, Redis, JOSE/JWT.
- HiveGateway: Rust/Go, Envoy, PostgreSQL.
- HiveData and HiveLake: Python/dbt/Airflow/Arrow and Iceberg/Trino/Spark/MinIO.
- HiveAgents and HiveMemory: Python, gVisor, Kafka/Redis Streams/Temporal, pgvector, FastAPI.
- HiveGovern: Go, OPA, PostgreSQL append-only audit log, Kafka.
- CerebroEDA: Research-stage chip-design application using Next.js, GraphQL Federation, gRPC, PostgreSQL, Kafka, graph/vector/search stores, Redis, ClickHouse, WASM plugins, and gVisor runners.

Research is represented as grouped capability domains rather than speculative individual products: foundation/agentic/multimodal AI; robotics and autonomous systems; AI hardware and edge/quantum/neuromorphic computing; federated/swarm/causal/neuro-symbolic AI; scientific AI; spatial computing and digital humans; bio/materials/drug discovery; and climate AI.

## Connection semantics

Arrows have explicit labels and a limited vocabulary: request/API, event stream, identity/policy, retrieval/memory, data pipeline, workflow, and telemetry. The default highlighted journey is: Industry client → HiveGateway and HiveIdentity → Cerebro application → HiveAgents/Models/Memory → HiveData/Lake/Vector → HiveGovern/Observatory. The drill-down graph suppresses unrelated links to preserve readability.

## Data integrity and failure states

No architecture fact will be invented. If a product has no documented dependency, protocol, or deployment model, the panel says “not yet catalogued” rather than inferring one. Missing or malformed registry entries remain visible in a validation state and cannot render as a false production capability. The standalone artifact works without a network connection and has an accessible plain-text fallback for the architecture structure.

## Verification

- Validate every displayed product against `architecture/capabilities/PRODUCT_REGISTRY.md`.
- Verify lifecycle labels and technology stacks for every drill-down entry.
- Test navigation, focus, keyboard use, reduced motion, and responsive layouts at desktop and mobile widths.
- Test that family filtering and product selection update connection paths and details consistently.
- Validate the standalone page has no external runtime dependency and the website embed has no styling or routing conflicts.
- Capture the animation sequence only after the interactive version passes the above checks.

## Scope boundaries

This artifact documents and visualizes the portfolio; it does not alter production services, infer undocumented runtime relationships, or claim all roadmap components are implemented. Video and presentation exports reuse the verified interactive model rather than becoming independently maintained architecture diagrams.
