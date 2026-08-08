# 0010: CerebroEDA Multi-Tenancy and Data Isolation

**Decision ID:** D7
**Gates:** Phase 2 (Flow Platform), Phase 6 (Enterprise)
**Date:** 2026-08-01

## Status

Accepted

## Context

CerebroEDA holds the most sensitive asset a fabless semiconductor company owns: unreleased silicon design data. A cross-tenant leak is not a privacy incident to be disclosed and remediated — it is company-ending for the customer and for us. Several target customers additionally hold ITAR/EAR-controlled designs, where a leak is a criminal matter.

This raises the bar above ordinary SaaS multi-tenancy. The isolation model must be defensible to a customer's security team on a whiteboard, not merely correct in code.

Complicating factors specific to this domain:

1. **Seven distinct data planes.** Postgres, object storage, Kafka, the graph store, the vector store, OpenSearch, and Redis. A model that isolates Postgres beautifully and leaks through the vector index has achieved nothing. Cross-tenant leakage through shared embedding indices is a named threat in Blueprint §23.2.
2. **Four deployment topologies.** SaaS multi-tenant, dedicated VPC, on-prem, and air-gapped. The same code must serve all four. In three of them "multi-tenancy" means a single tenant with multiple projects.
3. **Project is the real security boundary.** Within one customer, the SoC team frequently must not see the IP-licensing team's data. Tenant-level isolation alone under-serves the actual requirement.
4. **Compute is the exposure.** Runners execute third-party tool adapters over customer IP. The database isolation model is irrelevant if a runner can reach another tenant's volume.
5. **Export class cuts across tenancy.** A single tenant may hold both controlled and uncontrolled projects, with different clearances per user. `exportClass` propagates through PDK → project → run → artifact → fact → embedding (Blueprint §23.3).
6. **Operational reality.** 50+ services × N tenants must remain migratable, backup-able, and debuggable by a small team.

## Decision

**We adopt a layered model: shared database with mandatory Postgres Row-Level Security as the default, physical separation available per tenant as a commercial tier, and — non-negotiably — physical isolation in object storage, vector, and compute regardless of tier.**

The governing principle: **isolation strength is proportional to the cost of a leak in that plane, not uniform across planes.**

### Per-plane decisions

| Plane | Isolation mechanism | Rationale |
|---|---|---|
| Postgres | RLS on every tenant-scoped table, forced on all roles | Strong, database-enforced, operationally tractable |
| Object storage | Bucket (or top-level prefix) per tenant + separate KMS key per tenant | Bulk data; a path-construction bug must not be sufficient to leak |
| Vector store | Separate collection per tenant — never a shared index with a filter | Filter-based isolation in ANN indices is a documented leak class |
| Graph store | Database per tenant (Neo4j) or RLS-backed schema (Postgres phase) | Traversals cross rows freely; per-query filtering is too easy to omit |
| Kafka | Topic ACLs by `tenantid`; consumer groups scoped per tenant | Broker-level enforcement, not application-level |
| OpenSearch | Index per tenant, alias-routed | Same reasoning as vector |
| Redis | Key prefix + logical DB per tenant; separate instance for enterprise tier | Cache poisoning is lower impact but non-zero |
| Compute | Namespace per tenant, dedicated node pools for enterprise, deny-all NetworkPolicy | Highest-exposure plane |
| Temporal | Namespace per tenant | Aligns with ADR 0009 open question 2 |

**Where we deliberately spent isolation strength: vector, object storage, and compute.** Where we deliberately economised: Postgres and Redis, because RLS is genuinely database-enforced and the operational cost of database-per-tenant across nine services is unaffordable for a small team.

### RLS implementation

Every tenant-scoped table carries a non-null `org_id`, and RLS is `FORCE`d so that even the table owner is subject to policy:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects
  USING (org_id = current_setting('app.current_org', true))
  WITH CHECK (org_id = current_setting('app.current_org', true));
