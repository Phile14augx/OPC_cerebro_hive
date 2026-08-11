# Chapter 1 — System Vision & Architecture

> Status key used throughout this spec: ✅ built and tested in `agentos/` today · 🟡 partially
> built (interface real, implementation simplified) · ⬜ target architecture, not yet built.

## 1.1 Vision

AgentOS is an operating system for AI workers, not an agent framework. The distinction that
matters: a framework gives you primitives to wire up one agent's loop (LangGraph, CrewAI). An
operating system gives every agent in the organization — regardless of which team built it —
identity, memory, permissions, tools, governance, and observability *for free*, the same way a
process on Linux gets a PID, a memory space, file descriptors, and a scheduler entry without the
application author writing any of that themselves.

The test for whether AgentOS is doing its job: a new agent should be mostly *configuration*
(what goal, what tools, what memory profile, what governance category) rather than
*infrastructure* (how do I trace this, how do I get human approval, how do I make this agent
talk to that other agent).

## 1.2 Non-goals

Explicit non-goals, because scope creep is the main risk to a project this size:

- AgentOS is not a model. It orchestrates calls to LLM providers; it does not train or host one.
- AgentOS is not a replacement for the customer's systems of record (ERP, CRM). It is the layer
  that lets agents read and act on those systems safely.
- AgentOS does not aim to support every conceivable agent framework's wire format. It aims to be
  the substrate other frameworks could be ported *onto* (see §1.6).

## 1.3 Non-functional requirements

| Requirement | Target | Current MVP reality |
|---|---|---|
| Cold-start (laptop, zero infra) | Runs with no external services | ✅ SQLite + mock LLM, `uvicorn app.main:app` |
| Horizontal scale | Thousands of concurrent agents | ⬜ single-process FastAPI; no worker pool yet |
| Durability of in-flight work | Survives process restart mid-workflow | 🟡 workflow/run state persisted to DB; no crash-recovery reconciler yet |
| Multi-tenancy | Hard isolation between orgs | ⬜ no `organization_id` scoping enforced yet (see Ch. 3, Ch. 13) |
| Latency (kernel overhead, excl. LLM call) | < 50ms p99 per step | ✅ observed sub-millisecond per span locally (mock provider; real LLM calls dominate latency in practice) |
| Auditability | Every agent action traceable to an actor and a policy decision | ✅ TraceSpan + EventLogEntry + AuditLog rows for every run |
| Governance | No agent action bypasses policy evaluation | ✅ `runtime.execute` always calls `governance_engine.evaluate` before the first step |

## 1.4 Architecture principles

1. **Governance runs before execution, not after.** A run that requires approval never calls a
   tool or an LLM before a human signs off — enforced structurally in `runtime.execute` (Ch. 5),
   not by convention.
2. **Every subsystem is an interface first, an implementation second.** The Tool Framework,
   Communication Bus, Workflow Engine, etc. are named boundaries so that swapping SQLite for
   Postgres, or the in-process bus for NATS, is an adapter change behind an existing call shape,
   not a rewrite of call sites. Chapter 20 enumerates every planned swap.
3. **Multi-agent collaboration is real delegation, not a linear script pretending to be agents.**
   The Agent Mesh (`agent` / `agent_vote` workflow nodes, Ch. 10) calls another agent's *entire*
   runtime — its own governance, its own planner, its own tools — rather than inlining a second
   prompt into the first agent's loop.
4. **Observability is structural, not bolted on.** Every step of `runtime.execute` is wrapped in
   an `observability.span()` context manager (Ch. 15); there is no code path that executes a
   tool or LLM call outside of a span.
5. **The kernel is provider-agnostic.** No part of the planner, scheduler, memory engine, or
   workflow engine imports a specific LLM SDK directly — everything goes through the LLM Gateway
   (Ch. 5), so adding a provider never touches orchestration code.

## 1.5 The five-layer model

```
┌─────────────────────────────────────────────────────────┐
│ Layer 5 — Applications           Industry solution packs,│
│                                   marketplace installs,   │
│                                   SDKs                    │
├─────────────────────────────────────────────────────────┤
│ Layer 4 — Agent Framework        Multi-agent mesh,        │
│                                   planning strategies,    │
│                                   reasoning modes, HITL    │
├─────────────────────────────────────────────────────────┤
│ Layer 3 — Agent Runtime Kernel   Scheduler, workflow      │
│                                   engine, event bus,      │
│                                   context assembly        │
├─────────────────────────────────────────────────────────┤
│ Layer 2 — Intelligence Platform  Memory, knowledge/RAG,   │
│                                   LLM gateway, prompts,   │
│                                   guardrails, evaluation  │
├─────────────────────────────────────────────────────────┤
│ Layer 1 — Infrastructure         Tools, deployment,       │
│                                   observability,          │
│                                   governance, digital twin│
└─────────────────────────────────────────────────────────┘
```

This is the same pyramid presented on the CerebroHive website's `/products/agentos` page
(`components/products/agentos/AgentOSPyramid.tsx`) — the marketing page and this spec describe
one system, not two.

## 1.6 What exists today vs. what this spec covers

`agentos/` as committed is a **Phase 1 MVP**: every layer above has a real, tested, working
slice — not a mock, not a diagram — but at prototype scale (SQLite, a deterministic mock LLM
provider by default, a single FastAPI process, no multi-tenant isolation). The
[README](../../README.md) has the authoritative up-to-date status table; this spec's later
chapters go bounded-context by bounded-context into what a production-grade version of each slice
looks like — schemas, package layouts, algorithms — building on top of, not replacing, the
working code that's already there.

## 1.7 Chapter map

| # | Chapter | Depends on |
|---|---|---|
| 2 | Domain-Driven Design & bounded contexts | Ch. 1 |
| 3 | PostgreSQL schema | Ch. 2 |
| 4 | Go backend architecture | Ch. 3 |
| 5 | Agent Runtime Kernel internals | Ch. 3, 4 |
| 6 | Planner & Reasoning Engine | Ch. 5 |
| 7 | Memory System | Ch. 3, 5 |
| 8 | Knowledge Platform | Ch. 3, 7 |
| 9 | Tool Execution Framework & MCP | Ch. 4, 5 |
| 10 | Multi-Agent Orchestrator (Agent Mesh) | Ch. 5, 6, 9 |
| 11 | Workflow Engine | Ch. 5, 10 |
| 12 | Event Bus & messaging | Ch. 4, 11 |
| 13 | Security, auth, secrets | Ch. 3, 4 |
| 14 | Governance & policy engine | Ch. 5, 13 |
| 15 | Observability & evaluation | Ch. 5, 12 |
| 16 | Frontend / control center dashboard | Ch. 4, 15 |
| 17 | Deployment & Kubernetes | Ch. 4 |
| 18 | SDK | Ch. 4, 9 |
| 19 | Marketplace & billing | Ch. 3, 18 |
| 20 | Production roadmap & milestones | all |

Each subsequent chapter will open with the same "today vs. target" framing as §1.6 — concrete
about what's already running in `agentos/`, explicit about the gap to the target architecture, so
the spec stays a real engineering document rather than an aspirational one.
