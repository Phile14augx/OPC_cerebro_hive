```yaml
name: services/temporal-worker
language: TypeScript
framework: @temporalio/worker
entrypoint: src/worker.ts
protocol: Temporal gRPC (internal to Temporal SDK)
deployment: standalone Node process (Temporal worker)
consumes:
  - @cerebro/config
  - Temporal server
produces:
  - registered workflows + activities
health: n/a (worker process, not HTTP)
owner: unknown
confidence: verified
duplicate: See Workflow cluster in RESPONSIBILITY-MATRIX.md — likely the canonical pairing is capabilities/workflow + this worker, with packages/workflow as the thing to migrate off of, but not yet 100% confirmed.
status: >
  Real, genuine Temporal.io worker — real task queue config, concurrency limits, workflow/activity registration. Strongly suggests this is the runtime companion to packages/capabilities/workflow (which declares real @temporalio/client + @temporalio/workflow deps) rather than packages/workflow (zero deps, currently wired into forge-api/studio).
notes: >
  (none)
```
