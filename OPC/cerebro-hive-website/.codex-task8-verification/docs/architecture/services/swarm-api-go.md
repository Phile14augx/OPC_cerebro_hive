```yaml
name: services/swarm-api
language: Go
framework: unread HTTP framework + NATS + Redis
entrypoint: main.go
protocol: HTTP + WebSocket
deployment: standalone binary (Dockerfile present)
consumes:
  - NATS (pub/sub)
  - Redis (agent/task store)
produces:
  - goal handlers, agent/task domain API, websocket stream
health: not yet confirmed
owner: unknown
confidence: structural
duplicate: Relationship to services/swarm-runtime (TS: AgentRegistry/DecisionEngine/ExecutionEngine/PlannerService/ReflectionEngine) unconfirmed — could be swarm-api (Go, HTTP/WS layer) fronting swarm-runtime (TS, execution logic), or two independent implementations. Needs a read.
status: >
  Real and substantial: domain models for agent/task, NATS publisher, two Redis-backed stores, websocket handler. Not deep-read past file structure + imports.
notes: >
  Part of the HiveSwarm cluster.
```
