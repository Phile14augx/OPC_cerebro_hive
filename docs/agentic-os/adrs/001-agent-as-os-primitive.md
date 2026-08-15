# ADR-001: Agent as First-Class OS Primitive

**Status**: Accepted  
**Date**: 2025-01  
**Author**: Nexarch Platform Team

## Context

Cerebro Nexarch started as a collection of AI assistants and workflow
runners.  Agents were represented as `{ prompt, model, tools }` without
persistent identity, lifecycle management, resource accounting, or
governance.

This created several problems:
- No way to pause, resume, or introspect a running agent
- No cost attribution below the workspace level
- No delegation semantics between agents
- No approval pathway for high-risk actions
- No audit lineage linking user → mission → agent → tool → result

## Decision

We treat **Agent** as a first-class platform primitive equivalent to a
**process** in a traditional operating system.

An agent is defined by:
1. `AgentDefinition` — immutable blueprint (name, version, capabilities, model policy, budget)
2. `AgentInstance / AgentControlBlock` — mutable runtime record with lifecycle state, usage, delegation chain, checkpoint reference

The Agent Kernel (`packages/kernel-core`) owns all lifecycle transitions
and enforces that no transition occurs outside the defined state machine.

## Consequences

### Positive
- Full lifecycle observability and control (pause/resume/terminate/quarantine)
- Cost attribution at the execution-run level
- Auditable delegation chains (who spawned what, with which scope)
- Human-in-the-loop approval for policy-triggered actions
- Watchdog can detect and terminate runaway agents automatically

### Negative
- Additional schema surface area compared to ad-hoc agents
- Developers must register AgentDefinitions before spawning instances

### Neutral
- The existing `packages/agent-ops/src/registry/agent-registry.ts` is
  retained as the TypeScript-level in-memory registry; the new
  `lib/agent-os/store.ts` provides the persistent JSON-backed store for
  the Next.js tier.
