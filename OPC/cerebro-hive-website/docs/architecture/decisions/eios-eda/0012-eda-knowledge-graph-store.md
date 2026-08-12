# 0012: CerebroEDA Knowledge Graph Store

**Decision ID:** D1
**Gates:** Phase 4 (Knowledge Layer)
**Date:** 2026-08-01

## Status

Accepted

## Context

The design knowledge graph is the substrate the AI layer reasons over (Blueprint §14). Its query patterns are unusual for an application database:

- **Variable-depth traversal.** "What is affected if I change parameter `WIDTH` on module `fifo`?" descends an instantiation hierarchy of unknown depth, then moves laterally through connectivity, then into timing paths and tests.
- **Path queries.** "Which RTL change introduced this violation?" walks from a path signature through cells to modules to revisions.
- **Scale.** A large SoC produces roughly 10⁵–10⁶ module instances, 10⁶–10⁷ nets, and 10⁶ timing paths per corner. Multiply by corners and revisions.
- **Write pattern.** Bulk projection from events, not interactive writes. The graph is a projection and is fully rebuildable by replay (Blueprint §7.1).
- **Read pattern.** Bounded-depth exploration from an anchor node, almost never global analytics.

The Blueprint deliberately left this open (§12), proposing Postgres first with a swap behind the `knowledge-service` API when measurement demands it. This ADR records that position and — more usefully — specifies the evidence that would trigger the swap. An unfalsifiable "we'll change it if we need to" is not a decision.

Also relevant: ADR 0002 (Relational Graph Modeling) already established a house preference for relational modelling of graph structures, and `HiveKnowledge` exists as the mesh's graph substrate. Introducing Neo4j would be both a departure from precedent and a new operational dependency.

## Decision

**We implement the knowledge graph in PostgreSQL using adjacency tables with recursive CTEs, behind the `knowledge-service` API. We commit to migrating to a native graph store only on defined, measured trigger conditions.**

### Schema

```sql
CREATE TABLE graph_nodes (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL,
  project_id    TEXT NOT NULL,
  kind          TEXT NOT NULL,        -- Module | Net | TimingPath | Decision | ...
  natural_key   TEXT NOT NULL,        -- stable within (project, kind)
  props         JSONB NOT NULL DEFAULT '{}',
  revision_id   TEXT,
  projector_ver INT  NOT NULL,
  UNIQUE (project_id, kind, natural_key)
);
CREATE INDEX ON graph_nodes (project_id, kind);
CREATE INDEX ON graph_nodes USING GIN (props jsonb_path_ops);

CREATE TABLE graph_edges (
  src_id        TEXT NOT NULL,
  dst_id        TEXT NOT NULL,
  kind          TEXT NOT NULL,        -- INSTANTIATES | CONNECTS_TO | ...
  org_id        TEXT NOT NULL,
  project_id    TEXT NOT NULL,
  props         JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (src_id, kind, dst_id)
);
CREATE INDEX ON graph_edges (dst_id, kind, src_id);   -- reverse traversal
CREATE INDEX ON graph_edges (project_id, kind);
```

Both directions are indexed, since impact analysis descends and provenance ascends. Nodes carry `projector_ver` so a projector change triggers a targeted rebuild of only the nodes it owns.

### Traversal

Depth-bounded recursive CTEs with explicit cycle detection and result caps:

```sql
WITH RECURSIVE impact AS (
  SELECT n.id, 0 AS depth, ARRAY[n.id] AS path
  FROM graph_nodes n WHERE n.id = $anchor
  UNION ALL
  SELECT e.dst_id, i.depth + 1, i.path || e.dst_id
  FROM impact i
  JOIN graph_edges e ON e.src_id = i.id
  WHERE i.depth < $max_depth
    AND e.kind = ANY($edge_kinds)
    AND NOT e.dst_id = ANY(i.path)      -- cycle guard
)
SELECT * FROM impact LIMIT $cap;
```

Every traversal is bounded by depth, edge-kind allowlist, and result cap. Unbounded traversal is not exposed through the API at all — not as a performance guard but as a product decision: an impact analysis returning 400,000 nodes is not an answer, and an engineer needs a ranked, bounded neighbourhood.

### Denormalisation for known hot paths

Two materialised structures, refreshed by the projector:

1. **`module_closure`** — transitive instantiation closure per revision, with depth. Makes "everything under this module" a single indexed lookup instead of a recursion. Bounded in size by hierarchy depth (typically < 15) rather than by graph size.
2. **`path_module_index`** — precomputed mapping from timing path signature to the set of modules it traverses. This is the single most common join in timing analysis and doing it recursively per query is the design's most obvious performance cliff.

Denormalisation is acceptable here precisely because the graph is a projection — inconsistency is repaired by replay, not by transactional discipline.

### Migration triggers

We migrate to a native graph store when **any** of the following is measured in production or in the reference-SoC staging environment:

| # | Trigger | Threshold |
|---|---|---|
| T1 | Impact analysis p95 latency | > 3s at depth 5 on a representative SoC |
| T2 | Traversal depth demanded by a shipped feature | > 8 hops routinely |
| T3 | Graph size in one project | > 50M edges |
| T4 | Recursive CTE query plans requiring hand-tuning | more than twice in a quarter |
| T5 | A required query is not expressible without procedural code | any occurrence |

T5 is the most likely trigger in practice — variable-length path queries with per-hop predicates ("find a path from this register to that register that passes through no more than two clock domains") are natural in Cypher and genuinely painful in SQL.

