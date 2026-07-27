```yaml
name: services/tool-gateway
language: Go
framework: Gin
entrypoint: main.go
protocol: HTTP, port 8940 (TOOL_GATEWAY_PORT)
deployment: standalone binary (Dockerfile present)
consumes:
  - Redis (rate limiting)
produces:
  - tool registry + execution HTTP API
health: not confirmed — likely under api.RegisterRoutes
owner: unknown
confidence: verified
duplicate: Possible overlap with packages/capabilities/agent-builder's ToolRuntime/ToolRegistry (in-process, TS) — different deployment model (networked Go service vs in-process TS), not proven duplicate, needs a wiring check.
status: >
  Real and well-built: tool registry, executor with adapter registration, Redis-backed rate limiter, graceful shutdown. NOT found in services/gateway's proxy route table — production wiring unconfirmed.
notes: >
  Comment in main.go explicitly calls this "the HiveSwarm tool-gateway" — same product family as agent-runner, planner-service, swarm-api, router-service (see notes on those).
```
