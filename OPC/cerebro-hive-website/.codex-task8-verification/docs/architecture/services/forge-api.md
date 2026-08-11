```yaml
name: services/forge-api
language: TypeScript
framework: unread (NestJS-shaped: *Controller/*Module/*Service names seen)
entrypoint: unread
protocol: HTTP
deployment: standalone Node process
consumes:
  - @cerebro/auth
  - @cerebro/config
  - @cerebro/db
  - @cerebro/ai
  - @cerebro/workflow
produces:
  - unread
health: not yet confirmed
owner: unknown
confidence: inventory
duplicate: None known.
status: >
  48 files, only 1 scaffold-pattern hit (codegen.service.ts) — likely mostly real. Reached via services/gateway's /api/v1/forge. Not deep-read.
notes: >
  Declares AgentOrchestratorService, PlannerController/Module/Service — worth checking against the HiveSwarm planner/orchestrator cluster below.
```