```

Three supporting rules make this real rather than decorative:

1. **The application role is never a superuser and never owns the tables.** Superusers and owners bypass RLS unless forced; we do both — non-owner role *and* `FORCE`.
2. **`app.current_org` is set by connection middleware from the verified request context, inside the transaction, and never from a client-supplied value.** A request without a resolved tenant does not get a connection.
3. **A migration test asserts that every table with an `org_id` column has an enabled policy.** This runs in CI and fails the build. The failure mode this prevents — a new table added without a policy — is otherwise inevitable and silent.

### Authorisation model

RLS is the *containment* mechanism, not the authorisation model. Authorisation is ReBAC via `HiveIdentity`:

```
org ──owns──▶ project ──contains──▶ repository | flow | run | artifact
 │                │
 └─ member        └─ role: viewer | engineer | maintainer | owner

grants: (subject, relation, object)
  user:alice   #engineer    project:soc-top
  team:pd      #maintainer  project:soc-top
  user:bob     #viewer      project:soc-top  (export_class: none only)
```

Defence in depth, in order: gateway resolves tenant → service checks ReBAC permission → RLS contains the query → storage-layer keys and namespaces contain the bulk data. **Any single layer failing must not produce a leak.** RLS exists precisely because the application-layer check will eventually be forgotten in some code path.

### Export control overlay

`export_class` is a second, orthogonal dimension enforced at the query layer:

```sql
CREATE POLICY export_clearance ON artifacts
  USING (
    org_id = current_setting('app.current_org', true)
    AND export_class = ANY(string_to_array(current_setting('app.clearances', true), ','))
  );
