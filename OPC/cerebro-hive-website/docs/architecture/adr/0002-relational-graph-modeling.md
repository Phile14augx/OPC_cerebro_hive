# 0002: Relational Graph Modeling

## Status
Accepted

## Context
The AI OS manages complex entities (Workspaces, Projects, Agents, Workflows, Evaluations) with highly interrelated connections. We need a way to traverse these relationships (e.g., "Find all evaluation runs for agents in this workspace").

## Decision
We will model the underlying domain graph relationally using PostgreSQL and Prisma, while exposing a generic Graph Traversal API via `@cerebro/domain-graph`.

## Alternatives Considered
- **Native Graph Database (Neo4j, ArangoDB)**: Rejected for the current phase to avoid operational complexity. We will project relationships in memory via the `DomainGraph` package.
- **Document Store (MongoDB)**: Rejected because relationships are first-class citizens in our domain.

## Consequences
- **Positive**: We leverage existing relational database infrastructure and Prisma schemas.
- **Negative**: Deep recursive queries (N+1) might require optimization or a future migration to a true graph DB if traversal depths become massive.

## Implementation Notes
- `@cerebro/domain-graph` abstracts `Nodes` and `Edges` to shield applications from SQL joins.

## Related ADRs
None
