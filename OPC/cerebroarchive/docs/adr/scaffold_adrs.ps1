$adrs = @(
    @{ Name = "0001-database-first-domain-driven-design.md"; Title = "1. Database-First Domain-Driven Design" }
    @{ Name = "0002-go-sqlc-repository-layer.md"; Title = "2. Go + SQLC Repository Layer" }
    @{ Name = "0003-postgres-multi-schema.md"; Title = "3. PostgreSQL Multi-Schema Architecture" }
    @{ Name = "0004-uuid-strategy.md"; Title = "4. UUID v7 Strategy" }
    @{ Name = "0005-migration-policy.md"; Title = "5. Database Migration Policy (golang-migrate)" }
    @{ Name = "0006-multi-tenancy.md"; Title = "6. Multi-Tenancy Hierarchy (Org -> Workspace -> Team)" }
    @{ Name = "0007-database-naming-standards.md"; Title = "7. Database Naming Standards" }
    @{ Name = "0008-soft-delete-policy.md"; Title = "8. Soft Delete and Audit Policy" }
    @{ Name = "0009-search-architecture.md"; Title = "9. Search Architecture Progression" }
    @{ Name = "0010-event-driven-architecture.md"; Title = "10. Event-Driven Architecture and Outbox Pattern" }
    @{ Name = "0011-storage-strategy.md"; Title = "11. Storage Strategy (Object Storage vs Database)" }
    @{ Name = "0012-ai-memory-architecture.md"; Title = "12. AI Memory and Vector Architecture" }
)

foreach ($adr in $adrs) {
    $content = @"
# ADR $($adr.Title)

## Status
Proposed

## Context
Provide the context for this architectural decision. What is the problem we are trying to solve?

## Decision
Describe the decision clearly.

## Consequences
What becomes easier or more difficult because of this change?
"@
    Set-Content -Path $adr.Name -Value $content
}
