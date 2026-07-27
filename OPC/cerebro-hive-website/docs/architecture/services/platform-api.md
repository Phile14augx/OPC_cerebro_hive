```yaml
name: apps/platform-api
language: TypeScript
framework: Fastify
entrypoint: src/server.ts
protocol: HTTP
deployment: standalone Node process
consumes:
  - packages/ai-gateway
  - packages/runtime-core
  - packages/capabilities/agent-builder
  - packages/database
produces:
  - /api/v1/agents
  - /api/v1/conversations
health: not yet added (flagged in M25 review)
owner: unknown
confidence: verified
duplicate: None known.
status: >
  Real, built/verified this session (M10.1-M25). Reached via services/gateway's /api/v1/workflows, /api/v1/agents, /api/v1/knowledge proxy routes.
notes: >
  (none)
```
