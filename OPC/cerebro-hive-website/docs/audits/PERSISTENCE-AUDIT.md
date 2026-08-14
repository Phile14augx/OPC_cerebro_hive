# Persistence Audit

**Date:** 2026-08-13

## What exists and is used

| Model | Package | Used by |
|---|---|---|
| Tenant, Workspace, User, Role, Permission | `packages/db` | platform-api org/workspace paths (partial) |
| Project, Repository, ForgeSession, GeneratedArtifact | `packages/db` | forge-api |
| Agent, Workflow, DigitalTwin | `packages/db` | platform-api / Twin Studio |
| AuditLog | `packages/db` | platform-api |

## Added Day 1 (schema only — no worker yet)

| Model | Purpose | UI/API |
|---|---|---|
| `PlatformJob` / `PlatformJobLog` | Durable job states and streamed logs | Not wired; Runtime UI is a placeholder |
| `ArchitectureGraph` / `ArchitectureGraphVersion` | Day 2 Architecture Studio | Schema ready |
| `ProjectSpecificationRecord` | Typed generation specs | Schema ready |

Migration: `packages/db/prisma/migrations/20260813120000_platform_jobs_and_architecture/`.

## Broken / dropped

| Area | Evidence | Current behavior |
|---|---|---|
| Talent OS tables | Dropped in `20260802172339_initial_baseline` | APIs return 401/501; execution throws |
| Feature flags | DB model exists | Runtime defaults in-memory `false` |
| Twin tenant | Header-derived | Spoofable; not a Day 1 schema fix |

## Local database

Compose Postgres is commonly published on **5433** on this machine. `.env.example` still documents `localhost:5432` as the generic template. Operators must match the port that `docker compose` actually binds.