```

Controlled results are filtered out of query results, not hidden in the UI — an uncleared user's search returns nothing, with no indication that something was withheld beyond a generic notice, because result-count leakage is itself disclosure.

### Tenancy tiers

| Tier | Postgres | Storage | Vector | Compute | Temporal |
|---|---|---|---|---|---|
| Standard (SaaS) | Shared + RLS | Bucket/tenant | Collection/tenant | Namespace/tenant | Namespace/tenant |
| Enterprise | Dedicated DB | Bucket + CMK | Dedicated instance | Dedicated node pool | Namespace/tenant |
| Dedicated VPC / On-prem | Single tenant | Single tenant | Single tenant | Customer estate | Single namespace |
| Air-gapped | Single tenant | Single tenant | Single tenant | Customer estate | Single namespace |

The critical property: **the same code runs in all tiers.** Tier is a deployment configuration binding different connection strings and namespaces. There is no `if (enterprise)` branch in application logic, because such branches guarantee that the less-tested path is the one protecting the most sensitive customer.

## Alternatives Considered

**Shared database, application-level filtering only.**
Rejected. This is the model behind a significant share of real-world cross-tenant breaches. It requires every developer to remember a `WHERE org_id = ?` in every query forever, including in ad-hoc reports, migration scripts, and debugging sessions. The failure is silent and the blast radius is total.

**Schema-per-tenant.**
Rejected, though it is the most seriously considered alternative. Clean logical isolation and simple per-tenant backup. But migrations must run across N schemas — at 500 tenants and 9 services, a migration is 4,500 executions with partial-failure semantics; connection pooling degrades badly with schema switching; and cross-tenant operational queries ("which tenants are affected by this bug") become unions over hundreds of schemas. It trades a manageable risk for an unmanageable operational burden.

**Database-per-tenant for all tenants.**
Rejected as a default, adopted for the Enterprise tier. Strongest isolation, unaffordable operationally at SaaS scale for a small team. Offering it as a tier lets customers who need it pay for it, which is also the correct commercial alignment — the customers demanding it are the ones with budget.

**Shared vector index with metadata filtering.**
Rejected explicitly and emphatically. This is the single most likely leak vector in an AI-native platform. ANN search is approximate by construction; filters are applied by different engines at different stages (pre-filter, post-filter, or during traversal); a post-filtered HNSW search that returns fewer results than `k` has already traversed and scored other tenants' vectors. Embedding inversion research further shows vectors are not a safe abstraction over their source text. Collection-per-tenant costs memory. We pay it.

**Cell-based / pod architecture.**
Deferred, not rejected. Assigning tenants to isolated infrastructure cells is the right answer above roughly 1,000 tenants and gives excellent blast-radius control. It is premature now and the RLS model does not preclude it — a cell is a deployment of this same architecture.

## Consequences

**Positive**

- Database-enforced containment that survives application bugs.
- One codebase across four topologies.
- Commercially aligned tiering: stronger isolation is a legitimate upsell rather than a cost centre.
- Export control becomes mechanical and testable rather than procedural.
- The model is explicable to a customer security team in one diagram, which materially shortens enterprise sales cycles.

**Negative**

- RLS carries a measurable query cost (typically 3–8% on indexed queries, worse on some plan shapes). Mitigated by including `org_id` as the leading column in composite indexes on hot tables.
- `current_setting` must be established per transaction. A connection returned to the pool with stale settings is a genuine leak path — mitigated by resetting in the pool's release hook and asserting the setting at transaction start.
- Collection-per-tenant in the vector store has a fixed memory floor per tenant, making very small tenants disproportionately expensive.
- Enterprise-tier tenants fragment the migration process. Accepted: they are few, high-value, and their maintenance windows are negotiated anyway.

**Neutral**

- Bucket-per-tenant may hit cloud account bucket limits at scale, requiring prefix-per-tenant within sharded buckets. The `storage_uri` indirection in `blobs` makes this a configuration change.

## Migration Strategy

**Greenfield.** This ADR is adopted before Phase 2, so there is no retrofit. That timing is the entire point of writing it now — retrofitting RLS onto a live multi-tenant schema means auditing every query in the system under production pressure.

**Enforcement in CI.**

1. Migration lint: any table with an `org_id` column and no `FORCE ROW LEVEL SECURITY` fails the build.
2. Integration test: for each service, a test asserts that a query under tenant A's context returns zero rows seeded under tenant B. This runs against every tenant-scoped table, generated from the schema rather than hand-written, so new tables are covered automatically.
3. Storage test: presigned URL generation for tenant A's artifact under tenant B's context must fail.
4. Vector test: retrieval under tenant A must never return tenant B's chunks, asserted with adversarially near-identical embeddings — the naive test with dissimilar vectors passes even when isolation is broken.

**Standard → Enterprise promotion.** Logical replication of the tenant's rows into a dedicated database, storage bucket copy with re-encryption under the customer-managed key, vector collection rebuild by replay (cheap — the graph and embeddings are projections, per Blueprint §7.1), then cutover with a brief write freeze. Rehearsed in staging before first commercial use.

**Air-gap.** Single-tenant deployment sets `app.current_org` to a fixed value. RLS remains enabled — it costs almost nothing there and keeps the code path identical to SaaS, which is what makes the SaaS path trustworthy.

## Open Questions

1. **Sub-tenant RLS for projects.** Should RLS enforce project scope in addition to org scope? Currently project-level authorisation is ReBAC-only. Arguments for: it is the boundary customers actually care about internally. Arguments against: policy complexity and index pressure. Proposed: revisit after Phase 3 with real query patterns; the schema does not preclude it.
2. **Per-tenant encryption keys in Postgres.** Currently one KMS key per tenant for object storage, but shared encryption at rest for Postgres. Per-tenant column encryption for the most sensitive metadata is possible but complicates indexing severely. Deferred to Phase 6.
3. **Kafka tenancy at scale.** Topic-per-tenant does not scale past a few hundred tenants (partition count explosion). Current model is shared topics with `tenantid` ACLs and partition keys. The point at which this needs to become cluster-per-tenant-tier is unmeasured.
4. **Noisy neighbour.** RLS contains data but not resource consumption. Per-tenant query cost accounting and throttling is unspecified. Related to Blueprint §24 (cost model).
5. **Cell architecture threshold.** At what tenant count does cell-based deployment become correct? Needs a modelled answer before we pass 300 tenants.

## Related ADRs

- 0009: CerebroEDA Workflow Substrate — Temporal namespace strategy resolved here
- 0011: Canonical Artifact and Result Identity — signatures are tenant-scoped
- 0012: CerebroEDA Knowledge Graph Store — graph isolation model
- 0013: CerebroEDA Runner Isolation — compute-plane enforcement