### Portability constraints

To keep the migration a contained change, three rules hold from day one:

1. **No SQL outside `knowledge-service`.** No other service queries `graph_nodes` or `graph_edges` directly.
2. **The API is expressed in graph terms**, not relational ones: `traverse(anchor, edgeKinds, maxDepth, filters)`, `shortestPath(a, b, constraints)`, `neighbourhood(anchor, budget)`. These map to Cypher without redesign.
3. **The projector writes through a `GraphWriter` interface**, so a second implementation can be added and dual-written during migration.

## Alternatives Considered

**Neo4j from day one.**
Rejected for now, and it is a close call. Native traversal, Cypher expressiveness, and mature tooling are real advantages, and the query patterns above are exactly what it is built for. Against: a new stateful system with its own HA, backup, upgrade, and per-tenant isolation story (ADR 0010 requires database-per-tenant here, multiplying the operational cost); an AGPL/commercial licensing question for on-prem distribution; a second consistency domain with Postgres; and — decisively for a Phase 4 feature — no evidence yet that Postgres is insufficient. Adopting it now would be an architectural decision made on aesthetics rather than measurement.

**Memgraph.**
Same expressiveness, better in-memory performance, Cypher-compatible. Rejected on the same grounds as Neo4j plus a smaller operational track record. Remains the leading candidate alongside Neo4j if a trigger fires, and its memory-resident model suits a rebuildable projection well.

**Apache AGE (Postgres graph extension).**
Genuinely attractive: Cypher inside Postgres, no new system. Rejected for now on maturity — planner integration for deep traversals is weaker than native execution, and the project's release cadence and production track record do not yet justify betting a cornerstone feature on it. Worth re-evaluating at each trigger review; if AGE matures, it is the lowest-migration-cost answer.

**`HiveKnowledge` as-is.**
The mesh's graph product. Not rejected — but it is a general enterprise knowledge graph, and the EDA design graph has domain-specific scale and query characteristics. Current position: the design graph is a CerebroEDA-owned projection, while `HiveKnowledge` remains the substrate for cross-product enterprise knowledge. If `HiveKnowledge` gains a native graph backend, this ADR should be revisited rather than duplicating effort.

**Datalog engines / RDF triple stores.**
Rejected. Excellent for recursive reasoning; poor operational fit, small talent pool, and awkward integration with the rest of the stack.

## Consequences

**Positive**

- No new stateful system before Phase 4. One backup story, one HA story, one migration story.
- RLS-based tenant isolation (ADR 0010) applies uniformly, with no separate graph isolation model to design and test.
- Transactional consistency between graph projection and domain data when needed.
- Team familiarity — no Cypher expertise required to ship Phase 4.
- Migration decision becomes evidence-driven and pre-committed, rather than a recurring debate.

**Negative**

- Recursive CTEs are harder to read and harder to optimise than Cypher. Complex traversals will be genuinely unpleasant to write.
- Deep traversal performance will be worse than a native graph store. Mitigated by depth bounds and denormalisation, but the ceiling is real.
- Some queries (variable-length paths with per-hop predicates) may be inexpressible without procedural code — this is trigger T5, and it firing is a likely outcome rather than a remote risk.
- Risk of building around Postgres's limitations and thereby never noticing that a trigger has effectively fired. Mitigated by a standing quarterly trigger review with recorded measurements.

## Migration Strategy

**Phase 4 build-out** proceeds on Postgres with the reference SoC loaded in staging, so latency measurements are real from the start.

**Trigger review** is a quarterly agenda item with recorded measurements against T1–T5. The review must record the numbers, not a judgement — "impact analysis p95 was 1.8s at depth 5" is a decision input; "seems fine" is not.

**If a trigger fires:**

1. Add a second `GraphWriter` implementation; dual-write both stores.
2. Backfill the new store by event replay (cheap and safe — this is why the projection property matters).
3. Shadow-read: serve from Postgres, execute against the new store, compare results and latency, alert on divergence.
4. Cut over per query type, not wholesale — traversal queries first, since they motivated the move; simple lookups may permanently stay on Postgres.
5. Retire dual-write after a full quarter of clean shadow comparison.

Because the graph is rebuildable, the rollback path at every step is simply "stop reading from the new store."

## Open Questions

1. **Node granularity for nets.** Modelling every net as a node gives 10⁷ nodes per SoC, and most are uninteresting. Should low-fanout internal nets be collapsed or modelled lazily? This choice may dominate scale more than the store choice does.
2. **Corner/mode dimensionality.** Timing paths exist per corner per mode. Separate nodes per corner, or one node with per-corner properties? Affects node count by an order of magnitude.
3. **Revision handling.** Currently a graph per revision with structural sharing via `content_hash`. Whether this holds at hundreds of revisions per project is untested.
4. **Embedding colocation.** Embeddings live in pgvector alongside `graph_nodes` today. A graph store migration would split hybrid retrieval across two systems, complicating the reranking pipeline (Blueprint §18.3). Needs a design before any cutover.
5. **Cross-revision queries.** "When did this module last change?" spans revisions. Whether this is a graph query or a relational one over `design_units` is unresolved; currently relational.

## Related ADRs

- 0002: Relational Graph Modeling — house precedent this decision follows
- 0010: CerebroEDA Multi-Tenancy and Data Isolation — graph isolation requirements
- 0011: Canonical Artifact and Result Identity — finding nodes keyed by signature
