# Database Migration Reset - Investigation Summary

## Problem Statement
The Prisma migration history in `packages/database/prisma/migrations/` targets an obsolete domain model (Organization-based) that no longer matches the current Tenant-based architecture with 111 models.

## Investigation Results

### Schema Evolution
- **Old model**: Organization-based multi-tenancy
- **Current model**: Tenant-based multi-tenancy with:
  - 111 Prisma models
  - pgvector extension for AI embeddings
  - Extensive Forge models (Repository, Branch, Commit, Module, etc.)

### Root Cause
The migrations were generated for an earlier version of the schema and were never regenerated after the complete refactoring. The migration chain attempts to ALTER tables that don't exist in the current schema.

### Error Evidence
```
Error: The underlying table for model `Module` does not exist.
Error: relation "Module" does not exist
```

## Resolution Plan

### Prerequisites Verified
- ✅ Prisma schema validated successfully
- ✅ PostgreSQL with pgvector extension available (`pgvector/pgvector:pg16`)
- ✅ Development database running on port 5433
- ✅ Backup tag created: `pre-baseline-migration`
- ✅ `_prisma_migrations` table does NOT exist (database is clean)
- ✅ All migration directories in `./migrations/` are empty

### Database Verification
```sql
-- Verified via Docker exec:
SELECT count(*) FROM _prisma_migrations;
-- Result: ERROR: relation "_prisma_migrations" does not exist
```

This confirms the database was successfully reset via `prisma db push --force-reset`.

### Solution
Generate a new baseline migration from the current `schema.prisma`:

```bash
# From packages/database directory
npx prisma migrate dev --name initial_baseline
```

### Expected Outcome
- Creates `20260802000000_initial_baseline/` migration directory
- Contains CREATE TABLE statements for all 111 models
- Includes enums, indexes, constraints, foreign keys
- Can be verified with `prisma migrate deploy` and `prisma migrate reset`

## Archive Reference
Legacy migration history was originally located at:
`docs/archive/prisma-migrations-legacy/`

## Next Steps
1. Run baseline generation in Docker environment with pgvector
2. Verify generated migration SQL
3. Test with `prisma migrate deploy` on clean database
4. Run full CI pipeline to confirm
5. Commit as single PR with documentation