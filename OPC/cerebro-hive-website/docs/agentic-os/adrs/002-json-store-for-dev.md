# ADR-002: JSON File Store for Development Tier

**Status**: Accepted  
**Date**: 2025-01  
**Author**: Nexarch Platform Team

## Context

The existing Next.js application uses `data/db.json` with a `withLock`
write-serialisation pattern as its development persistence layer.  The
Next.js app is built with `output: "export"` for marketing pages but the
`/api/*` and dynamic routes use `force-dynamic`.

## Decision

The Nexarch Agentic OS API (`app/api/nexarch/`) uses the same pattern:
- `lib/agent-os/store.ts` reads/writes `data/agent-os.json`
- `withLock` prevents concurrent write corruption
- `seedDatabase()` auto-populates the file on first access
- All API routes are tagged `export const dynamic = "force-dynamic"`

## Consequences

### Positive
- Zero additional dependencies — no PostgreSQL/Redis required for local dev
- Consistent with existing codebase patterns
- `agent-os.json` is human-readable and easy to inspect

### Negative
- Not suitable for multi-replica production deployment
- No ACID transactions across multiple entities
- File I/O adds latency compared to in-memory

### Migration Path

When moving to production, replace `lib/agent-os/store.ts` with a
Prisma-backed adapter pointing at the existing PostgreSQL instance.
The API route signatures do not change.
