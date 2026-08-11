```yaml
name: packages/capabilities/agent-builder
language: TypeScript
framework: none (plain library)
entrypoint: index.ts (AgentRuntimeService)
protocol: in-process (imported by apps/platform-api)
deployment: bundled into apps/platform-api
consumes:
  - packages/runtime-core (RuntimeRegistry)
  - packages/database
  - packages/domain
produces:
  - execute() — single-agent conversation turns
health: n/a (library)
owner: unknown
confidence: verified
duplicate: Probably a different responsibility from the HiveSwarm cluster (single conversational agent vs. multi-agent orchestrated swarm) rather than a true duplicate — needs a product-level confirmation, not just a code-level one.
status: >
  Real, built/verified this session (M10.1-M25). Handles single-agent conversational execution with tool-calling scaffolding (tool-calling itself still hardcoded off).
notes: >
  (none)
```
