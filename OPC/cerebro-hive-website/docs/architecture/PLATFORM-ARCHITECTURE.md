# Platform Architecture

CerebroHive is a **control plane** plus a **polyglot generation/execution plane**. The core app must not become a mixture of every language.

```text
Web Application (Studio :3401, other apps)
      ↓
Platform API / BFF (Fastify :3406) + Forge API (Nest :4005)
      ↓
Control Plane
      ├── Workspace / Project / Tenant (Prisma)
      ├── Technology Registry (@cerebro/plugin-sdk)
      ├── Job / JobLog (PlatformJob)
      ├── ArchitectureGraph (+ versions)
      └── Plugin / adapter contracts
           ↓
       Job/Worker Plane (Temporal/BullMQ/NATS — partial)
```

## What exists today

- pnpm 9 + Turbo 2 monorepo: `apps/*`, `packages/*`, `services/*`
- Prisma schema with Tenant, Workspace, User, Project, Repository, Agent, Workflow, DigitalTwin
- Studio catch-all so `/app/*` nav never hard-404s
- Forge 9 tools talking to forge-api
- Docker Compose local stack with core and `obs` profiles

## Day 1 additions

- `TechnologyRegistry` and adapter interfaces in `@cerebro/plugin-sdk`
- `PlatformJob`, `ArchitectureGraph`, `ProjectSpecificationRecord` models + migration
- Honest UI for unimplemented actions
- Canonical env names in `.env.example`

## Ports (local)

| Service | Port |
|---|---|
| Studio | 3401 |
| platform-api | 3406 |
| forge-api | 4005 |
| Postgres (compose) | 5433 typical on this machine |
