```yaml
name: services/agent-runner
language: Python
framework: unread (pyproject.toml present)
entrypoint: src/agent_runner/main.py
protocol: unread
deployment: standalone Python process (Dockerfile present)
consumes:
  - LLM via llm.py
produces:
  - orchestration results
health: not yet confirmed
owner: unknown
confidence: verified
duplicate: Likely NOT a duplicate of packages/capabilities/agent-builder (single-agent chat conversations) — this looks like a separate, more complex multi-agent orchestration product ("HiveSwarm"). Production wiring (is this deployed/reachable?) not yet confirmed.
status: >
  Real, mature multi-agent orchestrator. OrchestratorAgent decomposes objectives into steps, assigns to Research/Coding/Critique specialist agents, has a full plan→execute→observe→reflect lifecycle. Explicitly named "HiveSwarm" in its own system prompt.
notes: >
  Part of a naming-confirmed "HiveSwarm" cluster alongside tool-gateway, planner-service, swarm-api, router-service, and probably services/swarm-runtime (TS).
```
