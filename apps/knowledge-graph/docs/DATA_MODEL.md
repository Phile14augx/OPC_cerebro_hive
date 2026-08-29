# Data Model

## Core Domain Entities (Graph Nodes)

The enterprise ontology bootstrap consists of the following primary node labels:

1. **Person**
   - Fields: `employeeId`, `name`, `email`, `role`, `departmentId`
2. **Department**
   - Fields: `departmentId`, `name`, `costCenter`
3. **Product**
   - Fields: `productId`, `name`, `lifecycleStage`
4. **Process**
   - Fields: `processId`, `name`, `ownerId`
5. **Document**
   - Fields: `documentId`, `title`, `url`, `classification`, `lastModified`

## Core Relationships (Graph Edges)

- `(Person)-[:WORKS_IN]->(Department)`
- `(Person)-[:MANAGES]->(Person)`
- `(Person)-[:OWNS]->(Process)`
- `(Process)-[:UTILIZES]->(Product)`
- `(Document)-[:MENTIONS]->(Person|Product|Process)`

## Schema Definition (Apache AGE / Relational Backing)

While primarily a schema-less graph, the structured node definitions are backed by strict validation constraints prior to insertion.

```sql
-- Conceptual backing representation in PostgreSQL
CREATE TABLE ag_catalog.nodes (
    id agtype PRIMARY KEY,
    label name NOT NULL,
    properties agtype,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Retention Policies
- **Active Data:** Kept indefinitely while the entity exists in the source systems.
- **Historical Data:** Deleted nodes are soft-deleted (labeled `Archived`) and hard-deleted after 7 years to comply with enterprise data governance, unless marked under legal hold.

## Privacy Classification
- **Public:** Generic structural data (e.g., Department names).
- **Internal:** Employee directory structures, standard internal process docs.
- **Confidential:** Strategic product planning graphs, pre-release data.
- **Restricted:** Highly sensitive relationships (e.g., HR PIP programs, M&A graphs).
  - *Enforcement:* Restricted nodes are heavily masked via RBAC at the API gateway layer.
