# 0001: Perceptronic Enterprise Knowledge Graph as Nexarch kernel

**Status:** Accepted · **Frozen at L3** 2026-08-15. No Wave 0 spec or runtime follow-on.  
**Date:** 2026-08-15  
**Ledger:** `KRN-015` (parent) · `KRN-KG-001` … `KRN-KG-012` (decomposition)  
**Spec:** [`../../perceptronic-enterprise-knowledge-graph.md`](../../perceptronic-enterprise-knowledge-graph.md)

## Context

HiveKnowledge (`PROD-022`) is specified as the enterprise knowledge graph product. The kernel already lists `KRN-015` Knowledge Graph and `KRN-016` Vector/Retrieval as separate rows. `packages/knowledge-graph-core` has a port, an in-memory adapter, a narrow CMDB/AI-ops ontology, provenance on nodes/edges, and temporal fields on edges.

Two failure modes are visible:

1. Treating the graph as another of the 50 products, duplicating identity, policy, agent, and model registries beside it.
2. Shipping a visual graph that filters unauthorized nodes in the UI after traversal and retrieval have already loaded them into model context.

CerebroEDA already decided (`eios-eda/0012`) that *its* design graph is PostgreSQL adjacency tables, with a native graph store only on measured triggers. `eios-eda/0002` prefers relational modelling of graph structure. `KRN-016` is pgvector, not a dedicated vector database.

Nexarch still needs one cognitive map that joins people, organization, knowledge, agents, models, tools, workflows, and permissions — with embeddings, confidence, provenance, activation, and policy on the same ontology.

## Decision

1. **Kernel, not product 51.** The Perceptronic Enterprise Knowledge Graph *is* `KRN-015`. HiveKnowledge remains the product surface. Subordinate IDs `KRN-KG-001`…`KRN-KG-012` decompose `KRN-015`; they do not add kernel rows to the 27.

2. **One ontology, many projections.** Organization, knowledge, agent, model, and access views are lenses over one graph. Personal OS and Enterprise Agentic OS consume the same primitives.

3. **Four planes, P1 constrains the rest.** Governance (identity, access, policy, provenance, audit) constrains semantic, operational, and perception/reasoning planes. Retrieval, embeddings, reasoning, visualization, and agents cannot bypass policy.

4. **Authorize before traverse, retrieve, reason, or render.** The control is an authorized subgraph, not UI hiding. Policy evaluation uses scope × classification × capability, plus purpose and delegation-chain intersection for agents. Humans and agents share one policy plane (`KRN-003`, `KRN-004`).

5. **Postgres is the system of record.** Graph and vector stores are projections behind ports on the Knowledge Gateway. Current adapters: in-memory graph + pgvector. Native graph (Neo4j named) and dedicated vector (Qdrant named) are allowed later as *projections*, not a second SoR, and only behind the same ports.

6. **Projections are disposable.** Every derived graph store, vector store, cache, or visualization index must be reconstructible from PostgreSQL plus immutable source/provenance records. If dropping the projection loses truth, it has become an illegal alternative truth plane.

7. **EDA graph is unchanged.** `eios-eda/0012` still governs CerebroEDA’s design-knowledge store. A future native graph projection for Nexarch does not silently migrate EDA.

8. **Epistemic states are distinct.** Agents write observations and claims. Canonical facts require verification. Conflicting claims coexist until promoted.

9. **Policy projection precedes perception.** After hybrid retrieval ports (`KRN-KG-006`), `KRN-KG-010` is required before activation (`007`), reasoning (`008`), visualization (`009`), agent interface (`011`), and audit (`012`). Activation and reasoning **must never** run on the unrestricted enterprise graph and redact afterward. Residual risk scores on already-authorized nodes are allowed; post-hoc policy filters are not. This blocks hidden-node inference, sensitive relationship leakage, vector-neighbor leakage, and agent traversal across authorization boundaries.

10. **Hybrid retrieval.** Graph traversal and vector search are complementary. `KRN-KG-006` consumes `KRN-016`; it does not replace it. Both projection stores remain rebuildable.

11. **One family ontology.** `Ontology.ts` is the canonical surface. Six families (`KNOWLEDGE`, `ORGANIZATION`, `WORK`, `AI`, `SYSTEM`, `GOVERNANCE`) with concrete types underneath. Existing CMDB/AI-ops string values (`AIModel`, `BusinessService`, `ConfigurationItem`, …) stay valid. No parallel perceptronic ontology.

12. **Frozen at L3 until Wave 1.** Runtime/persistence implementation belongs to Wave 1 after W0.3 durable persistence. Evidence of `KRN-015` stays L3. Ontology package typecheck is surface evidence only. Do not extend this specification during Wave 0 to make it more complete.

**Dependency order**

```text
KRN-KG-001  Ontology
      ↓
KRN-KG-002  Entity Resolution
      ↓
KRN-KG-003  Knowledge Ingestion
      ↓
KRN-KG-004  Provenance / Claims
      ↓
KRN-KG-005  Temporal Graph
      ↓
KRN-KG-006  Hybrid Retrieval Ports
      ↓
KRN-KG-010  Policy-Aware Projection
      ↓
      ├───────────────┐
      ▼               ▼
KRN-KG-007        KRN-KG-008
Activation        Graph Reasoning
      └───────┬───────┘
              ↓
KRN-KG-009  Visualization
              ↓
KRN-KG-011  Agent Graph Interface
              ↓
KRN-KG-012  Audit / Explainability
```

Wave-1 gate: W0.3 durable persistence must exit first.

**Wave-1 reconstructibility acceptance test** (do not implement in Wave 0): seed Postgres + provenance → build projections → record hashes/counts → drop projection stores → recreate empty → rebuild from authoritative records only → compare inventories → confirm zero unrecoverable state. Failure = illegal second system of record.

## Consequences

### Positive

- One place to ask structural questions RAG cannot answer (agent × department × model × classification).
- Model router (`KRN-010`) can select eligible models from the same graph.
- Audit can reconstruct traversal, activation, and policy decisions.
- Avoids a 51st product and a second identity/policy stack.

### Negative / constraints

- Ontology expansion is additive: legacy `NodeKind` / `RelationshipType` string values remain valid; new families sit beside them.
- Native Neo4j/Qdrant add operational surface; they are gated, disposable projections, not implied as SoR.
- Policy-before-retrieval is harder than retrieve-then-redact; it is the required hardness.
- HiveSemantic (`PROD-023`) and HiveVector (`PROD-024`) must stay façades over this kernel, not competing graphs.

### Follow-through

- `Ontology.ts` carries six families with legacy CMDB/AI-ops kinds mapped in. Do not fork.
- Put perceptronic runtime fields on the node (or a query-scoped overlay), not only in untyped `properties`.
- Separate Claim vs Canonical Fact in the domain model (Wave 1, `KRN-KG-004`).
- Bind `KRN-KG-010` to the existing policy engine before activation, reasoning, or any Studio graph UI is treated as enterprise-complete.
- Any graph/vector adapter must declare a rebuild path from Postgres + provenance; no adapter may accept writes that are not also committed to the SoR.
- Wave-1 must include the drop-and-rebuild projection test in the spec §13. No further Wave 0 work on this ADR.
