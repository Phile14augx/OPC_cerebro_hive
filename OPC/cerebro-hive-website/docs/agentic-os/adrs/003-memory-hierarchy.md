# ADR-003: Hierarchical Agent Memory (L0–L6)

**Status**: Accepted  
**Date**: 2025-01  
**Author**: Nexarch Platform Team

## Context

Agent memory was previously either "put everything in a vector database"
or "pass the full conversation history to the model on every call".
Neither approach is scalable, secure, or semantically meaningful.

## Decision

We implement a seven-tier memory hierarchy in `packages/memory-sdk`:

| Level | Name         | Characteristics                        |
|-------|--------------|----------------------------------------|
| L0    | Active       | Current model context window           |
| L1    | Working      | Current mission/task state             |
| L2    | Episodic     | Past actions, tool calls, outcomes     |
| L3    | Semantic     | Facts, knowledge, learned information  |
| L4    | Procedural   | Skills, workflows, patterns            |
| L5    | Organizational| Approved institutional knowledge      |
| L6    | Archive      | Compliance-retained historical records |

Each `MemoryRecord` carries:
- `tenantId` + `workspaceId` (tenant isolation)
- `agentId` (ownership)
- `missionId` / `taskId` (lineage)
- `sensitivity` (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED / SECRET)
- `expiresAt` (TTL for L0/L1 records)
- `embedding` (vector for semantic retrieval)

## Consequences

### Positive
- Context assembly is deliberate rather than ad-hoc
- Token budgets are respected by promoting only relevant memories
- Cross-tenant leakage is prevented at the record level
- Compliance teams can query L6 for specific time ranges

### Negative
- Requires `packages/memory-sdk` to be wired into the agent runner
- Vector retrieval (L3/L4) requires a vector store (pgvector / Qdrant)

### Current State

The development tier uses an in-memory `MemoryManager`.  The
`packages/memory-sdk/src/memory-manager.ts` is designed as a
provider-agnostic façade; swapping to pgvector requires only a new
`IMemoryBackend` implementation.
