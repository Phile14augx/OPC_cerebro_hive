```yaml
name: services/router-service
language: Go
framework: unread HTTP framework
entrypoint: main.go
protocol: HTTP
deployment: standalone binary (Dockerfile present)
consumes:
  - internal registry (services/router-service/internal/registry)
produces:
  - agent selection / routing decisions
health: not yet confirmed
owner: unknown
confidence: verified
duplicate: This is agent-selection routing (which agent instance handles a task), not LLM-provider routing — distinct from packages/ai-gateway. Part of the HiveSwarm cluster.
status: >
  Real and well-designed: weighted composite scoring (proficiency 40%, load 30%, cost 20%, latency 10%) to pick the best available agent for a capability, with hard filters on cost/latency ceilings and an affinity bonus for a preferred agent.
notes: >
  (none)
```
