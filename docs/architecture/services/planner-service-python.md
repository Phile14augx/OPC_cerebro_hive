```yaml
name: services/planner-service
language: Python
framework: LangGraph + LangChain (Anthropic/OpenAI)
entrypoint: src/planner/main.py (core logic in graph.py)
protocol: unread
deployment: standalone Python process (Dockerfile present)
consumes:
  - Anthropic API or OpenAI API (configurable)
produces:
  - TaskDAG (goal decomposition graph)
health: not yet confirmed
owner: unknown
confidence: verified
duplicate: Directly overlaps in responsibility with packages/runtime-core's SequentialPlanner/ReActPlanner/MetaPlanner and the now-deleted apps/platform RuntimePlanner scaffold. This is the most mature "planner" implementation found in the entire audit — should be a strong candidate for canonical, pending a wiring check.
status: >
  Real and sophisticated: LangGraph state machine (decompose -> validate -> fix -> finalize), cycle detection via DFS, structural validation, max-2-retry self-correction loop. A _MockLLM exists but is explicitly and only used when no real provider is configured (dev/test), not masquerading as production.
notes: >
  Part of the HiveSwarm cluster.
```
